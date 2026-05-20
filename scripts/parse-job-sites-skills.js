const fs = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");

const OUT_FILE = process.env.SKILLS_STATS_OUT_FILE || "skills-stats.js";
const HH_WEB_BASE = "https://hh.ru";
const DEFAULT_SEARCH_URL =
  "https://omsk.hh.ru/search/vacancy?hhtmFrom=main&hhtmFromLabel=vacancy_search_line&search_field=name&search_field=company_name&search_field=description&enable_snippets=true&L_save_area=true&professional_role=10&professional_role=150&professional_role=148";

const SEARCH_URLS = splitEnvList(process.env.HH_SEARCH_URLS || process.env.HH_SEARCH_URL, [DEFAULT_SEARCH_URL]);
const MAX_SEARCH_PAGES_PER_URL = clampNumber(
  process.env.HH_MAX_SEARCH_PAGES_PER_URL || process.env.HH_MAX_SEARCH_PAGES_PER_QUERY,
  1,
  100,
  50
);
const MAX_DETAILS = clampNumber(process.env.HH_MAX_DETAILS, 1, 5000, 2000);
const COMPANY_STATS_LIMIT = clampNumber(process.env.COMPANY_STATS_LIMIT, 1, 500, 50);
const REQUEST_TIMEOUT_MS = clampNumber(process.env.REQUEST_TIMEOUT_MS, 1000, 45000, 18000);
const REQUEST_DELAY_MS = clampNumber(process.env.REQUEST_DELAY_MS, 0, 10000, 1000);
const DATE_FROM = parseDateValue(process.env.HH_DATE_FROM || process.env.SINCE_DATE);
const USER_AGENT =
  process.env.HH_USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

