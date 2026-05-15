(function renderJobSiteSkills() {
  const stats = window.PREPBASE_SKILL_STATS || {};
  const skills = Array.isArray(stats.skills) ? stats.skills : [];
  const companies = Array.isArray(stats.companyStats) ? stats.companyStats : [];
  const updatedAt = document.querySelector("#skillsUpdatedAt");
  const summary = document.querySelector("#skillsSummary");
  const list = document.querySelector("#skillsList");
  const companiesCount = document.querySelector("#companiesCount");
  const companiesSummary = document.querySelector("#companiesSummary");
  const companiesList = document.querySelector("#companiesList");

  if (!updatedAt || !summary || !list) return;

  renderSkills(stats, skills, updatedAt, summary, list);
  if (companiesCount && companiesSummary && companiesList) {
    renderCompanies(stats, companies, companiesCount, companiesSummary, companiesList);
  }
})();

function renderSkills(stats, skills, updatedAt, summary, list) {
  const maxCount = Math.max(...skills.map((skill) => skill.count), 1);

  updatedAt.textContent = stats.updatedAt
    ? `Обновлено ${formatDate(stats.updatedAt)}`
    : "Ожидает парсинг";

  summary.textContent = stats.updatedAt
    ? `Проанализировано ${stats.totalVacancies || 0} вакансий из ${(stats.sources || []).length} источников. Навыки отсортированы от частых к редким.`
    : "Статистика появится после первого запуска парсинга вакансий в GitHub Actions.";

  if (!skills.length) {
    list.classList.remove("skills-gantt");
    list.innerHTML = `<div class="empty-state">Пока нет собранных навыков.</div>`;
    return;
  }

  list.classList.add("skills-gantt");
  list.innerHTML = `
    <div class="gantt-scale" aria-hidden="true">
      <span></span>
      <span>0</span>
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>${maxCount}</span>
    </div>
    ${skills
    .map((skill) => {
      const width = Math.max(6, Math.round((skill.count / maxCount) * 100));
      return `
        <article class="skill-row">
          <span class="skill-name">${escapeHtml(skill.name)}</span>
          <div class="skill-bar" aria-hidden="true"><span style="width: ${width}%"></span></div>
          <span class="skill-count">${skill.count} ${getPlural(skill.count, "упоминание", "упоминания", "упоминаний")}</span>
        </article>
      `;
    })
    .join("")}
  `;
}

function renderCompanies(stats, companies, count, summary, list) {
  const meta = stats.companyStatsMeta || {};
  const maxCount = Math.max(...companies.map((company) => company.vacanciesCount), 1);

  count.textContent = `${meta.totalCompanies || companies.length} ${getPlural(meta.totalCompanies || companies.length, "компания", "компании", "компаний")}`;
  summary.textContent = companies.length
    ? `Показано ${companies.length} из ${meta.totalCompanies || companies.length} компаний. Длина бара равна количеству открытых неархивных вакансий.`
    : "Статистика по компаниям появится после успешного запуска парсинга hh.ru.";

  if (!companies.length) {
    list.classList.remove("companies-gantt");
    list.innerHTML = `<div class="empty-state">Пока нет данных по компаниям.</div>`;
    return;
  }

  list.classList.add("companies-gantt");
  list.innerHTML = `
    <div class="company-gantt-scale" aria-hidden="true">
      <span></span>
      <span>0</span>
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>${maxCount}</span>
    </div>
    ${companies.map((company) => renderCompanyRow(company, maxCount)).join("")}
  `;
}

function renderCompanyRow(company, maxCount) {
  const count = Number(company.vacanciesCount || 0);
  const width = Math.max(6, Math.round((count / maxCount) * 100));
  const tooltip = buildCompanyTooltip(company);
  const initials = getInitials(company.name);

  return `
    <article class="company-row" title="${escapeAttr(tooltip)}">
      <div class="company-cell">
        ${company.logo
          ? `<img class="company-logo" src="${escapeAttr(company.logo)}" alt="" loading="lazy" referrerpolicy="no-referrer" />`
          : `<span class="company-logo placeholder">${escapeHtml(initials)}</span>`}
        <span class="company-name">${escapeHtml(company.name || "Компания не указана")}</span>
      </div>
      <div class="company-bar" aria-hidden="true">
        <span style="width: ${width}%"></span>
      </div>
      <span class="company-count">${count} ${getPlural(count, "вакансия", "вакансии", "вакансий")}</span>
    </article>
  `;
}

function buildCompanyTooltip(company) {
  const roles = formatCountObject(company.roles);
  const skills = formatCountObject(company.skills, 5);
  const areas = formatCountObject(company.areas);
  const first = company.firstPublishedAt ? formatDate(company.firstPublishedAt) : "неизвестно";
  const last = company.lastPublishedAt ? formatDate(company.lastPublishedAt) : "неизвестно";

  return [
    company.name || "Компания не указана",
    `Вакансий: ${company.vacanciesCount || 0}`,
    `Роли: ${roles || "нет данных"}`,
    `Топ-5 навыков: ${skills || "нет данных"}`,
    `Регионы: ${areas || "нет данных"}`,
    `Период публикаций: ${first} - ${last}`
  ].join("\n");
}

function formatCountObject(value, limit = Infinity) {
  return Object.entries(value || {})
    .filter(([, count]) => count > 0)
    .slice(0, limit)
    .map(([name, count]) => `${name}: ${count}`)
    .join(", ");
}

function getInitials(value) {
  const words = String(value || "")
    .replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("");
  return (initials || "??").toUpperCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll("\n", "&#10;");
}

function getPlural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
