const fs = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");
const cheerio = require("cheerio");

const SINCE_DATE = new Date(process.env.SINCE_DATE || "2026-01-01T00:00:00+03:00");
const OUT_FILE = "skills-stats.js";
const MAX_CRAWL_PAGES_PER_SOURCE = Number(process.env.MAX_CRAWL_PAGES_PER_SOURCE || 70);
const MAX_JOB_PAGES_PER_SOURCE = Number(process.env.MAX_JOB_PAGES_PER_SOURCE || 60);
const MAX_SITEMAP_FILES_PER_SOURCE = Number(process.env.MAX_SITEMAP_FILES_PER_SOURCE || 10);
const MAX_SITEMAP_URLS_PER_SOURCE = Number(process.env.MAX_SITEMAP_URLS_PER_SOURCE || 220);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 9000);
const REQUEST_DELAY_MS = Number(process.env.REQUEST_DELAY_MS || 250);

const SOURCES = [
  {
    name: "remote-job.ru",
    url: "https://remote-job.ru/",
    seeds: [
      "https://remote-job.ru/",
      "https://remote-job.ru/?q=%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BA"
    ],
    sitemaps: ["https://remote-job.ru/sitemap.xml"]
  },
  {
    name: "careerspace.app",
    url: "https://careerspace.app/",
    seeds: ["https://careerspace.app/"],
    sitemaps: ["https://careerspace.app/sitemap.xml"]
  },
  {
    name: "jobrocket.ru",
    url: "https://jobrocket.ru/",
    seeds: ["https://jobrocket.ru/"],
    sitemaps: ["https://jobrocket.ru/sitemap.xml"]
  },
  {
    name: "getmatch.ru",
    url: "https://getmatch.ru/",
    seeds: ["https://getmatch.ru/"],
    sitemaps: ["https://getmatch.ru/sitemap.xml"]
  }
];

const SKILLS = [
  ["SQL", /\bSQL\b|PostgreSQL|MySQL|ClickHouse|Greenplum|MSSQL|Oracle/i],
  ["Python", /\bPython\b|pandas|numpy|jupyter/i],
  ["Excel", /\bExcel\b|Google Sheets|таблиц/i],
  ["Power BI", /Power\s?BI|DAX|Power Query/i],
  ["Tableau", /Tableau/i],
  ["DataLens", /DataLens|Yandex DataLens/i],
  ["BI", /\bBI\b|Business Intelligence|дашборд/i],
  ["A/B-тесты", /A\/B|AB[-\s]?тест|эксперимент/i],
  ["Метрики", /метрик|KPI|OKR|юнит[-\s]?экономик/i],
  ["Продуктовая аналитика", /продуктов(ый|ая|ого) аналит|product analyst|Amplitude|Mixpanel|AppMetrica/i],
  ["Системный анализ", /системн(ый|ого) аналит|system analyst|UML|BPMN|sequence diagram|use case/i],
  ["Бизнес-анализ", /бизнес[-\s]?аналит|business analyst|BRD|FRD|stakeholder/i],
  ["ТЗ", /\bТЗ\b|техническ(ое|ого) задан/i],
  ["API", /\bAPI\b|REST|SOAP|GraphQL|Swagger|OpenAPI|Postman/i],
  ["Интеграции", /интеграц|Kafka|RabbitMQ|message broker|шина данных/i],
  ["BPMN", /\bBPMN\b|Camunda/i],
  ["UML", /\bUML\b|ER[-\s]?diagram|диаграмм/i],
  ["Agile/Scrum", /Agile|Scrum|Kanban|Jira|Confluence/i],
  ["ETL", /\bETL\b|ELT|Airflow|dbt/i],
  ["DWH", /\bDWH\b|Data Warehouse|хранилищ.*данн/i],
  ["ML/DS", /\bML\b|Machine Learning|Data Science|scikit|модел/i],
  ["Git", /\bGit\b|GitLab|GitHub/i],
  ["Linux", /\bLinux\b|bash|shell/i],
  ["Английский", /английск|English|Upper[-\s]?Intermediate|B2|C1/i],
  ["Коммуникация", /коммуникац|stakeholder|стейкхолдер|презентац/i]
];

