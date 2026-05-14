const fs = require("node:fs");
const http = require("node:http");
const https = require("node:https");

const SINCE_DATE = new Date(process.env.SINCE_DATE || "2026-01-01T00:00:00+03:00");
const OUT_FILE = "skills-stats.js";
const MAX_PAGES_PER_SOURCE = Number(process.env.MAX_PAGES_PER_SOURCE || 60);
const MAX_JOB_PAGES_PER_SOURCE = Number(process.env.MAX_JOB_PAGES_PER_SOURCE || 50);
const MAX_SITEMAP_FILES_PER_SOURCE = Number(process.env.MAX_SITEMAP_FILES_PER_SOURCE || 8);
const MAX_SITEMAP_URLS_PER_SOURCE = Number(process.env.MAX_SITEMAP_URLS_PER_SOURCE || 160);
const REQUEST_TIMEOUT_MS = Number(process.env.REQUEST_TIMEOUT_MS || 6000);

const SOURCES = [
  {
    name: "remote-job.ru",
    url: "https://remote-job.ru/",
    seeds: [
      "https://remote-job.ru/",
      "https://remote-job.ru/?q=%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BA",
      "https://remote-job.ru/search?search=%D0%B0%D0%BD%D0%B0%D0%BB%D0%B8%D1%82%D0%B8%D0%BA"
    ],
    sitemaps: ["https://remote-job.ru/sitemap.xml"]
  },
  {
    name: "careerspace.app",
    url: "https://careerspace.app/",
    seeds: [
      "https://careerspace.app/",
      "https://careerspace.app/jobs",
      "https://careerspace.app/vacancies"
    ],
    sitemaps: ["https://careerspace.app/sitemap.xml"]
  },
  {
    name: "jobrocket.ru",
    url: "https://jobrocket.ru/",
    seeds: [
      "https://jobrocket.ru/",
      "https://jobrocket.ru/jobs",
      "https://jobrocket.ru/vacancies"
    ],
    sitemaps: ["https://jobrocket.ru/sitemap.xml"]
  },
  {
    name: "getmatch.ru",
    url: "https://getmatch.ru/",
    seeds: [
      "https://getmatch.ru/",
      "https://getmatch.ru/jobs",
      "https://getmatch.ru/vacancies"
    ],
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
  const allVacancyUrls = new Set();
  const errors = [];
  const sourceStats = [];
  let totalPagesFetched = 0;

  for (const source of SOURCES) {
    const stat = {
      source: source.url,
      name: source.name,
      pagesFetched: 0,
      crawlPagesFetched: 0,
      candidateUrls: 0,
      vacancies: 0,
      errors: []
    };

    try {
      const candidates = await collectCandidateUrls(source, stat);
      stat.candidateUrls = candidates.length;

      for (const item of candidates.slice(0, MAX_JOB_PAGES_PER_SOURCE)) {
        if (allVacancyUrls.has(item.url)) continue;
        if (stat.pagesFetched >= MAX_JOB_PAGES_PER_SOURCE) break;

        let response;
        try {
          response = await fetchText(item.url);
        } catch (error) {
          stat.errors.push(`${item.url}: ${error.message}`);
          continue;
        }

        stat.pagesFetched += 1;
        totalPagesFetched += 1;

        const text = htmlToText(response.body);
        const title = extractTitle(response.body);
        const date = extractDate(response.body, item.lastmod);

        if (date && date < SINCE_DATE) continue;
        if (!isLikelyVacancy(item.url, title, text)) continue;

        const matchedSkills = matchSkills(`${title}\n${text}`);
        if (!matchedSkills.length) continue;

        allVacancyUrls.add(item.url);
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

    sourceStats.push(stat);
  }

  const skills = [...totals.values()]
    .filter((skill) => skill.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));

  const payload = {
    updatedAt: new Date().toISOString(),
    since: SINCE_DATE.toISOString(),
    sources: SOURCES.map((source) => source.url),
    totalPagesFetched,
    totalVacancies: allVacancyUrls.size,
    sourceStats,
    skills,
    errors
  };

  fs.writeFileSync(OUT_FILE, `window.PREPBASE_SKILL_STATS = ${JSON.stringify(payload, null, 2)};\n`);
  console.log(`Parsed ${payload.totalVacancies} vacancies from ${payload.sources.length} job sites.`);
}

async function collectCandidateUrls(source, stat) {
  const sourceHost = new URL(source.url).hostname.replace(/^www\./, "");
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

  while (crawlQueue.length && visited.size < MAX_PAGES_PER_SOURCE) {
    const pageUrl = normalizeUrl(crawlQueue.shift());
    if (!pageUrl || visited.has(pageUrl) || !isSameHost(pageUrl, sourceHost)) continue;

    visited.add(pageUrl);

    let response;
    try {
      response = await fetchText(pageUrl);
    } catch (error) {
      stat.errors.push(`${pageUrl}: ${error.message}`);
      continue;
    }

    stat.crawlPagesFetched += 1;
    const links = extractLinks(response.body, pageUrl)
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

  const response = await fetchText(normalized);
  const locBlocks = [...response.body.matchAll(/<url>\s*([\s\S]*?)<\/url>/gi)];
  const sitemapBlocks = [...response.body.matchAll(/<sitemap>\s*([\s\S]*?)<\/sitemap>/gi)];
  const urls = [];

  for (const block of sitemapBlocks) {
    if (urls.length >= MAX_SITEMAP_URLS_PER_SOURCE) break;
    const loc = extractXmlTag(block[1], "loc");
    if (!loc || !isSameHost(loc, sourceHost)) continue;
    const lastmod = parseDateValue(extractXmlTag(block[1], "lastmod"));
    if (lastmod && lastmod < SINCE_DATE) continue;
    try {
      urls.push(...(await readSitemapUrls(loc, sourceHost, stat, seen)));
    } catch (error) {
      stat.errors.push(`${loc}: ${error.message}`);
    }
  }

  for (const block of locBlocks) {
    if (urls.length >= MAX_SITEMAP_URLS_PER_SOURCE) break;
    const loc = extractXmlTag(block[1], "loc");
    if (!loc || !isSameHost(loc, sourceHost)) continue;
    const lastmod = parseDateValue(extractXmlTag(block[1], "lastmod"));
    if (lastmod && lastmod < SINCE_DATE) continue;
    urls.push({ url: normalizeUrl(loc), lastmod });
  }

  if (!locBlocks.length && !sitemapBlocks.length) {
    for (const match of response.body.matchAll(/<loc>(.*?)<\/loc>/gi)) {
      if (urls.length >= MAX_SITEMAP_URLS_PER_SOURCE) break;
      const loc = decodeHtml(match[1].trim());
      if (loc && isSameHost(loc, sourceHost)) urls.push({ url: normalizeUrl(loc), lastmod: null });
    }
  }

  return urls;
}

function addCandidate(map, url, lastmod = null) {
  const normalized = normalizeUrl(url);
  if (!normalized) return;
  if (!map.has(normalized)) map.set(normalized, { url: normalized, lastmod });
}

function fetchText(url, redirects = 0) {
  return new Promise((resolve, reject) => {
    if (redirects > 5) {
      reject(new Error("Too many redirects"));
      return;
    }

    const requestUrl = new URL(url);
    const client = requestUrl.protocol === "http:" ? http : https;
    const req = client.get(
      requestUrl,
      {
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
          "User-Agent": "PrepbaseMVP/1.0 (+https://github.com/aim123qqq-cpu/prepbase-mvp)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ru,en;q=0.8"
        }
      },
      (res) => {
        const status = res.statusCode || 0;
        const location = res.headers.location;
        if (status >= 300 && status < 400 && location) {
          res.resume();
          resolve(fetchText(new URL(location, requestUrl).toString(), redirects + 1));
          return;
        }

        if (status >= 400) {
          res.resume();
          reject(new Error(`HTTP ${status}`));
          return;
        }

        const chunks = [];
        res.setEncoding("utf8");
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve({ url: requestUrl.toString(), body: chunks.join("") }));
      }
    );

    req.on("timeout", () => req.destroy(new Error("Request timeout")));
    req.on("error", reject);
  });
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  for (const match of html.matchAll(/\s(?:href|data-href)=["']([^"']+)["']/gi)) {
    const raw = decodeHtml(match[1]);
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) continue;
    const normalized = normalizeUrl(raw, baseUrl);
    if (normalized) links.add(normalized);
  }
  return [...links];
}

