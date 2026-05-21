window.PREPBASE_KNOWLEDGE_SOURCES = {
  "iiba-babok": { title: "IIBA BABOK", url: "https://www.iiba.org/career-resources/a-business-analysis-professionals-foundation-for-success/babok/" },
  "ireb-cpre": { title: "IREB CPRE Foundation", url: "https://cpre.ireb.org/en/concept/foundationlevel" },
  "omg-bpmn": { title: "OMG BPMN 2.0", url: "https://www.omg.org/spec/BPMN/2.0/" },
  "omg-uml": { title: "OMG UML", url: "https://www.omg.org/spec/UML/" },
  "openapi": { title: "OpenAPI Specification", url: "https://spec.openapis.org/oas/latest.html" },
  "mdn-http": { title: "MDN HTTP", url: "https://developer.mozilla.org/en-US/docs/Web/HTTP" },
  "postgresql": { title: "PostgreSQL SQL", url: "https://www.postgresql.org/docs/current/sql.html" },
  "microservices-patterns": { title: "Microservices.io Patterns", url: "https://microservices.io/patterns/" },
  "openid-connect": { title: "OpenID Connect", url: "https://openid.net/developers/how-connect-works/" }
};

const kbLeaf = (id, title, summary) => ({ id, title, summary });
const kbDomain = (id, title, summary, details, children, sources = []) => ({ id, title, summary, details, children, sources });