async function main() {
  const totals = new Map(SKILLS.map(([name]) => [name, { name, count: 0, sources: {} }]));
  const vacancies = new Map();
  const errors = [];
  const sourceStats = [];
  let totalPagesFetched = 0;

  for (const source of SOURCES) {
    const stat = createSourceStat(source);

    try {
      const candidates = await collectCandidateUrls(source, stat);
      stat.candidateUrls = candidates.length;

      for (const candidate of candidates.slice(0, MAX_JOB_PAGES_PER_SOURCE)) {
        if (vacancies.has(candidate.url)) continue;

        const parsed = await parseVacancyCandidate(candidate, source, stat);
        if (!parsed) continue;

        totalPagesFetched += 1;
        stat.pagesFetched += 1;

        const matchedSkills = matchSkills(`${parsed.title}\n${parsed.text}`);
        if (!matchedSkills.length) continue;

        vacancies.set(candidate.url, {
          url: candidate.url,
          source: source.url,
          title: parsed.title,
          date: parsed.date ? parsed.date.toISOString() : null,
          skills: matchedSkills
        });

        stat.vacancies += 1;
        for (const skillName of matchedSkills) {
          const skill = totals.get(skillName);
          skill.count += 1;
          skill.sources[source.url] = (skill.sources[source.url] || 0) + 1;
        }
      }
    } catch (error) {
      stat.errors.push(error.message);
      errors.push(`${source.name}: ${error.message}`);
    }

    stat.errors = unique(stat.errors).slice(0, 12);
    sourceStats.push(stat);
  }

  const skills = [...totals.values()]
    .filter((skill) => skill.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));

  const payload = {
    updatedAt: new Date().toISOString(),
    since: SINCE_DATE.toISOString(),
    parser: "node-fetch + cheerio",
    sources: SOURCES.map((source) => source.url),
    totalPagesFetched,
    totalVacancies: vacancies.size,
    sourceStats,
    skills,
    errors
  };

  fs.writeFileSync(OUT_FILE, `window.PREPBASE_SKILL_STATS = ${JSON.stringify(payload, null, 2)};\n`, "utf8");
  console.log(`Parsed ${payload.totalVacancies} vacancies from ${payload.sources.length} job sites.`);
}

function createSourceStat(source) {
  return {
    source: source.url,
    name: source.name,
    engine: "cheerio",
    crawlPagesFetched: 0,
    pagesFetched: 0,
    candidateUrls: 0,
    structuredJobPostings: 0,
    vacancies: 0,
    errors: []
  };
}

async function collectCandidateUrls(source, stat) {
  const sourceHost = getComparableHost(source.url);
  const candidates = new Map();
  const crawlQueue = [];
  const visited = new Set();

  for (const sitemapUrl of source.sitemaps) {
    try {
      const sitemapUrls = await readSitemapUrls(sitemapUrl, sourceHost, stat);
      for (const item of sitemapUrls) {
        if (isRelevantUrl(item.url)) addCandidate(candidates, item.url, item.lastmod);
        if (shouldCrawlUrl(item.url)) crawlQueue.push(item.url);
      }
    } catch (error) {
      stat.errors.push(`${sitemapUrl}: ${error.message}`);
    }
  }

  for (const seed of source.seeds) {
    crawlQueue.push(seed);
    if (isRelevantUrl(seed)) addCandidate(candidates, seed);
  }

  while (crawlQueue.length && visited.size < MAX_CRAWL_PAGES_PER_SOURCE) {
    const pageUrl = normalizeUrl(crawlQueue.shift());
    if (!pageUrl || visited.has(pageUrl) || !isSameHost(pageUrl, sourceHost)) continue;

    visited.add(pageUrl);

    let body;
    try {
      body = await fetchText(pageUrl);
    } catch (error) {
      stat.errors.push(`${pageUrl}: ${error.message}`);
      continue;
    }

    stat.crawlPagesFetched += 1;
    const $ = cheerio.load(body);
    const links = extractLinks($, pageUrl)
      .filter((url) => isSameHost(url, sourceHost))
      .filter((url) => isRelevantUrl(url) || shouldCrawlUrl(url));

    for (const link of links) {
      if (isRelevantUrl(link)) addCandidate(candidates, link);
      if (!visited.has(link) && shouldCrawlUrl(link)) crawlQueue.push(link);
    }
  }

  return [...candidates.values()];
}

