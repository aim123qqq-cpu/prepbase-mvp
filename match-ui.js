(() => {
  prepareCompatibilityMarkup();

  const elements = {
    form: document.querySelector("#matchForm"),
    vacancyText: document.querySelector("#matchVacancyText"),
    resumeText: document.querySelector("#matchResumeText"),
    score: document.querySelector("#matchScore"),
    summary: document.querySelector("#matchSummary"),
    matched: document.querySelector("#matchMatchedSkills"),
    missing: document.querySelector("#matchMissingSkills"),
    reset: document.querySelector("#matchReset")
  };

  if (!elements.form) return;

  const skillCatalog = [
    skill("SQL", "sa-sql-basics", ["postgresql", "ms sql", "mysql", "oracle", "запросы sql"]),
    skill("REST API", "sa-rest-api", ["rest", "http api", "api", "restful"]),
    skill("OpenAPI / Swagger", "sa-openapi", ["openapi", "swagger", "api contract"]),
    skill("HTTP", "sa-http", ["http", "http/2", "http/3"]),
    skill("BPMN", "ba-bpmn-foundation", ["bpmn 2.0", "бизнес-процесс", "процессная модель"]),
    skill("UML", "sa-domain-uml-contracts", ["sequence diagram", "диаграмма последовательности", "activity diagram"]),
    skill("Kafka", "sa-kafka", ["apache kafka", "kafka streams"]),
    skill("RabbitMQ", "sa-rabbitmq", ["message broker", "брокер сообщений", "очереди сообщений"]),
    skill("GraphQL", "sa-graphql", ["graphql"]),
    skill("gRPC", "sa-grpc", ["grpc", "protobuf", "protocol buffers"]),
    skill("SOAP", "sa-soap", ["soap", "wsdl", "xml api"]),
    skill("Интеграции", "sa-integrations-patterns", ["интеграция", "интеграционное взаимодействие", "integration"]),
    skill("Идемпотентность", "sa-idempotency", ["idempotency", "идемпотентный"]),
    skill("Требования", "ba-requirements-engineering", ["requirements", "brd", "srs", "техническое задание", "тз"]),
    skill("User Story", "ba-user-story", ["user story", "пользовательская история"]),
    skill("Use Case", "ba-use-case", ["use case", "вариант использования", "сценарий использования"]),
    skill("Критерии приемки", "ba-acceptance-criteria", ["acceptance criteria", "критерии приёмки"]),
    skill("Трассировка требований", "ba-traceability", ["traceability", "матрица трассировки"]),
    skill("CJM", "ba-cjm", ["customer journey map", "карта клиентского пути"]),
    skill("RACI / DACI", "ba-raci-daci", ["raci", "daci"]),
    skill("Agile / Scrum", "ba-prioritization-delivery", ["agile", "scrum", "kanban"]),
    skill("Jira", "ba-prioritization-delivery", ["jira", "atlassian"]),
    skill("Confluence", "ba-documentation-knowledge", ["confluence"]),
    skill("Метрики", "ba-metrics-analytics", ["metrics", "kpi", "okr", "продуктовые метрики"]),
    skill("A/B-тестирование", "ba-ab-testing", ["a/b", "ab test", "a/b-тест"]),
    skill("DWH / ETL", "sa-databases-sql", ["dwh", "etl", "data warehouse", "хранилище данных"]),
    skill("ERD", "sa-erd", ["erd", "er diagram", "entity relationship"]),
    skill("Транзакции", "sa-transactions", ["acid", "transaction", "транзакционность"]),
    skill("Индексы", "sa-indexes", ["indexes", "index", "индексация"]),
    skill("C4", "sa-c4-model", ["c4 model", "контекстная диаграмма"]),
    skill("Микросервисы", "sa-monolith-microservices", ["microservice", "microservices", "сервисная архитектура"]),
    skill("НФТ", "sa-architecture-nfr", ["nfr", "non-functional", "нефункциональные требования"]),
    skill("OAuth / OIDC", "sa-oauth-oidc", ["oauth", "openid", "oidc"]),
    skill("JWT", "sa-jwt", ["jwt", "json web token"]),
    skill("RBAC / ABAC", "sa-rbac-abac", ["rbac", "abac", "ролевая модель"]),
    skill("TLS", "sa-tls", ["tls", "ssl", "https"]),
    skill("DNS", "sa-dns", ["dns"]),
    skill("API Gateway", "sa-proxy-gateway", ["api gateway", "gateway", "reverse proxy"]),
    skill("Логи", "sa-logs", ["logs", "logging", "логирование"]),
    skill("Метрики эксплуатации", "sa-metrics", ["prometheus", "grafana", "technical metrics"]),
    skill("Трейсы", "sa-traces", ["traces", "tracing", "jaeger"]),
    skill("Контрактное тестирование", "sa-contract-testing", ["contract testing", "pact"]),
    skill("Интеграционное тестирование", "sa-integration-testing", ["integration testing"]),
    skill("Feature Flags", "sa-feature-flags", ["feature flag", "feature flags"]),
    skill("Английский", "ba-stakeholders-communication", ["english", "английский язык"]),
    skill("Коммуникации", "ba-stakeholders-communication", ["communication", "stakeholder", "стейкхолдеры"])
  ];

  function prepareCompatibilityMarkup() {
    document.querySelectorAll('[data-open-view="match"], [data-view-target="match"]').forEach((item) => {
      if (item.textContent.trim() === "Матч") item.textContent = "Совместимость";
    });

    const overviewButton = document.querySelector('.overview-section-card [data-open-view="match"]');
    const overviewCard = overviewButton?.closest(".overview-section-card");
    if (overviewCard) {
      const title = overviewCard.querySelector("h3");
      const copy = overviewCard.querySelector("p");
      if (title) title.textContent = "Совместимость";
      if (copy) copy.textContent = "Быстрая сверка вакансии и резюме: совпавшие навыки, пробелы и переходы к нужным темам базы знаний.";
      if (overviewButton) overviewButton.textContent = "Проверить";
    }

    const panel = document.querySelector('[data-view="match"] .match-panel');
    if (!panel) return;

    panel.querySelector(".eyebrow") && (panel.querySelector(".eyebrow").textContent = "Совместимость");
    const heading = panel.querySelector("#matchPanelTitle");
    if (heading) heading.textContent = "Вакансия ↔ резюме";

    panel.querySelector(".pill")?.remove();
    if (!panel.querySelector(".match-lead")) {
      const lead = document.createElement("p");
      lead.className = "match-lead";
      lead.textContent = "Вставьте два текста. AnalystKit покажет процент совпадения, сильные стороны и темы, которые стоит подтянуть.";
      heading?.insertAdjacentElement("afterend", lead);
    }

    removeInputLabel("#matchVacancyUrl");
    removeInputLabel("#matchResumeUrl");
    removeInputLabel("#matchResumeFile");
    document.querySelector(".match-input-row:empty")?.remove();

    const vacancy = document.querySelector("#matchVacancyText");
    const resume = document.querySelector("#matchResumeText");
    if (vacancy) {
      vacancy.rows = 10;
      vacancy.placeholder = "Вставьте требования, задачи и стек из вакансии";
      vacancy.closest("label")?.childNodes.forEach(renameLabelText("Вакансия"));
    }
    if (resume) {
      resume.rows = 10;
      resume.placeholder = "Вставьте опыт, навыки и проекты из резюме";
      resume.closest("label")?.childNodes.forEach(renameLabelText("Резюме"));
    }

    const submit = panel.querySelector('.match-actions button[type="submit"]');
    if (submit) submit.textContent = "Проверить совместимость";

    panel.querySelector("#matchScoreRing")?.remove();
    const scoreTop = panel.querySelector(".match-score-top");
    if (scoreTop) {
      const scoreContent = scoreTop.firstElementChild;
      scoreTop.replaceWith(...(scoreContent ? [...scoreContent.children] : []));
    }
  }

  function removeInputLabel(selector) {
    const input = document.querySelector(selector);
    const label = input?.closest("label");
    const row = input?.closest(".match-input-row");
    label?.remove();
    if (row && !row.querySelector("input, textarea, select")) row.remove();
  }

  function renameLabelText(text) {
    let done = false;
    return (node) => {
      if (done || node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) return;
      node.textContent = `\n                ${text}\n                `;
      done = true;
    };
  }

  renderResult({ vacancySkills: [], resumeSkills: [], matched: [], missing: [], score: 0 });

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const vacancySkills = findSkills(elements.vacancyText.value);
    const resumeSkills = findSkills(elements.resumeText.value);
    const matched = vacancySkills.filter((item) => resumeSkills.some((candidate) => candidate.id === item.id));
    const missing = vacancySkills.filter((item) => !matched.some((candidate) => candidate.id === item.id));
    const score = vacancySkills.length ? Math.round((matched.length / vacancySkills.length) * 100) : 0;
    renderResult({ vacancySkills, resumeSkills, matched, missing, score });
  });

  elements.reset.addEventListener("click", () => {
    elements.form.reset();
    renderResult({ vacancySkills: [], resumeSkills: [], matched: [], missing: [], score: 0 });
  });

  elements.missing.addEventListener("click", handleKnowledgeClick);
  elements.matched.addEventListener("click", handleKnowledgeClick);

  function findSkills(text) {
    const normalized = normalize(text);
    if (!normalized) return [];
    return skillCatalog.filter((item) => item.aliases.some((alias) => hasPhrase(normalized, alias)));
  }

  function renderResult(result) {
    elements.score.textContent = `${result.score}%`;
    elements.summary.textContent = getSummary(result);
    elements.matched.innerHTML = renderSkills(result.matched, "is-hit") || `<span class="match-empty">Совпадения появятся после проверки.</span>`;
    elements.missing.innerHTML = renderSkills(result.missing, "") || `<span class="match-empty">Критичных пробелов пока не найдено.</span>`;
  }

  function renderSkills(items, className) {
    return items
      .map((item) => `
        <span class="match-chip ${className}">
          <button type="button" data-knowledge-target="${escapeHtml(item.targetId)}">${escapeHtml(item.name)}</button>
        </span>
      `)
      .join("");
  }

  function getSummary({ vacancySkills, matched, missing, score }) {
    if (!vacancySkills.length) {
      return "Добавьте текст вакансии и резюме, чтобы увидеть совместимость.";
    }
    if (score >= 80) return `Сильное совпадение: закрыто ${matched.length} из ${vacancySkills.length} ключевых требований.`;
    if (score >= 50) return `Средняя совместимость: закрыто ${matched.length} из ${vacancySkills.length}, стоит добрать ${missing.length} тем.`;
    return `Низкая совместимость: закрыто ${matched.length} из ${vacancySkills.length}, основные пробелы вынесены ниже.`;
  }

  function handleKnowledgeClick(event) {
    const button = event.target.closest("[data-knowledge-target]");
    if (!button) return;
    const nodeId = button.dataset.knowledgeTarget;
    if (!nodeId) return;

    if (typeof window.PREPBASE_FOCUS_KNOWLEDGE_NODE === "function") {
      window.PREPBASE_FOCUS_KNOWLEDGE_NODE(nodeId);
    } else {
      document.dispatchEvent(new CustomEvent("prepbase:focus-knowledge", { detail: { nodeId } }));
    }

    document.querySelector("#dashboard")?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
  }

  function skill(name, targetId, aliases) {
    return {
      id: normalize(name),
      name,
      targetId,
      aliases: [name, ...aliases].map(normalize)
    };
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[–—]/g, "-")
      .replace(/[^a-zа-я0-9+#./-]+/gi, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasPhrase(text, phrase) {
    if (!phrase) return false;
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "i").test(text);
  }

  function getScrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
