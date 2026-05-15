const fs = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");

const OUT_FILE = "skills-stats.js";
const HH_API_BASE = "https://api.hh.ru";
const USER_AGENT = process.env.HH_USER_AGENT || "prepbase-mvp/0.1 (aim123qqq-cpu@users.noreply.github.com)";
const ACCESS_TOKEN = process.env.HH_ACCESS_TOKEN || "";
const CLIENT_ID = process.env.HH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.HH_CLIENT_SECRET || "";
const SEARCH_QUERIES = splitEnvList(process.env.HH_SEARCH_QUERIES, [
  "Системный аналитик",
  "Бизнес-аналитик",
  "Бизнес аналитик"
]);
const SEARCH_AREA = process.env.HH_AREA || "113";
const SEARCH_FIELDS = splitEnvList(process.env.HH_SEARCH_FIELDS, ["name"]);
const PER_PAGE = clampNumber(process.env.HH_PER_PAGE, 1, 100, 100);
const MAX_SEARCH_PAGES_PER_QUERY = clampNumber(process.env.HH_MAX_SEARCH_PAGES_PER_QUERY, 1, 20, 20);
const MAX_DETAILS = clampNumber(process.env.HH_MAX_DETAILS, 1, 2000, 2000);
const REQUEST_TIMEOUT_MS = clampNumber(process.env.REQUEST_TIMEOUT_MS, 1000, 30000, 12000);
const REQUEST_DELAY_MS = clampNumber(process.env.REQUEST_DELAY_MS, 0, 5000, 250);
const DATE_FROM = parseDateValue(process.env.HH_DATE_FROM || process.env.SINCE_DATE);
let cachedAccessToken = ACCESS_TOKEN;

const FALLBACK_SKILLS = [
  ["SQL", /\bSQL\b|PostgreSQL|MySQL|ClickHouse|Greenplum|MSSQL|Oracle/i],
  ["PostgreSQL", /PostgreSQL|Postgres/i],
  ["ClickHouse", /ClickHouse/i],
  ["Python", /\bPython\b|pandas|numpy|jupyter/i],
  ["Excel", /\bExcel\b|Google Sheets|таблиц/i],
  ["Power BI", /Power\s?BI|DAX|Power Query/i],
  ["Tableau", /Tableau/i],
  ["DataLens", /DataLens|Yandex DataLens/i],
  ["BI", /\bBI\b|Business Intelligence|дашборд/i],
  ["A/B-тесты", /A\/B|AB[-\s]?тест|эксперимент/i],
  ["Метрики", /метрик|KPI|OKR|юнит[-\s]?экономик/i],
  ["Системный анализ", /системн(ый|ого) анализ|system analysis|system analyst/i],
  ["Бизнес-анализ", /бизнес[-\s]?анализ|business analysis|business analyst/i],
  ["ТЗ", /\bТЗ\b|техническ(ое|ого) задан/i],
  ["API", /\bAPI\b|REST|SOAP|GraphQL|Swagger|OpenAPI|Postman/i],
  ["REST API", /\bREST\b|REST API|RESTful/i],
  ["SOAP", /\bSOAP\b/i],
  ["GraphQL", /GraphQL/i],
  ["Swagger/OpenAPI", /Swagger|OpenAPI/i],
  ["Интеграции", /интеграц|Kafka|RabbitMQ|message broker|шина данных/i],
  ["Kafka", /Kafka/i],
  ["RabbitMQ", /RabbitMQ/i],
  ["BPMN", /\bBPMN\b|Camunda/i],
  ["UML", /\bUML\b|ER[-\s]?diagram|диаграмм/i],
  ["Jira", /\bJira\b/i],
  ["Confluence", /Confluence/i],
  ["Agile/Scrum", /Agile|Scrum|Kanban/i],
  ["ETL", /\bETL\b|ELT|Airflow|dbt/i],
  ["DWH", /\bDWH\b|Data Warehouse|хранилищ.*данн/i],
  ["Git", /\bGit\b|GitLab|GitHub/i],
  ["Linux", /\bLinux\b|bash|shell/i],
  ["Английский", /английск|English|Upper[-\s]?Intermediate|B2|C1/i],
  ["Коммуникация", /коммуникац|stakeholder|стейкхолдер|презентац/i]
];