const FALLBACK_SKILLS = [
  ["SQL", /\bSQL\b|PostgreSQL|Postgres|MySQL|ClickHouse|Greenplum|MSSQL|MS SQL|Oracle/i],
  ["PostgreSQL", /PostgreSQL|Postgres/i],
  ["MS SQL", /\bMS\s?SQL\b|MSSQL/i],
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
  ["Интеграции", /интеграц|Kafka|RabbitMQ|message broker|шина данных|обмен данными/i],
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
  const searchVacancies = new Map();
  const searchStats = [];
  const errors = [];

  for (const searchUrl of SEARCH_URLS) {
    const stat = createSearchStat(searchUrl);
    await collectSearchVacancies(searchUrl, seenVacancyIds, searchVacancies, stat, errors);
    searchStats.push(stat);
  }

  if (!seenVacancyIds.size) {
    writeSearchFailureResult(searchStats, errors);
    return;
  }

  const totals = new Map();
  const companyTotals = new Map();
  const vacancies = [];
  let detailsFetched = 0;

  for (const id of seenVacancyIds) {
    if (detailsFetched >= MAX_DETAILS) break;

    const searchFallback = searchVacancies.get(id) || {};
    try {
      const details = await fetchVacancyDetails(id, searchFallback);
      detailsFetched += 1;

      if (details.archived) continue;
      const publishedAt = parseDateValue(details.publishedAt);
      if (DATE_FROM && publishedAt && publishedAt < DATE_FROM) continue;

      const skills = extractSkills(details);
      const roles = getVacancyRoles(details.title);
      addCompanyStat(companyTotals, details, skills, roles, publishedAt);

      vacancies.push({
        id,
        url: details.url || `https://hh.ru/vacancy/${id}`,
        source: "https://hh.ru/search/vacancy",
        title: details.title || searchFallback.title || `Вакансия ${id}`,
        employer: details.employer?.name || searchFallback.employer || null,
        area: details.area?.name || searchFallback.area || null,
        date: publishedAt ? publishedAt.toISOString() : null,
        roles,
        skills
      });

      for (const skillName of skills) {
        const skill = getOrCreateSkill(totals, skillName);
        skill.count += 1;
        skill.sources["https://hh.ru/"] = (skill.sources["https://hh.ru/"] || 0) + 1;
      }
    } catch (error) {
      errors.push(`vacancy ${id}: ${error.message}`);

      const skills = extractSkills(searchFallback);
      const roles = getVacancyRoles(searchFallback.title);
      vacancies.push({
        id,
        url: searchFallback.url || `https://hh.ru/vacancy/${id}`,
        source: "https://hh.ru/search/vacancy",
        title: searchFallback.title || `Вакансия ${id}`,
        employer: searchFallback.employer || null,
        area: searchFallback.area || null,
        date: null,
        roles,
        skills
      });

      for (const skillName of skills) {
        const skill = getOrCreateSkill(totals, skillName);
        skill.count += 1;
        skill.sources["https://hh.ru/"] = (skill.sources["https://hh.ru/"] || 0) + 1;
      }
    }
  }

  const skills = [...totals.values()]
    .filter((skill) => skill.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
  const allCompanyStats = buildCompanyStats(companyTotals);
  const companyStats = allCompanyStats.slice(0, COMPANY_STATS_LIMIT);
  const generatedAt = new Date().toISOString();

  const payload = {
    updatedAt: generatedAt,
    since: DATE_FROM ? DATE_FROM.toISOString() : null,
    parser: "hh.ru public search HTML",
    api: null,
    authMode: "public_html",
    queries: SEARCH_URLS,
    searchFields: ["name", "company_name", "description"],
    area: "from-search-url",
    sources: ["https://hh.ru/"],
    totalSearchResults: searchStats.reduce((sum, stat) => sum + stat.found, 0),
    totalVacancies: vacancies.length,
    detailsFetched,
    sourceStats: [
      {
        source: "https://hh.ru/",
        name: "hh.ru",
        engine: "public HTML",
        authMode: "public_html",
        searchQueries: SEARCH_URLS.length,
        pagesFetched: searchStats.reduce((sum, stat) => sum + stat.pagesFetched, 0),
        vacancies: vacancies.length,
        errors: unique(errors).slice(0, 20)
      }
    ],
    searchStats,
    companyStats,
    companyStatsMeta: {
      totalCompanies: allCompanyStats.length,
      limit: COMPANY_STATS_LIMIT,
      generatedAt
    },
    skills,
    vacancies,
    errors: unique(errors)
  };

  fs.writeFileSync(OUT_FILE, `window.PREPBASE_SKILL_STATS = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
  console.log(`Parsed ${payload.totalVacancies} hh.ru vacancies and ${payload.skills.length} skills.`);
}

async function collectSearchVacancies(searchUrl, seenVacancyIds, searchVacancies, stat, errors) {
  let previousSeenSize = seenVacancyIds.size;
  let emptyPages = 0;

  for (let page = 0; page < MAX_SEARCH_PAGES_PER_URL; page += 1) {
    const url = buildSearchPageUrl(searchUrl, page);
    let html = "";

    try {
      const result = await fetchHtml(url);
      html = result.html;
      stat.pagesFetched += 1;
      if (result.status >= 400) {
        const warning = `page ${page}: HTTP ${result.status}, parsing available HTML`;
        stat.warnings.push(warning);
        errors.push(`${url}: ${warning}`);
      }
    } catch (error) {
      stat.errors.push(`page ${page}: ${error.message}`);
      errors.push(`${url}: ${error.message}`);
      break;
    }

    const found = extractSearchTotal(html);
    if (found) stat.found = Math.max(stat.found, found);

    const extracted = extractVacanciesFromSearchHtml(html, url);
    if (!extracted.length) {
      const warning = `page ${page}: no vacancy cards or vacancy links found in public HTML`;
      stat.warnings.push(warning);
      if (page === 0) errors.push(`${url}: ${warning}`);
    }

    for (const vacancy of extracted) {
      if (!vacancy.id) continue;
      searchVacancies.set(vacancy.id, {
        ...(searchVacancies.get(vacancy.id) || {}),
        ...vacancy
      });

      if (!seenVacancyIds.has(vacancy.id)) {
        seenVacancyIds.add(vacancy.id);
        stat.vacancyIds += 1;
      }
    }

    if (!extracted.length) emptyPages += 1;
    if (seenVacancyIds.size === previousSeenSize) emptyPages += 1;
    previousSeenSize = seenVacancyIds.size;

    if (!hasNextPage(html, page) && page > 0) break;
    if (emptyPages >= 2) break;
  }
}

async function fetchVacancyDetails(id, fallback = {}) {
  const url = fallback.url || `https://hh.ru/vacancy/${id}`;
  const result = await fetchHtml(url);
  const html = result.html;

  if (!html || !/(vacancy|Вакансия|data-qa)/i.test(html)) {
    throw new Error(`detail page has no vacancy HTML, HTTP ${result.status}`);
  }

  const ldJson = parseLdJson(html);
  const title =
    extractByDataQa(html, "vacancy-title") ||
    ldJson.title ||
    extractMeta(html, "og:title") ||
    extractTagText(html, "h1") ||
    fallback.title ||
    "";
  const employerName =
    extractByDataQa(html, "vacancy-company-name") ||
    deepFindString(ldJson, ["hiringOrganization", "name"]) ||
    fallback.employer ||
    "";
  const areaName =
    extractByDataQa(html, "vacancy-view-location") ||
    extractByDataQa(html, "vacancy-view-raw-address") ||
    deepFindString(ldJson, ["jobLocation", "address", "addressLocality"]) ||
    fallback.area ||
    "";
  const description =
    extractByDataQa(html, "vacancy-description") ||
    ldJson.description ||
    extractMeta(html, "description") ||
    fallback.description ||
    "";
  const keySkills = extractKeySkills(html);
  const publishedAt =
    ldJson.datePosted ||
    extractDateTime(html) ||
    extractJsonString(html, "published_at") ||
    extractJsonString(html, "publication_time") ||
    fallback.publishedAt ||
    null;

  return {
    id,
    url,
    title: cleanTitle(title),
    description: stripHtml(description),
    keySkills,
    snippet: fallback.snippet || "",
    archived: /вакансия в архиве|vacancy is archived/i.test(stripHtml(html)),
    publishedAt,
    employer: {
      id: extractEmployerId(html) || fallback.employerId || "",
      name: normalizeText(employerName),
      logo_urls: extractLogoUrls(html)
    },
    area: {
      name: normalizeText(areaName)
    }
  };
}

async function fetchHtml(url) {
  await delay(REQUEST_DELAY_MS);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache"
      }
    });
    const html = await response.text();

    if (!html) throw new Error(`HTTP ${response.status}: empty response`);
    if (!response.ok && !hasParsableHtml(html)) {
      throw new Error(`HTTP ${response.status}: ${stripHtml(html).slice(0, 180)}`);
    }

    return { html, status: response.status };
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Request timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractVacanciesFromSearchHtml(html, pageUrl) {
  const vacancies = new Map();
  const idMatches = [
    ...html.matchAll(/(?:https?:\/\/(?:[\w.-]+\.)?hh\.ru)?\/vacancy\/(\d+)(?:[/?#][^"'<>]*)?/gi),
    ...html.matchAll(/data-vacancy-id=["']?(\d{5,})["']?/gi),
    ...html.matchAll(/["']vacancyId["']\s*:\s*["']?(\d{5,})["']?/gi),
    ...html.matchAll(/vacancyId["']?\s*[:=]\s*["']?(\d{5,})["']?/gi)
  ];

  for (const match of idMatches) {
    const id = String(match[1]);
    if (!id || vacancies.has(id)) continue;

    const index = Math.max(0, match.index || 0);
    const context = html.slice(Math.max(0, index - 3500), Math.min(html.length, index + 5500));
    const href = extractVacancyHref(context, id) || `https://hh.ru/vacancy/${id}`;
    const title = extractSearchTitle(context, id);
    const employer = extractSearchEmployer(context);
    const area = extractSearchArea(context);
    const snippet = stripHtml(context);

    vacancies.set(id, {
      id,
      url: absolutizeUrl(href, pageUrl),
      title,
      employer,
      area,
      description: snippet,
      snippet
    });
  }

  return [...vacancies.values()];
}

function extractSkills(vacancy) {
  const skills = new Map();

  for (const item of vacancy.keySkills || vacancy.key_skills || []) {
    addSkill(skills, typeof item === "string" ? item : item?.name);
  }

  const text = stripHtml(
    [
      vacancy.title,
      vacancy.name,
      vacancy.description,
      vacancy.branded_description,
      vacancy.snippet,
      vacancy.snippet?.requirement,
      vacancy.snippet?.responsibility
    ]
      .filter(Boolean)
      .join(" ")
  );

  for (const [name, pattern] of FALLBACK_SKILLS) {
    if (pattern.test(text)) addSkill(skills, name);
  }

  return [...skills.values()].sort((a, b) => a.localeCompare(b, "ru"));
}

function addCompanyStat(map, vacancy, skills, roles, publishedAt) {
  const employer = vacancy.employer || {};
  const name = normalizeText(employer.name || "Компания не указана") || "Компания не указана";
  const employerId = employer.id ? String(employer.id) : "";
  const key = employerId ? `id:${employerId}` : `name:${name.toLowerCase()}`;
  const stat = getOrCreateCompanyStat(map, key, employerId, name, getEmployerLogo(employer));
  const vacancyId = String(vacancy.id || "");

  if (vacancyId && !stat.vacancyIds.includes(vacancyId)) {
    stat.vacancyIds.push(vacancyId);
    stat.vacanciesCount += 1;
  }

  for (const role of roles) {
    if (!stat.roles[role]) stat.roles[role] = 0;
    stat.roles[role] += 1;
  }

  const area = normalizeText(vacancy.area?.name);
  if (area) stat.areas[area] = (stat.areas[area] || 0) + 1;

  for (const skill of skills) {
    stat.skills[skill] = (stat.skills[skill] || 0) + 1;
  }

  const publishedIso = publishedAt ? publishedAt.toISOString() : null;
  if (publishedIso && (!stat.firstPublishedAt || publishedIso < stat.firstPublishedAt)) {
    stat.firstPublishedAt = publishedIso;
  }
  if (publishedIso && (!stat.lastPublishedAt || publishedIso > stat.lastPublishedAt)) {
    stat.lastPublishedAt = publishedIso;
  }
}

function getOrCreateCompanyStat(map, key, employerId, name, logo) {
  if (!map.has(key)) {
    map.set(key, {
      employerId: employerId || key,
      name,
      logo: logo || null,
      vacanciesCount: 0,
      vacancyIds: [],
      roles: {
        "Системный аналитик": 0,
        "Бизнес-аналитик": 0
      },
      areas: {},
      skills: {},
      firstPublishedAt: null,
      lastPublishedAt: null
    });
  }

  const stat = map.get(key);
  if (!stat.logo && logo) stat.logo = logo;
  return stat;
}

function buildCompanyStats(map) {
  return [...map.values()]
    .map((company) => ({
      ...company,
      vacancyIds: [...company.vacancyIds].sort(),
      roles: sortCountObject(company.roles),
      areas: sortCountObject(company.areas),
      skills: sortCountObject(company.skills)
    }))
    .sort((a, b) => b.vacanciesCount - a.vacanciesCount || a.name.localeCompare(b.name, "ru"));
}

function getEmployerLogo(employer) {
  const logos = employer?.logo_urls || {};
  return logos.original || logos["240"] || logos["90"] || null;
}

function getVacancyRoles(value) {
  const normalized = normalizeText(value).toLowerCase();
  const roles = new Set();
  if (/системн|system/.test(normalized)) roles.add("Системный аналитик");
  if (/бизнес|business/.test(normalized)) roles.add("Бизнес-аналитик");
  if (!roles.size && /аналитик|analyst/.test(normalized)) roles.add("Системный аналитик");
  return [...roles].sort((a, b) => a.localeCompare(b, "ru"));
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
  const normalized = normalizeText(decodeHtml(value))
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

function buildSearchPageUrl(searchUrl, page) {
  const url = new URL(searchUrl);
  url.searchParams.set("page", String(page));
  if (!url.searchParams.has("items_on_page")) url.searchParams.set("items_on_page", "50");
  return url.toString();
}

function hasNextPage(html, page) {
  const nextPage = page + 1;
  return (
    new RegExp(`[?&]page=${nextPage}(?:&|["'<>])`).test(html) ||
    new RegExp(`data-page=["']${nextPage}["']`).test(html) ||
    html.includes(`page=${nextPage}`)
  );
}

function hasParsableHtml(html) {
  return /\/vacancy\/\d{5,}|vacancyId|data-vacancy-id|data-qa|Вакансия/i.test(html);
}

function extractSearchTotal(html) {
  const text = stripHtml(html);
  const match =
    text.match(/найден[аоы]?\s+([\d\s]+)\s+ваканс/i) ||
    text.match(/([\d\s]+)\s+ваканс(?:ия|ии|ий)/i) ||
    html.match(/"found"\s*:\s*(\d+)/i);
  return match ? Number(String(match[1]).replace(/\s+/g, "")) || 0 : 0;
}

function extractVacancyHref(context, id) {
  const match =
    context.match(new RegExp(`href=["']([^"']*/vacancy/${id}[^"']*)["']`, "i")) ||
    context.match(new RegExp(`(https?://[^"'<>]+/vacancy/${id}[^"'<>]*)`, "i")) ||
    context.match(new RegExp(`(/vacancy/${id}[^"'<>\\s]*)`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function extractSearchTitle(context, id) {
  const titleByLink = context.match(
    new RegExp(`<a[^>]+(?:href=["'][^"']*/vacancy/${id}[^"']*["'][^>]*)>([\\s\\S]{0,800}?)</a>`, "i")
  );
  const dataQaTitle = extractByDataQa(context, "serp-item__title") || extractByDataQa(context, "vacancy-serp__vacancy-title");
  return cleanTitle(dataQaTitle || (titleByLink ? titleByLink[1] : ""));
}

function extractSearchEmployer(context) {
  return (
    extractByDataQa(context, "vacancy-serp__vacancy-employer") ||
    extractByDataQa(context, "vacancy-serp__vacancy-employer-text") ||
    extractJsonString(context, "employerName") ||
    ""
  );
}

function extractSearchArea(context) {
  return (
    extractByDataQa(context, "vacancy-serp__vacancy-address") ||
    extractByDataQa(context, "vacancy-serp__vacancy-region") ||
    extractJsonString(context, "areaName") ||
    ""
  );
}

function extractByDataQa(html, dataQa) {
  const escaped = escapeRegExp(dataQa);
  const match = html.match(new RegExp(`<[^>]+data-qa=["']${escaped}["'][^>]*>([\\s\\S]*?)</[^>]+>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function extractTagText(html, tag) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function extractMeta(html, name) {
  const propertyPattern = escapeRegExp(name);
  const match = html.match(
    new RegExp(`<meta[^>]+(?:property|name)=["']${propertyPattern}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i")
  );
  return match ? decodeHtml(match[1]) : "";
}

function extractDateTime(html) {
  const match = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  return match ? decodeHtml(match[1]) : "";
}

function extractJsonString(html, key) {
  const match = html.match(new RegExp(`["']${escapeRegExp(key)}["']\\s*:\\s*["']([^"']+)["']`, "i"));
  return match ? decodeJsonString(match[1]) : "";
}

function extractEmployerId(html) {
  const match =
    html.match(/\/employer\/(\d+)/i) ||
    html.match(/["']employerId["']\s*:\s*["']?(\d+)["']?/i) ||
    html.match(/["']employer_id["']\s*:\s*["']?(\d+)["']?/i);
  return match ? String(match[1]) : "";
}

function extractLogoUrls(html) {
  const logo =
    extractJsonString(html, "logoUrl") ||
    extractJsonString(html, "logo_url") ||
    extractJsonString(html, "employerLogoUrl") ||
    "";
  return logo ? { original: logo } : {};
}

function extractKeySkills(html) {
  const skills = new Set();
  for (const match of html.matchAll(/data-qa=["']bloko-tag__text["'][^>]*>([\s\S]*?)<\/[^>]+>/gi)) {
    const skill = stripHtml(match[1]);
    if (skill) skills.add(skill);
  }
  for (const match of html.matchAll(/["']keySkills?["']\s*:\s*\[([\s\S]{0,3000}?)\]/gi)) {
    for (const nameMatch of match[1].matchAll(/["']name["']\s*:\s*["']([^"']+)["']/gi)) {
      const skill = decodeJsonString(nameMatch[1]);
      if (skill) skills.add(skill);
    }
  }
  return [...skills];
}

function parseLdJson(html) {
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const data = JSON.parse(decodeHtml(match[1]));
      if (data && /JobPosting/i.test(String(data["@type"] || ""))) return data;
    } catch {
      // HH changes markup often; non-JSON LD blocks are ignored.
    }
  }
  return {};
}

function deepFindString(source, path) {
  let value = source;
  for (const key of path) {
    if (Array.isArray(value)) value = value[0];
    value = value?.[key];
  }
  if (Array.isArray(value)) value = value[0];
  return typeof value === "string" ? value : "";
}

function sortCountObject(value) {
  return Object.fromEntries(
    Object.entries(value || {})
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
  );
}

function createSearchStat(searchUrl) {
  return {
    source: "https://hh.ru/",
    name: "hh.ru public search",
    query: searchUrl,
    searchField: "public-search-url",
    area: new URL(searchUrl).hostname,
    engine: "public HTML",
    found: 0,
    pagesFetched: 0,
    vacancyIds: 0,
    warnings: [],
    errors: []
  };
}

function writeSearchFailureResult(searchStats, errors) {
  const message = `HH public search failed before collecting vacancies: ${unique(errors).join("; ") || "no vacancies found"}`;

  if (fs.existsSync(OUT_FILE)) {
    console.warn(`${message}. Keeping existing ${OUT_FILE}.`);
    return;
  }

  const generatedAt = new Date().toISOString();
  const payload = {
    updatedAt: generatedAt,
    since: DATE_FROM ? DATE_FROM.toISOString() : null,
    parser: "hh.ru public search HTML",
    api: null,
    authMode: "public_html",
    parserStatus: "search_failed",
    queries: SEARCH_URLS,
    searchFields: ["name", "company_name", "description"],
    area: "from-search-url",
    sources: ["https://hh.ru/"],
    totalSearchResults: 0,
    totalVacancies: 0,
    detailsFetched: 0,
    sourceStats: [
      {
        source: "https://hh.ru/",
        name: "hh.ru",
        engine: "public HTML",
        authMode: "public_html",
        searchQueries: SEARCH_URLS.length,
        pagesFetched: 0,
        vacancies: 0,
        errors: unique(errors).slice(0, 20)
      }
    ],
    searchStats,
    companyStats: [],
    companyStatsMeta: {
      totalCompanies: 0,
      limit: COMPANY_STATS_LIMIT,
      generatedAt
    },
    skills: [],
    vacancies: [],
    errors: unique(errors)
  };

  fs.writeFileSync(OUT_FILE, `window.PREPBASE_SKILL_STATS = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
  console.warn(message);
}

function splitEnvList(value, fallback) {
  if (!value) return fallback;
  return value
    .split(/[|\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

function parseDateValue(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const date = new Date(String(value).replace(/(\+\d{2})(\d{2})$/, "$1:$2"));
  return Number.isNaN(date.getTime()) ? null : date;
}

function cleanTitle(value) {
  return stripHtml(value)
    .replace(/\s+вакансия\b.*$/i, "")
    .replace(/\s+—\s+.*$/i, "")
    .trim();
}

function stripHtml(value) {
  return normalizeText(
    decodeHtml(String(value || ""))
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&quot;/g, '"')
    .replace(/&#34;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${String(value).replace(/"/g, '\\"')}"`);
  } catch {
    return decodeHtml(value);
  }
}

function absolutizeUrl(value, base) {
  try {
    return new URL(value, base || HH_WEB_BASE).toString();
  } catch {
    return value || "";
  }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