async function readSitemapUrls(url, sourceHost, stat, seen = new Set()) {
  const normalized = normalizeUrl(url);
  if (!normalized || seen.has(normalized)) return [];
  if (seen.size >= MAX_SITEMAP_FILES_PER_SOURCE) return [];
  seen.add(normalized);

  const body = await fetchText(normalized);
  const $ = cheerio.load(body, { xmlMode: true });
  const urls = [];

  for (const element of $("sitemap").toArray()) {
    if (urls.length >= MAX_SITEMAP_URLS_PER_SOURCE) break;
    const loc = normalizeUrl($(element).find("loc").first().text());
    if (!loc || !isSameHost(loc, sourceHost)) continue;

    const lastmod = parseDateValue($(element).find("lastmod").first().text());
    if (lastmod && lastmod < SINCE_DATE) continue;

    try {
      urls.push(...(await readSitemapUrls(loc, sourceHost, stat, seen)));
    } catch (error) {
      stat.errors.push(`${loc}: ${error.message}`);
    }
  }

  for (const element of $("url").toArray()) {
    if (urls.length >= MAX_SITEMAP_URLS_PER_SOURCE) break;
    const loc = normalizeUrl($(element).find("loc").first().text());
    if (!loc || !isSameHost(loc, sourceHost)) continue;

    const lastmod = parseDateValue($(element).find("lastmod").first().text());
    if (lastmod && lastmod < SINCE_DATE) continue;
    urls.push({ url: loc, lastmod });
  }

  return urls;
}

async function parseVacancyCandidate(candidate, source, stat) {
  let body;
  try {
    body = await fetchText(candidate.url);
  } catch (error) {
    stat.errors.push(`${candidate.url}: ${error.message}`);
    return null;
  }

  const $ = cheerio.load(body);
  const structuredJobs = extractStructuredJobs($, candidate.url);
  if (structuredJobs.length) stat.structuredJobPostings += structuredJobs.length;

  const title = normalizeText(
    structuredJobs[0]?.title ||
      $("h1").first().text() ||
      $("meta[property='og:title']").attr("content") ||
      $("title").first().text()
  );
  const text = collectPageText($, structuredJobs);
  const date = extractDate($, structuredJobs, candidate.lastmod);

  if (date && date < SINCE_DATE) return null;
  if (!isLikelyVacancy(candidate.url, title, text, structuredJobs.length > 0)) return null;

  return { title, text, date, source: source.url };
}

function extractStructuredJobs($, pageUrl) {
  const jobs = [];

  $("script[type='application/ld+json']").each((_, element) => {
    const raw = $(element).contents().text().trim();
    if (!raw) return;

    for (const item of parseJsonLd(raw)) {
      if (!isJobPosting(item)) continue;
      jobs.push({
        title: normalizeText(item.title || item.name || ""),
        url: normalizeUrl(item.url || pageUrl, pageUrl),
        datePosted: parseDateValue(item.datePosted || item.datePublished),
        text: normalizeText([
          item.description,
          item.responsibilities,
          item.qualifications,
          item.skills,
          item.experienceRequirements,
          item.educationRequirements,
          item.employmentType,
          item.industry
        ].filter(Boolean).join(" "))
      });
    }
  });

  return jobs;
}

function parseJsonLd(raw) {
  try {
    return flattenJsonLd(JSON.parse(raw));
  } catch {
    return [];
  }
}

function flattenJsonLd(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(flattenJsonLd);
  if (typeof value !== "object") return [];

  const graph = Array.isArray(value["@graph"]) ? value["@graph"].flatMap(flattenJsonLd) : [];
  return [value, ...graph];
}

function isJobPosting(item) {
  const type = item["@type"];
  const types = Array.isArray(type) ? type : [type];
  return types.filter(Boolean).some((value) => String(value).toLowerCase() === "jobposting");
}

