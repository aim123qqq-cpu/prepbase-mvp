const fs = require("node:fs");
const { setTimeout: delay } = require("node:timers/promises");

const OUT_FILE = process.env.SKILLS_STATS_OUT_FILE || "skills-stats.js";
const SOURCE_PREFIX = "window.PREPBASE_SKILL_STATS = ";
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
const COMPANY_STATS_LIMIT = clampNumber(process.env.COMPANY_STATS_LIMIT, 1, 500, 50);
const REQUEST_TIMEOUT_MS = clampNumber(process.env.REQUEST_TIMEOUT_MS, 1000, 45000, 18000);
const REQUEST_DELAY_MS = clampNumber(process.env.REQUEST_DELAY_MS, 0, 10000, 1000);
const USER_AGENT =
  process.env.HH_USER_AGENT ||
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

async function main() {
  if (!fs.existsSync(OUT_FILE)) {
    console.warn(`${OUT_FILE} not found, company stats rebuild skipped.`);
    return;
  }

  const source = fs.readFileSync(OUT_FILE, "utf8");
  const payload = parsePayload(source);
  const vacancies = Array.isArray(payload.vacancies) ? payload.vacancies : [];
  const existingCompanies = Array.isArray(payload.companyStats) ? payload.companyStats : [];

  if (!vacancies.length) {
    console.warn("No vacancies found, company stats rebuild skipped.");
    return;
  }

  const enrichment = await collectSearchCompanyData();
  const knownLogos = buildKnownLogoMap(existingCompanies);
  const enrichedVacancies = vacancies.map((vacancy) => enrichVacancy(vacancy, enrichment.get(String(vacancy.id || ""))));
  const allCompanyStats = buildCompanyStats(enrichedVacancies, knownLogos);
  const companyStats = allCompanyStats.slice(0, COMPANY_STATS_LIMIT);
  const generatedAt = new Date().toISOString();

  payload.vacancies = enrichedVacancies;
  payload.companyStats = companyStats;
  payload.companyStatsMeta = {
    totalCompanies: allCompanyStats.length,
    limit: COMPANY_STATS_LIMIT,
    generatedAt
  };

  payload.parserPostprocess = {
    name: "rebuild-company-stats",
    generatedAt,
    source: "vacancies + hh search html",
    enrichedVacancies: [...enrichment.values()].filter((item) => item.employer || item.logo).length,
    skippedUnknownCompanies: enrichedVacancies.filter((vacancy) => !normalizeEmployerName(vacancy.employer)).length
  };

  fs.writeFileSync(OUT_FILE, `${SOURCE_PREFIX}${JSON.stringify(payload, null, 2)};\n`, "utf8");
  console.log(`Rebuilt ${companyStats.length} company stats from ${vacancies.length} vacancies.`);
}

function parsePayload(source) {
  const trimmed = source.trim();
  if (!trimmed.startsWith(SOURCE_PREFIX)) {
    throw new Error(`${OUT_FILE} has unexpected format.`);
  }

  const json = trimmed.slice(SOURCE_PREFIX.length).replace(/;\s*$/, "");
  return JSON.parse(json);
}

async function collectSearchCompanyData() {
  const result = new Map();

  for (const searchUrl of SEARCH_URLS) {
    let emptyPages = 0;
    for (let page = 0; page < MAX_SEARCH_PAGES_PER_URL; page += 1) {
      const url = buildSearchPageUrl(searchUrl, page);
      let html = "";

      try {
        html = await fetchHtml(url);
      } catch (error) {
        console.warn(`Company enrichment page ${page} failed: ${error.message}`);
        break;
      }

      const pageItems = extractCompanyDataFromSearchHtml(html, url);
      for (const item of pageItems) {
        if (!item.id) continue;
        result.set(item.id, {
          ...(result.get(item.id) || {}),
          ...item
        });
      }

      if (!pageItems.length) emptyPages += 1;
      if (!hasNextPage(html, page) && page > 0) break;
      if (emptyPages >= 2) break;
    }
  }

  return result;
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
    return html;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("Request timeout");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function extractCompanyDataFromSearchHtml(html, pageUrl) {
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
    const context = html.slice(Math.max(0, index - 4500), Math.min(html.length, index + 7000));
    const title = extractSearchTitle(context, id);
    const employer = extractSearchEmployer(context);
    const employerId = extractEmployerId(context);
    const logo = extractSearchLogo(context);
    const area = extractSearchArea(context);
    const href = extractVacancyHref(context, id);

    if (!title && !employer && !logo && !employerId) continue;

    vacancies.set(id, {
      id,
      title,
      employer,
      employerId,
      logo,
      area,
      url: href ? absolutizeUrl(href, pageUrl) : ""
    });
  }

  return [...vacancies.values()];
}

