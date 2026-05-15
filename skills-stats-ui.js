(function renderJobSiteSkills() {
  const stats = window.PREPBASE_SKILL_STATS || {};
  const skills = Array.isArray(stats.skills) ? stats.skills : [];
  const updatedAt = document.querySelector("#skillsUpdatedAt");
  const summary = document.querySelector("#skillsSummary");
  const list = document.querySelector("#skillsList");

  if (!updatedAt || !summary || !list) return;

  const maxCount = Math.max(...skills.map((skill) => skill.count), 1);

  updatedAt.textContent = stats.updatedAt
    ? `Обновлено ${formatDate(stats.updatedAt)}`
    : "Ожидает парсинг";

  summary.textContent = stats.updatedAt
    ? `Проанализировано ${stats.totalVacancies || 0} вакансий из ${(stats.sources || []).length} сайтов. Навыки отсортированы от частых к редким.`
    : "Статистика появится после первого запуска ежедневного парсинга сайтов в GitHub Actions.";

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
})();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
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
