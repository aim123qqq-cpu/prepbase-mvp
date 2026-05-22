(() => {
  const stats = window.PREPBASE_SKILL_STATS || {};
  const elements = getElements();

  if (!elements.button && !elements.buttonSource) return;

  normalizeRefreshButton(elements);
  renderParserSummary(stats, elements);
  setupRefresh(stats, elements);

  function getElements() {
    return {
      meta: document.querySelector("#parserOverviewMeta"),
      vacanciesMeta: document.querySelector("#parserVacanciesMeta"),
      skillsValue: document.querySelector("#parserSkillsValue"),
      companiesValue: document.querySelector("#parserCompaniesValue"),
      status: document.querySelector("#parserStatusValue"),
      statusMeta: document.querySelector("#parserStatusMeta"),
      button: document.querySelector("#parserRefreshButton"),
      buttonSource: document.querySelector(".parser-refresh-link")
    };
  }

  function normalizeRefreshButton(elements) {
    const source = elements.button || elements.buttonSource;
    if (!source) return;

    let button = source;
    if (source.tagName !== "BUTTON") {
      button = document.createElement("button");
      button.className = `${source.className} parser-refresh-button`.trim();
      button.type = "button";
      button.id = "parserRefreshButton";
      button.setAttribute("aria-live", "polite");
      source.replaceWith(button);
    } else {
      button = source.cloneNode(false);
      source.replaceWith(button);
    }

    button.classList.add("parser-refresh-button");
    button.removeAttribute("href");
    button.removeAttribute("target");
    button.removeAttribute("rel");
    button.innerHTML = `
      <span class="parser-refresh-spinner" aria-hidden="true"></span>
      <span class="parser-refresh-label">Обновить данные</span>
    `;

    elements.button = button;
    elements.label = button.querySelector(".parser-refresh-label");
  }

  function renderParserSummary(stats, elements) {
    const skills = Array.isArray(stats.skills) ? stats.skills : [];
    const companies = Array.isArray(stats.companyStats) ? stats.companyStats : [];
    const totalVacancies = Number(stats.totalVacancies || 0);
    const sourcesCount = Array.isArray(stats.sources) ? stats.sources.length : 0;
    const hasData = totalVacancies > 0 || skills.length > 0 || companies.length > 0;

    if (elements.meta) {
      elements.meta.textContent = hasData
        ? `Срез рынка: ${formatCount(totalVacancies)} ${plural(totalVacancies, "вакансия", "вакансии", "вакансий")}, ${formatCount(skills.length)} ${plural(skills.length, "уникальный навык", "уникальных навыка", "уникальных навыков")}, ${formatCount(companies.length)} ${plural(companies.length, "компания", "компании", "компаний")}. Обновление: ${stats.updatedAt ? formatDateValue(stats.updatedAt) : "ожидается"}.`
        : "Сохраненного среза рынка пока нет. После успешного запуска здесь появится статистика по вакансиям, навыкам и компаниям.";
    }

    if (elements.vacanciesMeta) {
      elements.vacanciesMeta.textContent = sourcesCount
        ? `${sourcesCount} ${plural(sourcesCount, "источник", "источника", "источников")} в последнем срезе`
        : "открытые вакансии из поиска hh.ru";
    }

    updateCardNote(elements.skillsValue, "уникальные навыки из описаний");
    updateCardNote(elements.companiesValue, "работодатели с открытыми вакансиями");

    if (elements.status) {
      elements.status.textContent = hasData ? "Данные готовы" : "Ожидает";
    }

    if (elements.statusMeta) {
      elements.statusMeta.textContent = stats.updatedAt
        ? `Последний запуск: ${formatDateValue(stats.updatedAt)}`
        : "Ожидаем первый успешный запуск";
    }
  }

  function setupRefresh(stats, elements) {
    const button = elements.button;
    if (!button || button.dataset.refreshReady === "true") return;

    button.addEventListener("click", async () => {
      if (button.classList.contains("is-loading")) return;

      const endpoint = getRefreshEndpoint(stats);
      setButtonState(elements, true, "Обновляем...");

      try {
        if (!endpoint) {
          await wait(900);
          setStatus(
            elements,
            "Нужен endpoint",
            "Автозапуск парсера требует защищенный endpoint. В статической версии GitHub Pages токен GitHub хранить нельзя."
          );
          return;
        }

        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "parse:skills",
            requestedAt: new Date().toISOString(),
            source: "sa-halper-dashboard"
          })
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        setStatus(
          elements,
          "Запуск отправлен",
          "Парсер поставлен в очередь. Данные обновятся после завершения сборки GitHub Pages."
        );
      } catch (error) {
        setStatus(elements, "Ошибка запуска", `Не удалось отправить запуск: ${error.message}`);
      } finally {
        setButtonState(elements, false, "Обновить данные");
      }
    });

    button.dataset.refreshReady = "true";
  }

  function updateCardNote(valueElement, text) {
    const note = valueElement?.parentElement?.querySelector("p");
    if (note) note.textContent = text;
  }

  function getRefreshEndpoint(stats) {
    return (
      window.PREPBASE_REFRESH_ENDPOINT ||
      stats.refreshEndpoint ||
      document.querySelector("meta[name='prepbase-refresh-endpoint']")?.content ||
      ""
    ).trim();
  }

  function setButtonState(elements, isLoading, label) {
    elements.button.classList.toggle("is-loading", isLoading);
    elements.button.disabled = isLoading;
    elements.button.setAttribute("aria-busy", String(isLoading));
    if (elements.label) elements.label.textContent = label;
  }

  function setStatus(elements, status, meta) {
    if (elements.status) elements.status.textContent = status;
    if (elements.statusMeta) elements.statusMeta.textContent = meta;
  }

  function formatCount(value) {
    return new Intl.NumberFormat("ru-RU").format(Number(value || 0));
  }

  function formatDateValue(value) {
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(value));
    } catch {
      return value;
    }
  }

  function plural(value, one, few, many) {
    const mod10 = Math.abs(value) % 10;
    const mod100 = Math.abs(value) % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  }

  function wait(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