function enrichVacancy(vacancy, searchData) {
  if (!searchData) return vacancy;

  const next = { ...vacancy };
  if (isGenericVacancyTitle(next.title) && searchData.title) next.title = searchData.title;
  if (!normalizeEmployerName(next.employer) && searchData.employer) next.employer = searchData.employer;
  if (!next.area && searchData.area) next.area = searchData.area;
  if (!next.employerId && searchData.employerId) next.employerId = searchData.employerId;
  if (!next.employerLogo && searchData.logo) next.employerLogo = searchData.logo;
  if ((!next.url || /\/vacancy\/\d+$/.test(next.url)) && searchData.url) next.url = searchData.url;
  return next;
}

function buildKnownLogoMap(companies) {
  const logos = new Map();
  for (const company of companies) {
    const logo = company?.logo || null;
    if (!logo) continue;
    if (company.employerId) logos.set(`id:${company.employerId}`, logo);
    if (company.name) logos.set(`name:${normalizeText(company.name).toLowerCase()}`, logo);
  }
  return logos;
}

function buildCompanyStats(vacancies, knownLogos) {
  const totals = new Map();

  for (const vacancy of vacancies) {
    const name = normalizeEmployerName(vacancy.employer);
    if (!name) continue;

    const employerId = vacancy.employerId ? String(vacancy.employerId) : "";
    const key = employerId ? `id:${employerId}` : `name:${name.toLowerCase()}`;
    const logo =
      vacancy.employerLogo ||
      vacancy.logo ||
      vacancy.employerLogoUrl ||
      knownLogos.get(key) ||
      knownLogos.get(`name:${name.toLowerCase()}`) ||
      null;
    const stat = getOrCreateCompany(totals, key, employerId, name, logo);
    const vacancyId = String(vacancy.id || "");

    if (vacancyId && !stat.vacancyIds.includes(vacancyId)) {
      stat.vacancyIds.push(vacancyId);
      stat.vacanciesCount += 1;
    }

    for (const role of vacancy.roles || []) {
      stat.roles[role] = (stat.roles[role] || 0) + 1;
    }

    const area = normalizeText(vacancy.area || "");
    if (area) stat.areas[area] = (stat.areas[area] || 0) + 1;

    for (const skill of vacancy.skills || []) {
      const skillName = normalizeText(skill);
      if (skillName) stat.skills[skillName] = (stat.skills[skillName] || 0) + 1;
    }

    const publishedAt = parseDateValue(vacancy.date);
    if (publishedAt) {
      const iso = publishedAt.toISOString();
      if (!stat.firstPublishedAt || iso < stat.firstPublishedAt) stat.firstPublishedAt = iso;
      if (!stat.lastPublishedAt || iso > stat.lastPublishedAt) stat.lastPublishedAt = iso;
    }
  }

  return [...totals.values()]
    .map((company) => ({
      ...company,
      vacancyIds: [...company.vacancyIds].sort(),
      roles: sortCountObject(company.roles),
      areas: sortCountObject(company.areas),
      skills: sortCountObject(company.skills)
    }))
    .sort((a, b) => b.vacanciesCount - a.vacanciesCount || a.name.localeCompare(b.name, "ru"));
}