function collectPageText($, structuredJobs) {
  const structuredText = structuredJobs.map((job) => `${job.title} ${job.text}`).join(" ");
  $("script, style, noscript, svg").remove();

  const semanticText = [
    $("main").text(),
    $("article").text(),
    $("[class*='vacancy'], [class*='job'], [class*='career'], [class*='position']").text(),
    $("body").text()
  ].map(normalizeText).filter(Boolean).join(" ");

  return normalizeText(`${structuredText} ${semanticText}`);
}

function extractDate($, structuredJobs, fallback) {
  const candidates = [
    ...structuredJobs.map((job) => job.datePosted),
    fallback,
    $("time[datetime]").first().attr("datetime"),
    $("meta[property='article:published_time']").attr("content"),
    $("meta[name='date']").attr("content"),
    $("meta[itemprop='datePosted']").attr("content")
  ];

  const bodyText = $("body").text();
  for (const match of bodyText.matchAll(/\b20\d{2}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?/g)) {
    candidates.push(match[0]);
  }

  for (const value of candidates) {
    const date = parseDateValue(value);
    if (date) return date;
  }

  return null;
}

function addCandidate(map, url, lastmod = null) {
  const normalized = normalizeUrl(url);
  if (!normalized) return;
  if (!map.has(normalized)) map.set(normalized, { url: normalized, lastmod });
}

async function fetchText(url, redirects = 0) {
  if (redirects > 5) throw new Error("Too many redirects");
  await delay(REQUEST_DELAY_MS);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        "User-Agent": "PrepbaseMVP/1.0 (+https://github.com/aim123qqq-cpu/prepbase-mvp)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ru,en;q=0.8"
      }
    });

    if (response.status >= 300 && response.status < 400 && response.headers.get("location")) {
      const nextUrl = new URL(response.headers.get("location"), url).toString();
      return fetchText(nextUrl, redirects + 1);
    }

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Request timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractLinks($, baseUrl) {
  const links = new Set();

  $("[href], [data-href]").each((_, element) => {
    const raw = $(element).attr("href") || $(element).attr("data-href");
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;

    const normalized = normalizeUrl(raw, baseUrl);
    if (normalized) links.add(normalized);
  });

  return [...links];
}

function matchSkills(text) {
  return SKILLS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

function isLikelyVacancy(url, title, text, hasStructuredJob) {
  const lowerTitle = title.toLowerCase();
  const lowerText = text.toLowerCase();
  const path = new URL(url).pathname.toLowerCase();
  const hasRole = /(аналитик|analyst|business|system|product|data|bi|dwh|etl|developer|engineer|менеджер|manager)/i.test(
    `${title}\n${text.slice(0, 2500)}`
  );
  const hasVacancyMarker = /(ваканси|vacancy|job|jobs|career|отклик|зарплат|опыт работы|требования|обязанности|удаленн|jobposting)/i.test(
    text.slice(0, 7000)
  );
  const detailPath = /\/(job|jobs|vacanc|career|position|offers|rabota|remote|work)\b|\/\d{3,}|-[a-z0-9]{6,}$/i.test(path);
  const isListing = /\/(jobs|vacancies|career|careers|search|catalog)\/?$/i.test(path);

  if (hasStructuredJob) return hasRole && !isListing;
  return hasRole && hasVacancyMarker && (detailPath || lowerTitle.includes("аналитик") || lowerTitle.includes("analyst")) && !isListing && lowerText.length > 800;
}

function isRelevantUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  const { pathname, search } = new URL(normalized);
  const value = `${pathname}${search}`.toLowerCase();
  return /(job|jobs|vacanc|career|position|offers|rabota|remote|work|analyst|analytics|business|system|data|bi|product|аналит)/i.test(value);
}

function shouldCrawlUrl(url) {
  const normalized = normalizeUrl(url);
  if (!normalized) return false;
  const { pathname, search } = new URL(normalized);
  const value = `${pathname}${search}`.toLowerCase();
  return value === "/" || /(job|jobs|vacanc|career|careers|search|catalog|remote|analyst|analytics|data|product)/i.test(value);
}

function isSameHost(url, host) {
  try {
    return getComparableHost(url) === host;
  } catch {
    return false;
  }
}

function getComparableHost(url) {
  return new URL(url).hostname.replace(/^www\./, "");
}

function normalizeUrl(url, baseUrl) {
  try {
    const parsed = new URL(String(url || "").trim(), baseUrl);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
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
