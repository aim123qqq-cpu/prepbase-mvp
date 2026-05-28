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
    insightVacancy: document.querySelector("#matchInsightVacancy"),
    insightMatched: document.querySelector("#matchInsightMatched"),
    insightMissing: document.querySelector("#matchInsightMissing"),
    nextSteps: document.querySelector("#matchNextSteps"),
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

    const scoreCard = panel.querySelector(".match-score-card");
    if (scoreCard && !panel.querySelector("#matchInsightGrid")) {
      const grid = document.createElement("div");
      grid.className = "match-insight-grid";
      grid.id = "matchInsightGrid";
      grid.innerHTML = `
        <article class="match-insight">
          <span>Требования</span>
          <strong id="matchInsightVacancy">0</strong>
          <p>найдено в вакансии</p>
        </article>
        <article class="match-insight">
          <span>Закрыто</span>
          <strong id="matchInsightMatched">0</strong>
          <p>подтверждено резюме</p>
        </article>
        <article class="match-insight">
          <span>Пробелы</span>
          <strong id="matchInsightMissing">0</strong>
          <p>в фокус подготовки</p>
        </article>
      `;
      scoreCard.insertAdjacentElement("afterend", grid);
    }

    const columns = panel.querySelector(".match-columns");
    if (columns && !panel.querySelector("#matchNextSteps")) {
      const focus = document.createElement("article");
      focus.className = "match-focus-card";
      focus.innerHTML = `
        <div class="match-focus-heading">
          <h3>Фокус подготовки</h3>
          <span>приоритеты</span>
        </div>
        <div class="match-focus-list" id="matchNextSteps"></div>
      `;
      columns.insertAdjacentElement("afterend", focus);
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
  elements.nextSteps?.addEventListener("click", handleKnowledgeClick);

  function findSkills(text) {
    const normalized = normalize(text);
    if (!normalized) return [];
    return skillCatalog.filter((item) => item.aliases.some((alias) => hasPhrase(normalized, alias)));
  }

  function renderResult(result) {
    elements.score.textContent = `${result.score}%`;
    elements.summary.textContent = getSummary(result);
    elements.insightVacancy && (elements.insightVacancy.textContent = result.vacancySkills.length);
    elements.insightMatched && (elements.insightMatched.textContent = result.matched.length);
    elements.insightMissing && (elements.insightMissing.textContent = result.missing.length);
    elements.matched.innerHTML = renderSkills(result.matched, "is-hit") || `<span class="match-empty">Совпадения появятся после проверки.</span>`;
    elements.missing.innerHTML = renderSkills(result.missing, "") || `<span class="match-empty">Критичных пробелов пока не найдено.</span>`;
    if (elements.nextSteps) elements.nextSteps.innerHTML = renderNextSteps(result);
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
    if (score >= 80) return `Сильное совпадение: закрыто ${matched.length} из ${vacancySkills.length} ключевых требований. Можно идти в отклик и усилить резюме примерами проектов.`;
    if (score >= 50) return `Рабочая совместимость: закрыто ${matched.length} из ${vacancySkills.length}. Ниже вынесены темы, которые сильнее всего поднимут шанс на интервью.`;
    return `Совместимость пока слабая: закрыто ${matched.length} из ${vacancySkills.length}. Сначала закройте базовые пробелы из блока фокуса.`;
  }

  function renderNextSteps({ vacancySkills, missing }) {
    if (!vacancySkills.length) {
      return `<p class="match-empty">После проверки здесь появится короткий план добора навыков под конкретную вакансию.</p>`;
    }
    if (!missing.length) {
      return `<p class="match-empty">Основные требования закрыты. Следующий шаг — добавить в резюме измеримые результаты, контекст проекта и роль в принятии решений.</p>`;
    }

    return missing
      .slice(0, 4)
      .map((item, index) => `
        <button class="match-focus-item" type="button" data-knowledge-target="${escapeHtml(item.targetId)}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(item.name)}</strong>
          <small>${escapeHtml(getFocusHint(item.name))}</small>
        </button>
      `)
      .join("");
  }

  function getFocusHint(name) {
    const hints = {
      "SQL": "подготовьте JOIN, агрегации, индексы и разбор медленных запросов",
      "REST API": "проверьте методы, статусы, ошибки, пагинацию и контракт",
      "OpenAPI / Swagger": "умейте читать и проектировать контракт API",
      "HTTP": "освежите методы, заголовки, статусы и клиент-серверную модель",
      "BPMN": "повторите события, шлюзы, дорожки и декомпозицию процесса",
      "UML": "сфокусируйтесь на sequence/activity диаграммах и сценариях",
      "Kafka": "разберите topics, partitions, consumer groups и delivery guarantees",
      "RabbitMQ": "проверьте очереди, exchange, routing key и retry/DLQ",
      "GraphQL": "сравните с REST, разберите schema, query, mutation",
      "gRPC": "подготовьте protobuf, contract-first и отличие от REST",
      "SOAP": "повторите WSDL, XML, envelope и enterprise-интеграции",
      "Интеграции": "соберите картину синхронных и асинхронных взаимодействий",
      "Требования": "проверьте сбор, детализацию, критерии приемки и трассировку",
      "User Story": "подготовьте формат, INVEST и критерии приемки",
      "Use Case": "разберите основной, альтернативные и ошибочные сценарии",
      "CJM": "свяжите путь клиента с болью, метриками и требованиями",
      "Agile / Scrum": "освежите backlog, refinement, DoR/DoD и приоритизацию",
      "Jira": "покажите опыт ведения backlog и связей задач",
      "Confluence": "подготовьте примеры структурированной документации",
      "ERD": "повторите сущности, связи, кардинальности и нормализацию",
      "OAuth / OIDC": "разберите flows, scopes, tokens и роли участников",
      "JWT": "проверьте структуру токена, claims, expiration и риски",
      "RBAC / ABAC": "умейте объяснить модель прав и матрицу доступов",
      "API Gateway": "свяжите gateway с routing, auth, rate limits и observability"
    };
    return hints[name] || "откройте тему в базе знаний и закройте базовые ожидания интервью";
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