function getOrCreateCompany(map, key, employerId, name, logo) {
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

function extractSearchTitle(context, id) {
  const titleByLink = context.match(
    new RegExp(`<a[^>]+(?:href=["'][^"']*/vacancy/${id}[^"']*["'][^>]*)>([\\s\\S]{0,800}?)</a>`, "i")
  );
  const dataQaTitle =
    extractByDataQa(context, "serp-item__title") || extractByDataQa(context, "vacancy-serp__vacancy-title");
  return cleanTitle(dataQaTitle || (titleByLink ? titleByLink[1] : ""));
}

function extractSearchEmployer(context) {
  const decoded = decodeHtml(context);
  return normalizeText(
    extractByDataQa(decoded, "vacancy-serp__vacancy-employer") ||
      extractByDataQa(decoded, "vacancy-serp__vacancy-employer-text") ||
      extractJsonString(decoded, "employerName") ||
      extractJsonString(decoded, "companyName") ||
      extractNestedName(decoded, "employer") ||
      extractNestedName(decoded, "hiringOrganization") ||
      extractEmployerAnchorText(decoded) ||
      ""
  );
}

function extractSearchArea(context) {
  const decoded = decodeHtml(context);
  return normalizeText(
    extractByDataQa(decoded, "vacancy-serp__vacancy-address") ||
      extractByDataQa(decoded, "vacancy-serp__vacancy-region") ||
      extractJsonString(decoded, "areaName") ||
      extractJsonString(decoded, "addressLocality") ||
      ""
  );
}

function extractSearchLogo(context) {
  const decoded = decodeHtml(context).replace(/\\\//g, "/");
  const explicit =
    extractJsonString(decoded, "logoUrl") ||
    extractJsonString(decoded, "logo_url") ||
    extractJsonString(decoded, "employerLogoUrl") ||
    extractLogoFromObject(decoded) ||
    "";
  if (explicit) return absolutizeUrl(explicit, HH_WEB_BASE);

  const imageMatch =
    decoded.match(/<img[^>]+(?:data-qa=["'][^"']*logo[^"']*["'][^>]+)?src=["']([^"']+)["'][^>]*>/i) ||
    decoded.match(/<img[^>]+src=["']([^"']+)["'][^>]+(?:alt=["'][^"']*(?:logo|логотип|employer)[^"']*["'])[^>]*>/i) ||
    decoded.match(/(https?:\/\/[^"'<>\s]+(?:employer-logo|logo)[^"'<>\s]+)/i);
  if (!imageMatch) return "";

  const value = decodeHtml(imageMatch[1]);
  if (/data:image|\/vacancy\//i.test(value)) return "";
  return absolutizeUrl(value, HH_WEB_BASE);
}

function extractLogoFromObject(value) {
  const match =
    value.match(/"logoUrls?"\s*:\s*\{[\s\S]{0,600}?"original"\s*:\s*"([^"]+)"/i) ||
    value.match(/"logoUrls?"\s*:\s*\{[\s\S]{0,600}?"240"\s*:\s*"([^"]+)"/i) ||
    value.match(/"logoUrls?"\s*:\s*\{[\s\S]{0,600}?"90"\s*:\s*"([^"]+)"/i);
  return match ? match[1] : "";
}

function extractEmployerAnchorText(context) {
  const match = context.match(/<a[^>]+href=["'][^"']*\/employer\/\d+[^"']*["'][^>]*>([\s\S]{0,500}?)<\/a>/i);
  return match ? stripHtml(match[1]) : "";
}

function extractNestedName(context, key) {
  const match = context.match(new RegExp(`"${escapeRegExp(key)}"\\s*:\\s*\\{[\\s\\S]{0,700}?"name"\\s*:\\s*"([^"]+)"`, "i"));
  return match ? decodeJsonString(match[1]) : "";
}

function extractVacancyHref(context, id) {
  const match =
    context.match(new RegExp(`href=["']([^"']*/vacancy/${id}[^"']*)["']`, "i")) ||
    context.match(new RegExp(`(https?://[^"'<>]+/vacancy/${id}[^"'<>]*)`, "i")) ||
    context.match(new RegExp(`(/vacancy/${id}[^"'<>\\s]*)`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function extractEmployerId(context) {
  const match =
    context.match(/\/employer\/(\d+)/i) ||
    context.match(/["']employerId["']\s*:\s*["']?(\d+)["']?/i) ||
    context.match(/["']employer_id["']\s*:\s*["']?(\d+)["']?/i);
  return match ? String(match[1]) : "";
}

function extractByDataQa(html, dataQa) {
  const escaped = escapeRegExp(dataQa);
  const match = html.match(new RegExp(`<[^>]+data-qa=["']${escaped}["'][^>]*>([\\s\\S]*?)</[^>]+>`, "i"));
  return match ? stripHtml(match[1]) : "";
}

function extractJsonString(html, key) {
  const match = html.match(new RegExp(`["']${escapeRegExp(key)}["']\\s*:\\s*["']([^"']+)["']`, "i"));
  return match ? decodeJsonString(match[1]) : "";
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

function cleanTitle(value) {
  return stripHtml(value)
    .replace(/\s+вакансия\b.*$/i, "")
    .replace(/\s+—\s+.*$/i, "")
    .trim();
}

function isGenericVacancyTitle(value) {
  return !value || /^Вакансия\s+\d+$/i.test(String(value));
}

function normalizeEmployerName(value) {
  const name = normalizeText(value);
  if (!name || /^компания не указана$/i.test(name)) return "";
  return name;
}

function stripHtml(value) {
  return normalizeText(
    decodeHtml(String(value || ""))
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
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

function sortCountObject(value) {
  return Object.fromEntries(
    Object.entries(value || {})
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
  );
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseDateValue(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function absolutizeUrl(value, base) {
  try {
    return new URL(value, base || HH_WEB_BASE).toString();
  } catch {
    return value || "";
  }
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

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
