const fs = require("node:fs");

const OUT_FILE = process.env.SKILLS_STATS_OUT_FILE || "skills-stats.js";
const COMPANY_STATS_LIMIT = clampNumber(process.env.COMPANY_STATS_LIMIT, 1, 500, 50);
const SOURCE_PREFIX = "window.PREPBASE_SKILL_STATS = ";

function main() {
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

  const knownLogos = buildKnownLogoMap(existingCompanies);
  const allCompanyStats = buildCompanyStats(vacancies, knownLogos);
  const companyStats = allCompanyStats.slice(0, COMPANY_STATS_LIMIT);
  const generatedAt = new Date().toISOString();

  payload.companyStats = companyStats;
  payload.companyStatsMeta = {
    totalCompanies: allCompanyStats.length,
    limit: COMPANY_STATS_LIMIT,
    generatedAt
  };

  payload.parserPostprocess = {
    name: "rebuild-company-stats",
    generatedAt,
    source: "vacancies"
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
    const name = normalizeText(vacancy.employer || "Компания не указана") || "Компания не указана";
    const key = `name:${name.toLowerCase()}`;
    const logo = vacancy.employerLogo || vacancy.logo || vacancy.employerLogoUrl || knownLogos.get(key) || null;
    const stat = getOrCreateCompany(totals, key, name, logo);
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

function getOrCreateCompany(map, key, name, logo) {
  if (!map.has(key)) {
    map.set(key, {
      employerId: key,
      name,
      logo,
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

  return map.get(key);
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

function clampNumber(value, min, max, fallback) {
  const number = Number(value || fallback);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(number)));
}

main();
