(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("#mobileMenuButton");

  const KNOWLEDGE_TITLES = {
    "business-analysis": "Бизнес-анализ",
    "system-analysis": "Системный анализ",
    "ba-requirements-engineering": "Инженерия требований",
    "ba-requirement-types": "Виды требований",
    "ba-user-story": "Пользовательская история",
    "ba-use-case": "Сценарий использования",
    "ba-acceptance-criteria": "Критерии приемки",
    "ba-traceability": "Трассировка требований",
    "ba-stakeholders-communication": "Стейкхолдеры и коммуникации",
    "ba-interviews": "Интервью со стейкхолдерами",
    "ba-workshops": "Воркшопы",
    "ba-document-analysis": "Анализ документов",
    "ba-process-bpmn": "Анализ бизнес-процессов и BPMN",
    "ba-bpmn-foundation": "Основы BPMN",
    "ba-as-is-to-be": "Модели AS-IS / TO-BE",
    "ba-product-discovery": "Продуктовое исследование",
    "ba-metrics-analytics": "Метрики, аналитика и поддержка решений",
    "ba-kpi-design": "Проектирование KPI",
    "ba-funnel-analysis": "Анализ воронки",
    "ba-ab-testing": "Основы A/B-тестирования",
    "ba-documentation-knowledge": "Документация и управление знаниями",
    "ba-prioritization-delivery": "Приоритизация, бэклог и поставка",
    "ba-ai-workflows": "AI-инструменты в работе бизнес-аналитика",
    "sa-system-thinking": "Системное мышление и контекст решения",
    "sa-system-boundaries": "Границы системы",
    "sa-domain-uml-contracts": "Моделирование предметной области, UML и контракты данных",
    "sa-domain-model": "Модель предметной области",
    "sa-use-case-diagram": "Диаграмма вариантов использования",
    "sa-sequence-diagram": "Диаграмма последовательности",
    "sa-class-diagram": "Диаграмма классов",
    "sa-state-machine": "Диаграмма состояний",
    "sa-data-contract": "Контракт данных",
    "sa-api-interface": "API и проектирование интерфейсов",
    "sa-http": "Основы HTTP",
    "sa-rest-api": "REST API",
    "sa-openapi": "OpenAPI / Swagger",
    "sa-api-errors": "Модель ошибок API",
    "sa-api-pagination": "Пагинация API",
    "sa-api-versioning": "Версионирование API",
    "sa-api-auth": "Аутентификация в API",
    "sa-graphql": "GraphQL",
    "sa-grpc": "gRPC",
    "sa-soap": "SOAP",
    "sa-integrations-patterns": "Интеграции и интеграционные паттерны",
    "sa-sync-integration": "Синхронная интеграция",
    "sa-async-integration": "Асинхронная интеграция",
    "sa-file-exchange": "Файловый обмен",
    "sa-retries-timeouts": "Повторы и таймауты",
    "sa-idempotency": "Идемпотентность и дедупликация",
    "sa-dlq": "Очередь ошибочных сообщений (DLQ)",
    "sa-saga": "Паттерн Saga",
    "sa-outbox-inbox": "Outbox / Inbox",
    "sa-cdc": "CDC",
    "sa-databases-sql": "Базы данных, SQL и моделирование данных",
    "sa-sql-basics": "Основы SQL",
    "sa-relational-model": "Реляционная модель",
    "sa-erd": "ERD",
    "sa-data-dictionary": "Словарь данных",
    "sa-transactions": "Транзакции",
    "sa-indexes": "Индексы и план запроса",
    "sa-event-driven-messaging": "Event-driven architecture и брокеры сообщений",
    "sa-broker-basics": "Основы брокеров сообщений",
    "sa-kafka": "Kafka",
    "sa-rabbitmq": "RabbitMQ",
    "sa-event-modeling": "Моделирование событий",
    "sa-event-contracts": "Контракты событий",
    "sa-event-sourcing": "Event sourcing",
    "sa-cqrs": "CQRS",
    "sa-distributed-reliability": "Распределенные системы и надежность",
    "sa-partial-failure": "Частичные отказы",
    "sa-consistency-availability": "Консистентность и доступность",
    "sa-cap-pacelc": "CAP / PACELC на практике",
    "sa-circuit-breaker": "Circuit breaker",
    "sa-slo-sla-sli": "SLO / SLA / SLI",
    "sa-architecture-nfr": "Архитектура, НФТ и компромиссы",
    "sa-c4-model": "Модель C4",
    "sa-component-design": "Проектирование компонентов",
    "sa-monolith-microservices": "Монолит и микросервисы",
    "sa-performance-nfr": "НФТ по производительности",
    "sa-availability-nfr": "НФТ по доступности",
    "sa-maintainability-nfr": "НФТ по сопровождаемости",
    "sa-adr": "Архитектурная запись решения (ADR)",
    "sa-security-compliance": "Безопасность, доступы и соответствие требованиям",
    "sa-authn-authz": "Аутентификация и авторизация",
    "sa-rbac-abac": "RBAC / ABAC",
    "sa-oauth-oidc": "OAuth 2.0 и OpenID Connect",
    "sa-jwt": "JWT",
    "sa-pii": "Персональные данные",
    "sa-networking-protocols": "Сети и протоколы",
    "sa-tcp-ip": "Основы TCP/IP",
    "sa-dns": "DNS",
    "sa-tls": "TLS",
    "sa-http-versions": "HTTP/1.1, HTTP/2 и HTTP/3",
    "sa-proxy-gateway": "Proxy и API Gateway",
    "sa-load-balancing": "Балансировка нагрузки",
    "sa-observability-performance": "Наблюдаемость, производительность и эксплуатация",
    "sa-logs": "Логи",
    "sa-metrics": "Технические метрики",
    "sa-traces": "Трейсы",
    "sa-correlation-id": "Сквозной идентификатор запроса (Correlation ID)",
    "sa-dashboards": "Операционные дашборды",
    "sa-alerting": "Алертинг",
    "sa-testing-release": "Тестирование и готовность к релизу",
    "sa-test-strategy": "Стратегия тестирования",
    "sa-acceptance-testing": "Приемочное тестирование",
    "sa-contract-testing": "Контрактное тестирование",
    "sa-integration-testing": "Интеграционное тестирование",
    "sa-migration-testing": "Тестирование миграций",
    "sa-feature-flags": "Feature flags",
    "sa-rollback-plan": "План отката",
    "sa-release-checklist": "Release checklist",
    "sa-ai-workflows": "AI-инструменты в работе системного аналитика"
  };

  const SKILL_TARGETS = {
    sql: "sa-sql-basics",
    postgresql: "sa-sql-basics",
    "ms sql": "sa-sql-basics",
    bpmn: "ba-bpmn-foundation",
    uml: "sa-domain-uml-contracts",
    "системный анализ": "sa-system-thinking",
    api: "sa-api-interface",
    rest: "sa-rest-api",
    "rest api": "sa-rest-api",
    "swagger/openapi": "sa-openapi",
    swagger: "sa-openapi",
    openapi: "sa-openapi",
    "бизнес-анализ": "ba-requirements-engineering",
    интеграции: "sa-integrations-patterns",
    интеграция: "sa-integrations-patterns",
    excel: "ba-metrics-analytics",
    английский: "ba-stakeholders-communication",
    метрики: "ba-metrics-analytics",
    коммуникация: "ba-stakeholders-communication",
    bi: "ba-metrics-analytics",
    "power bi": "ba-metrics-analytics",
    tableau: "ba-metrics-analytics",
    datalens: "ba-metrics-analytics",
    confluence: "ba-documentation-knowledge",
    "agile/scrum": "ba-prioritization-delivery",
    agile: "ba-prioritization-delivery",
    scrum: "ba-prioritization-delivery",
    jira: "ba-prioritization-delivery",
    kafka: "sa-kafka",
    rabbitmq: "sa-rabbitmq",
    soap: "sa-soap",
    python: "ba-metrics-analytics",
    git: "sa-testing-release",
    тз: "ba-requirements-engineering",
    dwh: "sa-databases-sql",
    etl: "sa-databases-sql",
    "a/b-тесты": "ba-ab-testing",
    "a/b тесты": "ba-ab-testing"
  };

  attachDashboardAssets();
  setupMobileMenu();
  setupSmoothNavigation();
  setupViewButtons();
  localizeKnowledgeTree();
  bindSkillRowsToKnowledge();

  function attachDashboardAssets() {
    attachStylesheet("dashboard-boards.css");
    attachStylesheet("parser-refresh-ui.css");
    attachScript("parser-refresh-ui.js");
  }

  function attachStylesheet(href) {
    if (document.querySelector(`link[href='${href}']`)) return;

    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = href;
    document.head.append(stylesheet);
  }

  function attachScript(src) {
    if (document.querySelector(`script[src='${src}']`)) return;

    const script = document.createElement("script");
    script.src = src;
    document.body.append(script);
  }

  function setupMobileMenu() {
    if (!header || !menuButton) return;

    menuButton.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupSmoothNavigation() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;

      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      closeMobileMenu();

      const view = link.dataset.openView;
      if (view) openDashboardView(view);

      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
  }

  function setupViewButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-open-view]");
      if (!button) return;

      openDashboardView(button.dataset.openView);
      document.querySelector("#dashboard")?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
  }

  function openDashboardView(view) {
    const tab = [...document.querySelectorAll("[data-view-target]")].find((item) => item.dataset.viewTarget === view);
    if (tab) {
      tab.click();
      return;
    }

    document.querySelectorAll("[data-view]").forEach((section) => {
      section.classList.toggle("active", section.dataset.view === view);
    });
  }

  function closeMobileMenu() {
    if (header) header.classList.remove("menu-open");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  }

  function getScrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function localizeKnowledgeTree() {
    const tree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
    if (!tree.length) return;

    walk(tree, (node) => {
      const title = KNOWLEDGE_TITLES[node.id] || toReadableTitle(node.id, node.title);
      if (title) {
        node.title = title;
        node.aliases = unique([...(node.aliases || []), title]);
        node.keywords = unique([...(node.keywords || []), title]);
      }
    });

    window.PREPBASE_KNOWLEDGE_TITLES = KNOWLEDGE_TITLES;
    window.PREPBASE_SKILL_TO_KNOWLEDGE = {
      ...SKILL_TARGETS,
      resolve(skillName) {
        const normalized = normalize(skillName);
        if (SKILL_TARGETS[normalized]) return SKILL_TARGETS[normalized];

        let result = "";
        walk(tree, (node) => {
          if (result) return;
          const title = normalize(node.title);
          const aliases = (node.aliases || []).map(normalize);
          if (title === normalized || aliases.includes(normalized)) result = node.id;
        });
        return result;
      }
    };

    refreshKnowledgeDom();
    refreshTopicOptions();
  }

  function refreshKnowledgeDom() {
    Object.entries(KNOWLEDGE_TITLES).forEach(([id, title]) => {
      const node = document.querySelector(`[data-knowledge-node="${cssEscape(id)}"]`);
      const titleElement = node?.querySelector(".knowledge-node-title");
      if (titleElement) titleElement.textContent = title;

      document.querySelectorAll(`[data-topic-id="${cssEscape(id)}"], [data-knowledge-target="${cssEscape(id)}"]`).forEach((item) => {
        const nestedTitle = item.querySelector(".knowledge-sidebar-title, .topic-title, .knowledge-node-title");
        if (nestedTitle) nestedTitle.textContent = title;
      });
    });
  }

  function refreshTopicOptions() {
    document.querySelectorAll("select").forEach((select) => {
      [...select.options].forEach((option) => {
        if (KNOWLEDGE_TITLES[option.value]) option.textContent = KNOWLEDGE_TITLES[option.value];
      });
    });
  }

  function bindSkillRowsToKnowledge() {
    injectSkillLinkStyles();
    markSkillRows();

    const list = document.querySelector("#skillsList");
    if (!list) return;

    const observer = new MutationObserver(markSkillRows);
    observer.observe(list, { childList: true, subtree: true });

    list.addEventListener("click", (event) => {
      const row = event.target.closest(".skill-row[data-knowledge-target]");
      if (!row) return;
      event.preventDefault();
      openKnowledgeTarget(row.dataset.knowledgeTarget);
    });

    list.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      const row = event.target.closest(".skill-row[data-knowledge-target]");
      if (!row) return;
      event.preventDefault();
      openKnowledgeTarget(row.dataset.knowledgeTarget);
    });
  }

  function markSkillRows() {
    document.querySelectorAll("#skillsList .skill-row").forEach((row) => {
      const name = row.querySelector(".skill-name")?.textContent?.trim();
      const targetId = window.PREPBASE_SKILL_TO_KNOWLEDGE?.resolve?.(name) || SKILL_TARGETS[normalize(name)];
      if (!targetId) return;

      row.dataset.knowledgeTarget = targetId;
      row.classList.add("is-knowledge-link");
      if (!row.hasAttribute("tabindex")) row.setAttribute("tabindex", "0");
      if (!row.hasAttribute("role")) row.setAttribute("role", "button");
      row.setAttribute("aria-label", `Открыть тему в базе знаний: ${KNOWLEDGE_TITLES[targetId] || name}`);
      row.title = `Открыть в базе знаний: ${KNOWLEDGE_TITLES[targetId] || name}`;
    });
  }

  function openKnowledgeTarget(targetId) {
    if (!targetId) return;

    openDashboardView("knowledge");

    const title = KNOWLEDGE_TITLES[targetId] || findNodeTitle(targetId) || "";
    const search = document.querySelector("#knowledgeSearch");
    if (search && title) {
      search.value = title;
      search.dispatchEvent(new Event("input", { bubbles: true }));
    }

    window.dispatchEvent(new CustomEvent("prepbase:focus-knowledge", { detail: { nodeId: targetId } }));

    window.setTimeout(() => {
      const node = document.querySelector(`[data-knowledge-node="${cssEscape(targetId)}"]`);
      node?.scrollIntoView({ behavior: getScrollBehavior(), block: "center" });
      node?.classList.add("knowledge-node-highlight");
      window.setTimeout(() => node?.classList.remove("knowledge-node-highlight"), 1800);
    }, 120);
  }

  function findNodeTitle(targetId) {
    let result = "";
    const tree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
    walk(tree, (node) => {
      if (node.id === targetId) result = node.title;
    });
    return result;
  }

  function injectSkillLinkStyles() {
    if (document.querySelector("#skillKnowledgeLinkStyles")) return;

    const style = document.createElement("style");
    style.id = "skillKnowledgeLinkStyles";
    style.textContent = `
      #skillsList .skill-row.is-knowledge-link { cursor: pointer; }
      #skillsList .skill-row.is-knowledge-link .skill-name::after {
        content: "↗";
        display: inline-block;
        margin-left: 8px;
        color: #8b5cf6;
        font-size: 0.86em;
      }
      #skillsList .skill-row.is-knowledge-link:focus-visible {
        outline: 2px solid rgba(139, 92, 246, 0.85);
        outline-offset: 3px;
      }
      .knowledge-node-highlight {
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.75), 0 18px 42px rgba(139, 92, 246, 0.22);
      }
    `;
    document.head.append(style);
  }

  function toReadableTitle(id, fallback) {
    if (!id) return fallback || "";

    return id
      .replace(/^(ba|sa)-/, "")
      .split("-")
      .filter(Boolean)
      .map((part) => {
        const dictionary = {
          api: "API",
          ai: "AI",
          bpmn: "BPMN",
          c4: "C4",
          cdc: "CDC",
          cqrs: "CQRS",
          cjm: "CJM",
          dlq: "DLQ",
          dns: "DNS",
          erd: "ERD",
          grpc: "gRPC",
          http: "HTTP",
          jwt: "JWT",
          kpi: "KPI",
          mvp: "MVP",
          nfr: "НФТ",
          oauth: "OAuth",
          oidc: "OIDC",
          okr: "OKR",
          rest: "REST",
          sql: "SQL",
          tls: "TLS",
          uml: "UML",
          analysis: "анализ",
          architecture: "архитектура",
          auth: "авторизация",
          basics: "основы",
          broker: "брокеры",
          business: "бизнес",
          communication: "коммуникации",
          context: "контекст",
          contracts: "контракты",
          data: "данные",
          databases: "базы данных",
          design: "проектирование",
          documentation: "документация",
          engineering: "инженерия",
          event: "события",
          integration: "интеграция",
          integrations: "интеграции",
          interface: "интерфейсы",
          knowledge: "знания",
          management: "управление",
          metrics: "метрики",
          model: "модель",
          modeling: "моделирование",
          patterns: "паттерны",
          performance: "производительность",
          process: "процесс",
          product: "продукт",
          release: "релиз",
          requirements: "требования",
          security: "безопасность",
          stakeholders: "стейкхолдеры",
          strategy: "стратегия",
          system: "система",
          testing: "тестирование",
          types: "виды"
        };
        return dictionary[part] || part;
      })
      .join(" ")
      .replace(/^./, (char) => char.toUpperCase());
  }

  function walk(nodes, callback) {
    nodes.forEach((node) => {
      callback(node);
      walk(node.children || [], callback);
    });
  }

  function unique(values) {
    return [...new Set(values.filter(Boolean).map(String))];
  }

  function normalize(value) {
    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[–—]/g, "-")
      .replace(/\s+/g, " ");
  }

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(value) : String(value).replaceAll('"', '\\"');
  }
})();
