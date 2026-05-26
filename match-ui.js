(() => {
  const elements = {
    form: document.querySelector("#matchForm"),
    vacancyUrl: document.querySelector("#matchVacancyUrl"),
    resumeUrl: document.querySelector("#matchResumeUrl"),
    vacancyText: document.querySelector("#matchVacancyText"),
    resumeText: document.querySelector("#matchResumeText"),
    resumeFile: document.querySelector("#matchResumeFile"),
    score: document.querySelector("#matchScore"),
    ring: document.querySelector("#matchScoreRing"),
    summary: document.querySelector("#matchSummary"),
    matched: document.querySelector("#matchMatchedSkills"),
    missing: document.querySelector("#matchMissingSkills"),
    reset: document.querySelector("#matchReset")
  };

  if (!elements.form) return;

  const skillCatalog = [
    skill("SQL", "sa-sql-basics", ["sql", "postgresql", "ms sql", "mysql", "oracle"]),
    skill("REST API", "sa-rest-api", ["rest", "rest api", "http api", "api"]),
    skill("OpenAPI / Swagger", "sa-openapi", ["openapi", "swagger"]),
    skill("HTTP", "sa-http", ["http", "http/2", "http/3"]),
    skill("BPMN", "ba-bpmn-foundation", ["bpmn", "бизнес-процесс", "процесс"]),
    skill("UML", "sa-domain-uml-contracts", ["uml", "sequence diagram", "диаграмма последовательности"]),
    skill("Kafka", "sa-kafka", ["kafka", "apache kafka"]),
    skill("RabbitMQ", "sa-rabbitmq", ["rabbitmq", "message broker", "брокер сообщений"]),
    skill("GraphQL", "sa-graphql", ["graphql"]),
    skill("gRPC", "sa-grpc", ["grpc", "protobuf"]),
    skill("SOAP", "sa-soap", ["soap", "wsdl"]),
    skill("Интеграции", "sa-integrations-patterns", ["интеграции", "интеграция", "integration"]),
    skill("Идемпотентность", "sa-idempotency", ["идемпотентность", "idempotency"]),
    skill("Требования", "ba-requirements-engineering", ["требования", "requirements", "brd", "srs"]),
    skill("User Story", "ba-user-story", ["user story", "пользовательская история"]),
    skill("Use Case", "ba-use-case", ["use case", "вариант использования"]),
    skill("Критерии приемки", "ba-acceptance-criteria", ["acceptance criteria", "критерии приемки", "критерии приёмки"]),
    skill("Трассировка требований", "ba-traceability", ["traceability", "трассировка"]),
    skill("CJM", "ba-cjm", ["cjm", "customer journey map", "карта клиентского пути"]),
    skill("RACI / DACI", "ba-raci-daci", ["raci", "daci"]),
    skill("Agile / Scrum", "ba-prioritization-delivery", ["agile", "scrum", "kanban"]),
    skill("Jira", "ba-prioritization-delivery", ["jira", "atlassian"]),
    skill("Confluence", "ba-documentation-knowledge", ["confluence"]),
    skill("Метрики", "ba-metrics-analytics", ["метрики", "metrics", "kpi", "okr"]),
    skill("A/B-тестирование", "ba-ab-testing", ["a/b", "ab test", "a/b-тест"]),
    skill("DWH / ETL", "sa-databases-sql", ["dwh", "etl", "data warehouse"]),
    skill("ERD", "sa-erd", ["erd", "er diagram", "entity relationship"]),
    skill("Транзакции", "sa-transactions", ["транзакции", "acid", "transaction"]),
    skill("Индексы", "sa-indexes", ["индексы", "indexes", "index"]),
    skill("C4", "sa-c4-model", ["c4", "c4 model"]),
    skill("Микросервисы", "sa-monolith-microservices", ["микросервис", "microservice"]),
    skill("НФТ", "sa-architecture-nfr", ["нфт", "nfr", "non-functional"]),
    skill("OAuth / OIDC", "sa-oauth-oidc", ["oauth", "openid", "oidc"]),
    skill("JWT", "sa-jwt", ["jwt"]),
    skill("RBAC / ABAC", "sa-rbac-abac", ["rbac", "abac"]),
    skill("TLS", "sa-tls", ["tls", "ssl"]),
    skill("DNS", "sa-dns", ["dns"]),
    skill("API Gateway", "sa-proxy-gateway", ["api gateway", "gateway"]),
    skill("Логи", "sa-logs", ["логи", "logs", "logging"]),
    skill("Метрики эксплуатации", "sa-metrics", ["prometheus", "grafana", "technical metrics"]),
    skill("Трейсы", "sa-traces", ["traces", "tracing", "jaeger"]),
    skill("Контрактное тестирование", "sa-contract-testing", ["contract testing", "контрактное тестирование"]),
    skill("Интеграционное тестирование", "sa-integration-testing", ["integration testing", "интеграционное тестирование"]),
    skill("Feature Flags", "sa-feature-flags", ["feature flag", "feature flags"]),
    skill("Английский", "ba-stakeholders-communication", ["английский", "english"]),
    skill("Коммуникации", "ba-stakeholders-communication", ["коммуникации", "communication", "stakeholder"])
  ];

  renderResult({ vacancySkills: [], resumeSkills: [], matched: [], missing: [], score: 0 });

  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const resumeFileText = await readResumeFile();
    const vacancyText = [elements.vacancyUrl.value, elements.vacancyText.value].join(" ");
    const resumeText = [elements.resumeUrl.value, elements.resumeText.value, resumeFileText].join(" ");
    const vacancySkills = findSkills(vacancyText);
    const resumeSkills = findSkills(resumeText);
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

  async function readResumeFile() {
    const file = elements.resumeFile.files?.[0];
    if (!file) return "";
    try {
      return await file.text();
    } catch {
      return "";
    }
  }

  function findSkills(text) {
    const normalized = normalize(text);
    if (!normalized) return [];
    return skillCatalog.filter((item) => item.aliases.some((alias) => hasPhrase(normalized, alias)));
  }

  function renderResult(result) {
    elements.score.textContent = `${result.score}%`;
    elements.ring.style.setProperty("--score", result.score);
    elements.summary.textContent = getSummary(result);
    elements.matched.innerHTML = renderSkills(result.matched, "is-hit") || `<span class="match-empty">Совпадения появятся после сравнения.</span>`;
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
      return "Добавьте описание вакансии и резюме, чтобы увидеть совместимость.";
    }
    if (score >= 80) return `Сильное совпадение: закрыто ${matched.length} из ${vacancySkills.length} ключевых требований.`;
    if (score >= 50) return `Средний матч: закрыто ${matched.length} из ${vacancySkills.length}, стоит добрать ${missing.length} тем.`;
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
