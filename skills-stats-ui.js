(function renderJobSiteSkills() {
  const stats = window.PREPBASE_SKILL_STATS || {};
  const skills = Array.isArray(stats.skills) ? stats.skills : [];
  const companies = Array.isArray(stats.companyStats) ? stats.companyStats : [];
  const updatedAt = document.querySelector("#skillsUpdatedAt");
  const summary = document.querySelector("#skillsSummary");
  const list = document.querySelector("#skillsList");
  const companyElements = getCompanyElements();

  if (!updatedAt || !summary || !list) return;

  renderSkills(stats, skills, updatedAt, summary, list);
  if (companyElements.count && companyElements.summary && companyElements.list) {
    renderCompanies(stats, companies, companyElements);
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

function renderCompanies(stats, companies, elements) {
  const meta = stats.companyStatsMeta || {};
  const sortedCompanies = getSortedCompanies(companies);
  const totalCompanies = Number(meta.totalCompanies || sortedCompanies.length);

  setupCompanyFilters(sortedCompanies, elements, () => renderCompanies(stats, companies, elements));

  const filters = getCompanyFilters(elements);
  const filteredCompanies = filterCompanies(sortedCompanies, filters);
  const maxCount = Math.max(...sortedCompanies.map((company) => company.vacanciesCount), 1);

  elements.count.textContent = filteredCompanies.length === totalCompanies
    ? `${totalCompanies} ${getPlural(totalCompanies, "компания", "компании", "компаний")}`
    : `${filteredCompanies.length} из ${totalCompanies} ${getPlural(totalCompanies, "компании", "компаний", "компаний")}`;

  elements.summary.textContent = sortedCompanies.length
    ? `Показано ${filteredCompanies.length} из ${totalCompanies} компаний. Строки отсортированы по количеству открытых неархивных вакансий.`
    : "Статистика по компаниям появится после успешного запуска парсинга hh.ru.";

  if (!sortedCompanies.length) {
    elements.list.classList.remove("companies-gantt");
    elements.list.innerHTML = `<div class="empty-state">Пока нет данных по компаниям.</div>`;
    return;
  }

  if (!filteredCompanies.length) {
    elements.list.classList.remove("companies-gantt");
    elements.list.innerHTML = `<div class="empty-state">По выбранным фильтрам компаний нет.</div>`;
    return;
  }

  elements.list.classList.add("companies-gantt");
  elements.list.innerHTML = `
    <div class="company-gantt-scale" aria-hidden="true">
      <span></span>
      <span></span>
      <span>0</span>
      <span>25%</span>
      <span>50%</span>
      <span>75%</span>
      <span>${maxCount}</span>
    </div>
    ${filteredCompanies.map((company) => renderCompanyRow(company, maxCount)).join("")}
  `;
}

function getCompanyElements() {
  return {
    count: document.querySelector("#companiesCount"),
    summary: document.querySelector("#companiesSummary"),
    list: document.querySelector("#companiesList"),
    filters: document.querySelector("#companyFilters"),
    search: document.querySelector("#companySearch"),
    role: document.querySelector("#companyRoleFilter"),
    area: document.querySelector("#companyAreaFilter"),
    min: document.querySelector("#companyMinVacancies"),
    minValue: document.querySelector("#companyMinVacanciesValue"),
    reset: document.querySelector("#companyFiltersReset")
  };
}

function setupCompanyFilters(companies, elements, onChange) {
  if (!elements.filters) return;

  const signature = companies
    .map((company) => `${company.employerId || company.name}:${company.vacanciesCount}`)
    .join("|");

  if (elements.filters.dataset.companySignature !== signature) {
    populateCompanySelect(elements.role, getCompanyOptionStats(companies, "roles"), "Все роли");
    populateCompanySelect(elements.area, getCompanyOptionStats(companies, "areas"), "Все регионы");
    setupCompanyMinFilter(companies, elements);
    elements.filters.dataset.companySignature = signature;
  }

  updateCompanyMinValue(elements);

  if (elements.filters.dataset.ready === "true") return;

  elements.search?.addEventListener("input", onChange);
  elements.role?.addEventListener("change", onChange);
  elements.area?.addEventListener("change", onChange);
  elements.min?.addEventListener("input", onChange);
  elements.reset?.addEventListener("click", () => {
    if (elements.search) elements.search.value = "";
    if (elements.role) elements.role.value = "";
    if (elements.area) elements.area.value = "";
    if (elements.min) elements.min.value = "0";
    updateCompanyMinValue(elements);
    onChange();
  });

  elements.filters.dataset.ready = "true";
}

function setupCompanyMinFilter(companies, elements) {
  if (!elements.min) return;
  const maxVacancies = Math.max(...companies.map((company) => company.vacanciesCount), 0);
  elements.min.max = String(maxVacancies);
  if (Number(elements.min.value || 0) > maxVacancies) elements.min.value = String(maxVacancies);
}

function updateCompanyMinValue(elements) {
  if (elements.minValue && elements.min) {
    elements.minValue.textContent = elements.min.value || "0";
  }
}

function populateCompanySelect(select, options, defaultLabel) {
  if (!select) return;
  const selectedValue = select.value;
  select.innerHTML = `
    <option value="">${escapeHtml(defaultLabel)}</option>
    ${options
    .map(({ name, count }) => `<option value="${escapeAttr(name)}">${escapeHtml(name)} (${count})</option>`)
    .join("")}
  `;
  if (options.some((option) => option.name === selectedValue)) select.value = selectedValue;
}

function getCompanyOptionStats(companies, field) {
  const totals = new Map();
  for (const company of companies) {
    for (const [name, count] of Object.entries(company[field] || {})) {
      if (count > 0) totals.set(name, (totals.get(name) || 0) + count);
    }
  }
  return [...totals.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
}

function getCompanyFilters(elements) {
  return {
    search: normalizeForSearch(elements.search?.value || ""),
    role: elements.role?.value || "",
    area: elements.area?.value || "",
    minVacancies: Number(elements.min?.value || 0)
  };
}

function filterCompanies(companies, filters) {
  return companies.filter((company) => {
    if (filters.search && !normalizeForSearch(company.name).includes(filters.search)) return false;
    if (filters.role && !hasCount(company.roles, filters.role)) return false;
    if (filters.area && !hasCount(company.areas, filters.area)) return false;
    if (filters.minVacancies && company.vacanciesCount < filters.minVacancies) return false;
    return true;
  });
}

function getSortedCompanies(companies) {
  return [...companies]
    .map((company) => ({
      ...company,
      vacanciesCount: Number(company.vacanciesCount || 0)
    }))
    .filter((company) => company.vacanciesCount > 0)
    .sort((a, b) => b.vacanciesCount - a.vacanciesCount || String(a.name).localeCompare(String(b.name), "ru"));
}

function hasCount(value, key) {
  return Number((value || {})[key] || 0) > 0;
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
      <span class="company-count">${count} ${getPlural(count, "вакансия", "вакансии", "вакансий")}</span>
      <div class="company-bar" aria-hidden="true">
        <span style="width: ${width}%"></span>
      </div>
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
    `Топ навыков: ${skills || "нет данных"}`,
    `Регионы: ${areas || "нет данных"}`,
    `Период публикаций: ${first} - ${last}`
  ].join("\n");
}

function formatCountObject(value, limit = Infinity) {
  return Object.entries(value || {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "ru"))
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

function normalizeForSearch(value) {
  return String(value || "").trim().toLowerCase();
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