async function main() {
  const seenVacancyIds = new Set();
  const searchStats = [];
  const errors = [];

  for (const query of SEARCH_QUERIES) {
    for (const searchField of SEARCH_FIELDS) {
      const stat = createSearchStat(query, searchField);

      try {
        await collectVacancyIds(query, searchField, seenVacancyIds, stat);
      } catch (error) {
        stat.errors.push(error.message);
        errors.push(`${query}: ${error.message}`);
      }

      searchStats.push(stat);
    }
  }

  const searchPagesFetched = searchStats.reduce((sum, stat) => sum + stat.pagesFetched, 0);
  if (searchPagesFetched === 0 && errors.length) {
    throw new Error(`HH API search failed before collecting vacancies: ${unique(errors).join("; ")}`);
  }

  const totals = new Map();
  const vacancies = [];
  let detailsFetched = 0;

  for (const id of seenVacancyIds) {
    if (detailsFetched >= MAX_DETAILS) break;

    try {
      const vacancy = await fetchVacancyDetails(id);
      detailsFetched += 1;

      if (!vacancy || vacancy.archived) continue;
      const publishedAt = parseDateValue(vacancy.published_at || vacancy.created_at);
      if (DATE_FROM && publishedAt && publishedAt < DATE_FROM) continue;

      const skills = extractSkills(vacancy);
      if (!skills.length) continue;

      const sourceUrl = vacancy.alternate_url || `${HH_API_BASE}/vacancies/${id}`;
      vacancies.push({
        id,
        url: sourceUrl,
        source: "https://api.hh.ru/",
        title: vacancy.name,
        employer: vacancy.employer?.name || null,
        area: vacancy.area?.name || null,
        date: publishedAt ? publishedAt.toISOString() : null,
        skills
      });

      for (const skillName of skills) {
        const skill = getOrCreateSkill(totals, skillName);
        skill.count += 1;
        skill.sources["https://api.hh.ru/"] = (skill.sources["https://api.hh.ru/"] || 0) + 1;
      }
    } catch (error) {
      errors.push(`vacancy ${id}: ${error.message}`);
    }
  }

  const skills = [...totals.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));

  const payload = {
    updatedAt: new Date().toISOString(),
    since: DATE_FROM ? DATE_FROM.toISOString() : null,
    parser: "hh.ru public API",
    api: `${HH_API_BASE}/vacancies`,
    authMode: getAuthMode(),
    queries: SEARCH_QUERIES,
    searchFields: SEARCH_FIELDS,
    area: SEARCH_AREA,
    sources: ["https://api.hh.ru/"],
    totalSearchResults: searchStats.reduce((sum, stat) => sum + stat.found, 0),
    totalVacancies: vacancies.length,
    detailsFetched,
    sourceStats: [
      {
        source: "https://api.hh.ru/",
        name: "hh.ru",
        engine: "public API",
        authMode: getAuthMode(),
        searchQueries: SEARCH_QUERIES.length * SEARCH_FIELDS.length,
        pagesFetched: searchPagesFetched,
        vacancies: vacancies.length,
        errors: unique(errors).slice(0, 20)
      }
    ],
    searchStats,
    skills,
    vacancies,
    errors: unique(errors)
  };

  fs.writeFileSync(OUT_FILE, `window.PREPBASE_SKILL_STATS = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
  console.log(`Parsed ${payload.totalVacancies} hh.ru vacancies and ${payload.skills.length} skills.`);
}

async function collectVacancyIds(query, searchField, seenVacancyIds, stat) {
  for (let page = 0; page < MAX_SEARCH_PAGES_PER_QUERY; page += 1) {
    const data = await fetchJson("/vacancies", {
      text: query,
      search_field: searchField,
      area: SEARCH_AREA,
      per_page: String(PER_PAGE),
      page: String(page)
    });

    stat.pagesFetched += 1;
    stat.found = Math.max(stat.found, Number(data.found || 0));

    for (const item of data.items || []) {
      if (!item.id || seenVacancyIds.has(item.id)) continue;
      seenVacancyIds.add(item.id);
      stat.vacancyIds += 1;
    }

    if (page + 1 >= Number(data.pages || 0)) break;
  }
}

async function fetchVacancyDetails(id) {
  return fetchJson(`/vacancies/${encodeURIComponent(id)}`);
}

async function fetchJson(path, query = {}) {
  await delay(REQUEST_DELAY_MS);

  const url = new URL(path, HH_API_BASE);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const headers = {
      "User-Agent": USER_AGENT,
      "HH-User-Agent": USER_AGENT,
      Accept: "application/json",
      "Accept-Language": "ru,en;q=0.8"
    };

    const accessToken = await getAccessToken();
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

    const response = await fetch(url, {
      signal: controller.signal,
      headers
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}${text ? `: ${text.slice(0, 180)}` : ""}`);
    }

    return response.json();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Request timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function getAccessToken() {
  if (cachedAccessToken) return cachedAccessToken;
  if (!CLIENT_ID || !CLIENT_SECRET) return "";

  cachedAccessToken = await fetchApplicationToken();
  return cachedAccessToken;
}