window.PREPBASE_KNOWLEDGE_TREE = [
  {
    id: "business-analysis",
    topicId: "business-analysis",
    title: "Бизнес-анализ",
    summary: "Работа от бизнес-проблемы к согласованным требованиям, процессам, метрикам и внедрению изменений.",
    details: [
      "Ветка покрывает BA-практику: стратегия, стейкхолдеры, требования, процессы, discovery, метрики, приоритизация и adoption.",
      "Структура пригодна для roadmap, интервью, skill gap analysis и будущих AI-рекомендаций."
    ],
    sources: ["iiba-babok", "ireb-cpre"],
    children: [
      kbDomain("ba-strategy-context", "Strategy & Business Context", "Бизнес-модель, цели, ограничения и ожидаемый эффект от изменений.", ["Interview focus: problem framing, success criteria, business value.", "Production: problem statement, business case, constraints map."], [
        kbLeaf("ba-business-model", "Business model", "Value proposition, customer segments, channels, partners, cost/revenue logic."),
        kbLeaf("ba-goals-kpi-okr", "Goals, KPI, OKR", "Измеримые цели, KPI, OKR, North Star Metric и критерии успеха."),
        kbLeaf("ba-problem-framing", "Problem framing", "Problem statement, root cause analysis, current state и target state."),
        kbLeaf("ba-business-case", "Business case", "Benefits, risks, costs, assumptions, options and decision memo."),
        kbLeaf("ba-capability-map", "Capability map", "Карта бизнес-возможностей и связь инициатив с operating model.")
      ], ["iiba-babok"]),
      kbDomain("ba-stakeholders-communication", "Stakeholder Management & Communication", "Карта участников, decision rights, коммуникации и управление конфликтами.", ["Interview focus: conflicting requirements, decision owner, escalation.", "Production: stakeholder map, RACI/DACI, communication plan, decision log."], [
        kbLeaf("ba-stakeholder-map", "Stakeholder map", "Кто влияет на решение, кого затрагивает изменение, кто принимает финальное решение."),
        kbLeaf("ba-raci-daci", "RACI / DACI", "Роли ответственности, согласования и принятия решений."),
        kbLeaf("ba-communication-plan", "Communication plan", "Аудитория, формат, частота, каналы и ожидаемые артефакты коммуникации."),
        kbLeaf("ba-conflict-management", "Conflict management", "Фиксация противоречий, переговоры, trade-offs и escalation path."),
        kbLeaf("ba-executive-communication", "Executive communication", "Problem-first narrative, options, risks, impact and recommendation memo.")
      ], ["iiba-babok"]),
      kbDomain("ba-requirements-engineering", "Requirements Engineering", "Выявление, анализ, спецификация, валидация и управление требованиями.", ["Interview focus: requirement types, quality, acceptance criteria, traceability.", "Production: requirement spec, AC, RTM, change impact."], [
        kbLeaf("ba-requirement-types", "Requirement types", "Business, stakeholder, solution, functional, non-functional and transition requirements."),
        kbLeaf("ba-requirements-lifecycle", "Requirements lifecycle", "Elicitation, analysis, specification, validation, prioritization, traceability, change management."),
        kbLeaf("ba-requirement-quality", "Requirement quality", "Atomicity, completeness, consistency, testability, unambiguity, feasibility."),
        kbLeaf("ba-user-story", "User story", "Роль, потребность, ценность, acceptance criteria и границы сценария."),
        kbLeaf("ba-use-case", "Use case", "Акторы, основной поток, альтернативы, исключения и postconditions."),
        kbLeaf("ba-acceptance-criteria", "Acceptance criteria", "Проверяемые критерии приемки, positive/negative/boundary cases."),
        kbLeaf("ba-traceability", "Requirements traceability", "Связь цели, требования, задачи, теста, релиза и change impact.")
      ], ["iiba-babok", "ireb-cpre"]),
      kbDomain("ba-elicitation-facilitation", "Elicitation & Facilitation", "Техники добывания требований и согласования решений с участниками.", ["Interview focus: choosing elicitation techniques, incomplete information.", "Production: interview guide, workshop agenda, validated notes."], [
        kbLeaf("ba-interviews", "Interviews", "Подготовка вопросов, активное слушание, уточнение контекста и фиксация решений."),
        kbLeaf("ba-workshops", "Workshops", "Групповое выявление требований, divergence/convergence, dot voting, action items."),
        kbLeaf("ba-document-analysis", "Document analysis", "Извлечение правил, ограничений и терминологии из регламентов, договоров и отчетов."),
        kbLeaf("ba-observation", "Observation / shadowing", "Изучение реального процесса вместо описания процесса со слов."),
        kbLeaf("ba-prototyping", "Prototyping sessions", "Проверка понимания через макеты, сценарии и быстрые демонстрации.")
      ], ["ireb-cpre"]),
      kbDomain("ba-process-bpmn", "Business Process Analysis & BPMN", "AS-IS/TO-BE процессы, исключения, роли, правила и точки автоматизации.", ["Interview focus: pools/lanes, events, gateways, sequence flow vs message flow.", "Production: process diagrams, exception flows, SLA, automation points."], [
        kbLeaf("ba-process-discovery", "Process discovery", "Scope, actors, inputs, outputs, rules, exceptions и pain points."),
        kbLeaf("ba-bpmn-foundation", "BPMN foundation", "Pools, lanes, events, tasks, gateways, sequence flow, message flow, artifacts."),
        kbLeaf("ba-as-is-to-be", "AS-IS / TO-BE", "Текущий и целевой процесс, gap, bottlenecks и transition steps."),
        kbLeaf("ba-process-rules", "Business rules", "Правила, проверки, control points и исключения."),
        kbLeaf("ba-workflow-automation", "Workflow automation readiness", "Human tasks, service tasks, integration points, workflow engine constraints.")
      ], ["omg-bpmn"]),
      kbDomain("ba-product-discovery", "Product Discovery & Product Thinking", "Проверка проблем, гипотез, сегментов, MVP и продуктовой ценности до разработки.", ["Interview focus: hypothesis validation, MVP, scope slicing.", "Production: hypothesis backlog, discovery summary, experiment results."], [
        kbLeaf("ba-opportunity-discovery", "Opportunity discovery", "Поиск проблем и возможностей через данные, пользователей и бизнес-цели."),
        kbLeaf("ba-user-research", "User research", "Интервью, наблюдение, сегменты, jobs и pain points."),
        kbLeaf("ba-hypothesis-management", "Hypothesis management", "Формулировка, приоритизация и проверка гипотез."),
        kbLeaf("ba-jtbd", "Jobs To Be Done", "Работа пользователя, контекст, desired outcome и alternatives."),
        kbLeaf("ba-mvp-slicing", "MVP slicing", "Минимальный проверяемый объем вместо первой большой версии."),
        kbLeaf("ba-experiment-design", "Experiment design", "Метрика, выборка, контроль, критерий успеха и вывод.")
      ]),
      kbDomain("ba-metrics-analytics", "Metrics, Analytics & Decision Support", "Метрики продукта и процесса, по которым можно принимать решения.", ["Interview focus: KPI vs vanity metrics, funnel, cohort, retention, data quality.", "Production: metric tree, dashboard requirements, decision criteria."], [
        kbLeaf("ba-kpi-design", "KPI design", "Связь цели, поведения пользователей, процесса и измеримого показателя."),
        kbLeaf("ba-funnel-analysis", "Funnel analysis", "Шаги, конверсия, drop-off, segment view и interpretation."),
        kbLeaf("ba-cohort-retention", "Cohort, retention, churn", "Поведение групп во времени и устойчивость эффекта."),
        kbLeaf("ba-unit-economics", "Unit economics", "Revenue, cost, margin, CAC/LTV basics для продуктовых решений."),
        kbLeaf("ba-ab-testing", "A/B testing basics", "Гипотеза, вариант, контроль, метрика, длительность и риски интерпретации."),
        kbLeaf("ba-data-quality", "Data quality", "Полнота, точность, актуальность, дубли, ownership и lineage.")
      ]),
      kbDomain("ba-customer-service-design", "Customer & Service Design", "Клиентский путь, точки контакта, service blueprint и pain points.", ["Interview focus: CJM vs service blueprint.", "Production: journey map, pain point list, opportunity map."], [
        kbLeaf("ba-personas", "Personas", "Сегменты пользователей, цели, контекст и ограничения."),
        kbLeaf("ba-cjm", "Customer Journey Map", "Stages, touchpoints, emotions, pain points, opportunities."),
        kbLeaf("ba-service-blueprint", "Service blueprint", "Frontend touchpoints, backstage process, systems and support operations."),
        kbLeaf("ba-accessibility", "Accessibility basics", "Базовые требования доступности пользовательских сценариев.")
      ]),
      kbDomain("ba-prioritization-delivery", "Prioritization, Backlog & Delivery", "Backlog, scope, value, risk, dependencies и delivery flow.", ["Interview focus: when everything is urgent, RICE/MoSCoW/WSJF.", "Production: prioritized backlog, scoring rationale, release scope."], [
        kbLeaf("ba-backlog-structure", "Backlog structure", "Epic, feature, story, task, defect и связь с целью."),
        kbLeaf("ba-story-mapping", "Story mapping", "Пользовательский путь, backbone, walking skeleton и release slices."),
        kbLeaf("ba-moscow", "MoSCoW", "Must, Should, Could, Won’t как простой язык scope negotiation."),
        kbLeaf("ba-rice", "RICE", "Reach, Impact, Confidence, Effort для продуктовой приоритизации."),
        kbLeaf("ba-wsjf", "WSJF", "Cost of delay / job size для enterprise-решений."),
        kbLeaf("ba-release-scope", "Release scope management", "Что входит, что не входит, зависимости и критерии готовности.")
      ]),
      kbDomain("ba-documentation-knowledge", "Documentation & Knowledge Management", "Single source of truth, glossary, decision log, traceability и актуальность знаний.", ["Interview focus: analyst documents and documentation decay.", "Production: docs structure, glossary, ADR, changelog."], [
        kbLeaf("ba-doc-architecture", "Documentation architecture", "Структура базы знаний по аудиториям, жизненному циклу и типам решений."),
        kbLeaf("ba-glossary", "Glossary", "Термины предметной области, определения, синонимы и ownership."),
        kbLeaf("ba-context-diagrams", "Context diagrams", "Граница решения, акторы, внешние системы и high-level flow."),
        kbLeaf("ba-adr", "ADR / decision log", "Решения, контекст, варианты, последствия и дата пересмотра."),
        kbLeaf("ba-change-log", "Change log", "Что изменилось, почему, кого затрагивает и где проверить.")
      ]),
      kbDomain("ba-change-adoption", "Change, Adoption & Operations", "Внедрение изменений, обучение пользователей, support handover и post-release evaluation.", ["Interview focus: why release is not adoption.", "Production: rollout plan, training scope, support handover."], [
        kbLeaf("ba-change-impact", "Change impact analysis", "Кого и какие процессы затрагивает изменение."),
        kbLeaf("ba-rollout-planning", "Rollout planning", "Порядок запуска, риски, communication plan и fallback."),
        kbLeaf("ba-user-adoption", "User adoption", "Как пользователи узнают, принимают и начинают применять изменение."),
        kbLeaf("ba-support-handover", "Support handover", "FAQ, known issues, runbook, owners и escalation path."),
        kbLeaf("ba-post-release", "Post-release evaluation", "Сверка результата с метриками и гипотезами после релиза.")
      ]),
      kbDomain("ba-ai-workflows", "AI-assisted BA Workflows", "AI для ускорения работы аналитика при обязательной человеческой проверке.", ["Interview focus: validating AI-generated requirements.", "Production: prompt templates, review checklist, human approval points."], [
        kbLeaf("ba-ai-meeting-summary", "Meeting summarization", "Структурирование встреч в решения, вопросы, риски и action items."),
        kbLeaf("ba-ai-requirements-review", "Requirement quality review", "Проверка требований на неоднозначность, полноту и тестируемость."),
        kbLeaf("ba-ai-gap-detection", "Gap detection", "Поиск пропущенных сценариев, ролей, исключений и зависимостей."),
        kbLeaf("ba-ai-knowledge-enrichment", "Knowledge base enrichment", "Обогащение базы знаний без потери source of truth и ownership.")
      ])
    ]
  },
  {
    id: "system-analysis",
    topicId: "system-analysis",
    title: "Системный анализ",
    summary: "Переход от требований к системной модели: API, данные, интеграции, события, надежность, безопасность и эксплуатация.",
    details: [
      "Ветка покрывает SA-практику: системный контекст, доменные модели, API, интеграции, данные, EDA, reliability и production readiness.",
      "Структура учитывает интервью и production-практики enterprise/BigTech."
    ],
    sources: ["openapi", "omg-uml", "microservices-patterns"],
    children: [
      kbDomain("sa-system-thinking", "System Thinking & Solution Context", "Границы системы, внешние зависимости, runtime context и trade-offs.", ["Interview focus: system boundaries and external dependencies.", "Production: context diagram, boundary description, dependency list."], [
        kbLeaf("sa-system-boundaries", "System boundaries", "Что входит в систему, что вне ее, кто владеет ответственностью."),
        kbLeaf("sa-context-diagram", "Context diagram", "Акторы, внешние системы, потоки данных и направления интеграций."),
        kbLeaf("sa-capabilities", "Capabilities and responsibilities", "Что система умеет и за какие бизнес-возможности отвечает."),
        kbLeaf("sa-runtime-context", "Runtime context", "Где система работает, как вызывается, чем ограничена в эксплуатации."),
        kbLeaf("sa-tradeoffs", "Trade-off thinking", "Выбор между скоростью, стоимостью, надежностью, сложностью и масштабируемостью.")
      ]),
      kbDomain("sa-domain-uml-contracts", "Domain Modeling, UML & Data Contracts", "Модель предметной области, UML-диаграммы и контракты данных.", ["Interview focus: domain model vs DB model, sequence diagram, compatibility.", "Production: domain model, sequence diagram, schema contract."], [
        kbLeaf("sa-domain-model", "Domain model", "Entities, value objects, aggregates, invariants, bounded contexts."),
        kbLeaf("sa-ubiquitous-language", "Ubiquitous language", "Единый язык бизнеса, аналитики и разработки."),
        kbLeaf("sa-use-case-diagram", "Use case diagram", "Акторы, цели и границы сценариев."),
        kbLeaf("sa-sequence-diagram", "Sequence diagram", "Взаимодействие компонентов по времени, вызовы, ответы и ошибки."),
        kbLeaf("sa-class-diagram", "Class diagram", "Структура объектов, связи, атрибуты и ограничения."),
        kbLeaf("sa-state-machine", "State machine", "Статусы сущности, события перехода и запрещенные состояния."),
        kbLeaf("sa-data-contract", "Data contract", "Schema, required/optional fields, validation, compatibility, versioning.")
      ], ["omg-uml"]),
      kbDomain("sa-api-interface", "APIs & Interface Design", "HTTP/REST/OpenAPI и альтернативные API-стили как стабильные контракты.", ["Interview focus: idempotency, errors, pagination, versioning, auth.", "Production: API spec, error model, compatibility policy."], [
        kbLeaf("sa-http", "HTTP foundation", "Request/response, headers, methods, status codes, caching, content negotiation."),
        kbLeaf("sa-rest-api", "REST API", "Resources, URI design, filtering, sorting, pagination, idempotency, error model."),
        kbLeaf("sa-openapi", "OpenAPI", "Paths, schemas, components, examples, mock, contract-first workflow."),
        kbLeaf("sa-api-errors", "API error model", "Код, сообщение, детали, correlation id, recoverability и локализация."),
        kbLeaf("sa-api-pagination", "Pagination", "Offset, cursor, page size, sorting stability и performance constraints."),
        kbLeaf("sa-api-versioning", "API versioning", "Breaking/non-breaking changes, deprecation, migration, consumer communication."),
        kbLeaf("sa-api-auth", "API authentication", "API keys, OAuth 2.0, OpenID Connect, JWT, scopes, mTLS basics."),
        kbLeaf("sa-graphql", "GraphQL", "Schema, query, mutation, resolver, authorization and overfetching trade-offs."),
        kbLeaf("sa-grpc", "gRPC", "Proto contracts, service methods, streaming, compatibility and client constraints."),
        kbLeaf("sa-soap", "SOAP", "XML, WSDL, envelope, operations and enterprise legacy integration.")
      ], ["openapi", "mdn-http", "openid-connect"]),
      kbDomain("sa-integrations-patterns", "Integrations & Integration Patterns", "Sync/async integrations, errors, retries, idempotency and consistency patterns.", ["Interview focus: sync vs async, retries, duplicates, DLQ, outbox.", "Production: integration scheme, failure policy, monitoring requirements."], [
        kbLeaf("sa-sync-integration", "Synchronous integration", "Request-reply flow, latency budget, timeout and immediate feedback."),
        kbLeaf("sa-async-integration", "Asynchronous integration", "Event or command accepted now and processed later."),
        kbLeaf("sa-file-exchange", "File exchange", "CSV/XML/JSON/XLSX, schedules, reconciliation and error reports."),
        kbLeaf("sa-retries-timeouts", "Retries and timeouts", "Retry conditions, backoff, timeout budget and retry storm prevention."),
        kbLeaf("sa-idempotency", "Idempotency and deduplication", "Повторная обработка без повторного бизнес-эффекта."),
        kbLeaf("sa-dlq", "Dead Letter Queue", "Хранилище сообщений, которые не обработались штатно."),
        kbLeaf("sa-saga", "Saga", "Цепочка локальных транзакций с компенсирующими действиями."),
        kbLeaf("sa-outbox-inbox", "Outbox / Inbox", "Надежная публикация событий и deduplication при dual-write проблеме."),
        kbLeaf("sa-cdc", "CDC", "Change Data Capture для передачи изменений из источника данных.")
      ], ["microservices-patterns"]),
      kbDomain("sa-databases-sql", "Databases, SQL & Data Modeling", "SQL, реляционная модель, ERD, транзакции, индексы и data dictionary.", ["Interview focus: JOIN, GROUP BY, keys, normalization, transactions, indexes.", "Production: ERD, data dictionary, validation queries."], [
        kbLeaf("sa-sql-basics", "SQL foundation", "SELECT, JOIN, GROUP BY, HAVING, CTE, window functions."),
        kbLeaf("sa-relational-model", "Relational model", "Tables, primary key, foreign key, constraints, normalization, integrity."),
        kbLeaf("sa-erd", "ERD", "Сущности, связи, cardinality, optionality и business meaning."),
        kbLeaf("sa-data-dictionary", "Data dictionary", "Поля, типы, определения, owners, quality rules и examples."),
        kbLeaf("sa-transactions", "Transactions", "ACID, commit, rollback, isolation levels, locks."),
        kbLeaf("sa-indexes", "Indexes and query plan", "Indexes, cardinality, filtering, plan basics and trade-offs."),
        kbLeaf("sa-storage-types", "Storage types", "Relational, document, key-value, search, time series, analytical storage.")
      ], ["postgresql"]),
      kbDomain("sa-event-driven-messaging", "Event-Driven Architecture & Messaging", "Queues, topics, Kafka/RabbitMQ, event contracts and eventually consistent flows.", ["Interview focus: queue vs topic, consumer group, ordering, duplicate handling.", "Production: event catalog, topic contract, retry/DLQ policy."], [
        kbLeaf("sa-broker-basics", "Broker basics", "Queue, topic, producer, consumer, ack/nack, delivery guarantees."),
        kbLeaf("sa-kafka", "Kafka", "Topic, partition, offset, retention, consumer group, ordering, schema registry."),
        kbLeaf("sa-rabbitmq", "RabbitMQ", "Exchange, queue, binding, routing key, ack/nack and retry topology."),
        kbLeaf("sa-event-modeling", "Event modeling", "Business fact, event name, payload, producer, consumers and lifecycle."),
        kbLeaf("sa-event-contracts", "Event contracts", "Schema, compatibility, ownership, versioning and consumer impact."),
        kbLeaf("sa-event-sourcing", "Event sourcing", "State derived from immutable events and replay model."),
        kbLeaf("sa-cqrs", "CQRS", "Separate command and query models with consistency trade-offs."),
        kbLeaf("sa-stream-processing", "Stream processing", "Continuous processing of event streams and windows.")
      ], ["microservices-patterns"]),
      kbDomain("sa-distributed-reliability", "Distributed Systems & Reliability", "Partial failures, consistency, availability, resilience patterns and incident thinking.", ["Interview focus: partial failure, retry danger, eventual consistency, CAP intuition.", "Production: failure mode analysis, SLO, resilience requirements."], [
        kbLeaf("sa-partial-failure", "Partial failure", "Сеть и зависимые сервисы могут отказать частично и непредсказуемо."),
        kbLeaf("sa-consistency-availability", "Consistency and availability", "Strong/eventual consistency, availability and business trade-offs."),
        kbLeaf("sa-cap-pacelc", "CAP / PACELC intuition", "Как думать о распределенных компромиссах без механического цитирования."),
        kbLeaf("sa-replication-sharding", "Replication and sharding", "Копии данных, разделение нагрузки и operational complexity."),
        kbLeaf("sa-circuit-breaker", "Circuit breaker", "Предотвращение каскадных отказов при проблемной зависимости."),
        kbLeaf("sa-bulkhead-fallback", "Bulkhead and fallback", "Изоляция ресурсов и запасные сценарии поведения."),
        kbLeaf("sa-slo-sla-sli", "SLO / SLA / SLI", "Цели надежности, индикаторы и внешние обязательства."),
        kbLeaf("sa-incident-thinking", "Incident thinking", "Detection, impact, mitigation, postmortem and learning loop.")
      ], ["microservices-patterns"]),
      kbDomain("sa-architecture-nfr", "Architecture, NFRs & Trade-offs", "Architecture views, NFR, C4, components and decision records.", ["Interview focus: measurable NFRs and trade-off explanation.", "Production: NFR catalog, C4/context diagrams, ADR."], [
        kbLeaf("sa-c4-model", "C4 model", "Context, container, component and code-level communication."),
        kbLeaf("sa-component-design", "Component design", "Responsibilities, interfaces, dependencies and ownership."),
        kbLeaf("sa-monolith-microservices", "Monolith vs microservices", "Trade-offs по скорости разработки, complexity, deployability and scaling."),
        kbLeaf("sa-hexagonal-basics", "Hexagonal architecture basics", "Ports, adapters and isolation of domain logic."),
        kbLeaf("sa-performance-nfr", "Performance NFR", "Latency, throughput, load profile, capacity and test assumptions."),
        kbLeaf("sa-availability-nfr", "Availability NFR", "Uptime, degradation, dependencies and recovery expectations."),
        kbLeaf("sa-maintainability-nfr", "Maintainability NFR", "Supportability, evolvability, modularity and documentation."),
        kbLeaf("sa-adr", "Architecture Decision Record", "Context, decision, alternatives, consequences and review date.")
      ]),
      kbDomain("sa-security-compliance", "Security, Identity & Compliance", "Authentication, authorization, RBAC/ABAC, OAuth/OIDC, PII, audit and threat thinking.", ["Interview focus: authentication vs authorization, OAuth vs OIDC, JWT, audit.", "Production: access matrix, auth flow, PII and audit requirements."], [
        kbLeaf("sa-authn-authz", "Authentication vs authorization", "Кто пользователь и что ему разрешено делать."),
        kbLeaf("sa-rbac-abac", "RBAC / ABAC", "Роли, атрибуты, permissions, scopes and policy model."),
        kbLeaf("sa-oauth-oidc", "OAuth 2.0 & OpenID Connect", "Access token, refresh token, scopes, claims, authorization code flow."),
        kbLeaf("sa-jwt", "JWT", "Claims, signature, expiration, audience and common risks."),
        kbLeaf("sa-secrets", "Secrets management", "Где нельзя хранить секреты и какие требования фиксировать."),
        kbLeaf("sa-pii", "PII and personal data", "Классификация данных, consent, minimization, retention and masking."),
        kbLeaf("sa-audit", "Audit requirements", "Кто, что, когда сделал; traceability and non-repudiation."),
        kbLeaf("sa-threat-modeling", "Threat modeling basics", "Assets, threats, attack surface, mitigations and residual risk.")
      ], ["openid-connect"]),
      kbDomain("sa-networking-protocols", "Networking & Protocols", "Базовые сетевые знания для проектирования интеграций и диагностики.", ["Interview focus: what happens when URL is opened, DNS, TLS, proxy.", "Production: network assumptions, gateway/TLS requirements, connectivity risks."], [
        kbLeaf("sa-tcp-ip", "TCP/IP basics", "Packets, connections, ports and reliability at transport level."),
        kbLeaf("sa-dns", "DNS", "Name resolution and operational failure points."),
        kbLeaf("sa-tls", "TLS", "Encryption in transit, certificates and trust chain basics."),
        kbLeaf("sa-http-versions", "HTTP/1.1, HTTP/2, HTTP/3", "Protocol evolution and practical impact for API consumers."),
        kbLeaf("sa-proxy-gateway", "Proxy and gateway", "Routing, auth, rate limits, transformation and observability point."),
        kbLeaf("sa-load-balancing", "Load balancing", "Distribution of traffic and health checks."),
        kbLeaf("sa-network-zones", "Network zones and firewall", "Access boundaries, allowlists and enterprise connectivity constraints.")
      ], ["mdn-http"]),
      kbDomain("sa-observability-performance", "Observability, Performance & Operations", "Logs, metrics, traces, correlation ID, dashboards, alerting and runbooks.", ["Interview focus: what to log, correlation ID, monitoring vs observability.", "Production: observability requirements, dashboard metrics, alert/runbook inputs."], [
        kbLeaf("sa-logs", "Logs", "Business and technical events, levels, structured fields and retention."),
        kbLeaf("sa-metrics", "Metrics", "Counters, gauges, histograms, business and technical indicators."),
        kbLeaf("sa-traces", "Traces", "Distributed request path and dependency latency."),
        kbLeaf("sa-correlation-id", "Correlation ID", "Сквозной идентификатор запроса в логах, событиях и ошибках."),
        kbLeaf("sa-dashboards", "Dashboards", "Operational view: health, latency, errors, throughput and business signals."),
        kbLeaf("sa-alerting", "Alerting", "Actionable alerts, thresholds, noise control and ownership."),
        kbLeaf("sa-runbooks", "Runbooks", "Что делать при инциденте: diagnosis, mitigation, escalation, rollback."),
        kbLeaf("sa-capacity-planning", "Capacity planning", "Volume assumptions, growth, bottlenecks and resource needs.")
      ]),
      kbDomain("sa-testing-release", "Testing, QA & Release Readiness", "Acceptance, integration, contract, migration testing, feature flags and rollback.", ["Interview focus: contract testing, release checklist, rollback plan.", "Production: test scope, release checklist, migration and support notes."], [
        kbLeaf("sa-test-strategy", "Test strategy", "Какие уровни тестов закрывают какие риски."),
        kbLeaf("sa-acceptance-testing", "Acceptance testing", "Проверка требований и acceptance criteria."),
        kbLeaf("sa-contract-testing", "Contract testing", "Проверка совместимости producer/consumer contract."),
        kbLeaf("sa-integration-testing", "Integration testing", "Проверка взаимодействия систем и инфраструктурных зависимостей."),
        kbLeaf("sa-migration-testing", "Migration testing", "Данные, совместимость, rollback and reconciliation."),
        kbLeaf("sa-feature-flags", "Feature flags", "Controlled rollout, gradual enablement and fast disable."),
        kbLeaf("sa-rollback-plan", "Rollback plan", "Как вернуться назад без потери данных и контроля состояния."),
        kbLeaf("sa-release-checklist", "Release checklist", "Readiness gates, owners, monitoring, support and communication.")
      ]),
      kbDomain("sa-ai-workflows", "AI-assisted SA Workflows", "AI для контрактов, диаграмм, тестов и ревью при экспертной проверке.", ["Interview focus: validating AI-generated specifications and privacy.", "Production: validation workflow, prompt templates, approval points."], [
        kbLeaf("sa-ai-contract-draft", "API contract draft", "Черновик OpenAPI/схемы с последующим ручным review."),
        kbLeaf("sa-ai-schema-diff", "Schema comparison", "Поиск несовместимых изменений и contract risk."),
        kbLeaf("sa-ai-diagrams", "Diagram generation", "Черновики sequence/context/state diagrams по описанию сценария."),
        kbLeaf("sa-ai-test-cases", "Test case generation", "Генерация вариантов тестов и edge cases для валидации аналитиком."),
        kbLeaf("sa-ai-incident-summary", "Incident summary analysis", "Сводка инцидента, timeline, impact and follow-up questions.")
      ])
    ]
  }
];