function extractTitle(html) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return htmlToText(h1[1]).slice(0, 160);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return title ? htmlToText(title[1]).slice(0, 160) : "";
}

function extractDate(html, fallback) {
  const candidates = [
    fallback,
    ...extractJsonValues(html, ["datePosted", "datePublished", "published_at", "created_at", "updated_at", "validThrough"]),
    ...[...html.matchAll(/(?:datetime|content)=["']([^"']*20\d{2}[^"']*)["']/gi)].map((match) => match[1]),
    ...[...html.matchAll(/\b20\d{2}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?/g)].map((match) => match[0])
  ];

  for (const value of candidates) {
    const date = parseDateValue(value);
    if (date) return date;
  }

  return null;
}

function extractJsonValues(html, keys) {
  const values = [];
  for (const key of keys) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*"([^"]+)"`, "gi");
    for (const match of html.matchAll(pattern)) values.push(match[1]);
  }
  return values;
}

function matchSkills(text) {
  return SKILLS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
}

function isLikelyVacancy(url, title, text) {
  const lowerTitle = title.toLowerCase();
  const lowerText = text.toLowerCase();
  const path = new URL(url).pathname.toLowerCase();
  const hasRole = /(аналитик|analyst|business|system|product|data|bi|dwh|etl|developer|engineer|менеджер|manager)/i.test(
    `${title}\n${text.slice(0, 2000)}`
  );
  const hasVacancyMarker = /(ваканси|vacancy|job|jobs|career|отклик|зарплат|опыт работы|требования|обязанности|удаленн)/i.test(
    text.slice(0, 5000)
  );
  const detailPath = /\/(job|jobs|vacanc|career|position|offers|rabota|remote|work)\b|\/\d{3,}|-[a-z0-9]{6,}$/i.test(path);
  const isListing = /\/(jobs|vacancies|career|careers|search|catalog)\/?$/i.test(path);

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
    return new URL(url).hostname.replace(/^www\./, "") === host;
  } catch {
    return false;
  }
}

function normalizeUrl(url, baseUrl) {
  try {
    const parsed = new URL(decodeHtml(url).trim(), baseUrl);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.replace(/^www\./, "");
    if (!["http:", "https:"].includes(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function htmlToText(html) {
  return decodeHtml(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function extractXmlTag(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match ? decodeHtml(match[1].trim()) : null;
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function parseDateValue(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value).replace(/(\+\d{2})(\d{2})$/, "$1:$2"));
  return Number.isNaN(date.getTime()) ? null : date;
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