async function fetchApplicationToken() {
  await delay(REQUEST_DELAY_MS);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  });

  try {
    const response = await fetch(new URL("/token", HH_API_BASE), {
      method: "POST",
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        "HH-User-Agent": USER_AGENT,
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body
    });

    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(`HH token request failed: HTTP ${response.status}${text ? `: ${text.slice(0, 180)}` : ""}`);
    }

    if (!data.access_token) {
      throw new Error("HH token request failed: access_token is missing in response");
    }

    return data.access_token;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("HH token request timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractSkills(vacancy) {
  const skills = new Map();

  for (const item of vacancy.key_skills || []) {
    addSkill(skills, item.name);
  }

  const text = stripHtml([
    vacancy.name,
    vacancy.description,
    vacancy.branded_description,
    vacancy.snippet?.requirement,
    vacancy.snippet?.responsibility
  ].filter(Boolean).join(" "));

  for (const [name, pattern] of FALLBACK_SKILLS) {
    if (pattern.test(text)) addSkill(skills, name);
  }

  return [...skills.values()].sort((a, b) => a.localeCompare(b, "ru"));
}

function addSkill(map, value) {
  const name = canonicalSkillName(value);
  if (!name) return;
  map.set(name.toLowerCase(), name);
}

function getOrCreateSkill(map, name) {
  const key = name.toLowerCase();
  if (!map.has(key)) map.set(key, { name, count: 0, sources: {} });
  return map.get(key);
}

function canonicalSkillName(value) {
  const normalized = normalizeText(value)
    .replace(/^["'«]+|["'»]+$/g, "")
    .replace(/\s*\/\s*/g, "/");
  if (!normalized || normalized.length < 2 || normalized.length > 80) return null;

  const key = normalized.toLowerCase();
  const aliases = new Map([
    ["sql", "SQL"],
    ["postgres", "PostgreSQL"],
    ["postgresql", "PostgreSQL"],
    ["postgre sql", "PostgreSQL"],
    ["ms sql", "MS SQL"],
    ["mssql", "MS SQL"],
    ["rest", "REST API"],
    ["rest api", "REST API"],
    ["restful api", "REST API"],
    ["open api", "OpenAPI"],
    ["openapi", "OpenAPI"],
    ["swagger", "Swagger/OpenAPI"],
    ["bpmn", "BPMN"],
    ["uml", "UML"],
    ["jira", "Jira"],
    ["confluence", "Confluence"],
    ["git", "Git"],
    ["gitlab", "GitLab"],
    ["github", "GitHub"],
    ["api", "API"],
    ["soap", "SOAP"],
    ["graphql", "GraphQL"],
    ["etl", "ETL"],
    ["dwh", "DWH"],
    ["bi", "BI"],
    ["power bi", "Power BI"]
  ]);

  return aliases.get(key) || normalized;
}

function createSearchStat(query, searchField) {
  return {
    source: "https://api.hh.ru/",
    name: `hh.ru: ${query}`,
    query,
    searchField,
    area: SEARCH_AREA,
    engine: "public API",
    found: 0,
    pagesFetched: 0,
    vacancyIds: 0,
    errors: []
  };
}

function splitEnvList(value, fallback) {
  if (!value) return fallback;
  return value
    .split(/[|,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function stripHtml(value) {
  return normalizeText(String(value || "").replace(/<[^>]+>/g, " "));
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function getAuthMode() {
  if (ACCESS_TOKEN) return "access_token";
  if (CLIENT_ID && CLIENT_SECRET) return "client_credentials";
  return "anonymous";
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const date = new Date(String(value).replace(/(\+\d{2})(\d{2})$/, "$1:$2"));
  return Number.isNaN(date.getTime()) ? null : date;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
