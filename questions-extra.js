(() => {
  const STORAGE_KEY = "prepbase-mvp-v2";
  const MIGRATION_KEY = "prepbase-analyst-kb-questions-v1";
  const sourceUrl = "https://analyst-kb.netlify.app/general/interview-questions-and-answers/";

  const questions = [
    {
      id: "analyst-kb-q-001",
      topicId: "requirements-analysis",
      text: "Что делать системному аналитику после получения новой задачи?",
      answer:
        "Уточнить цель и границы задачи, собрать контекст у заказчика и пользователей, описать текущий процесс, выявить ограничения, подготовить требования и согласовать их с командой до реализации.",
      status: "Учу",
      tags: ["аналитик", "требования", "интервью", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-002",
      topicId: "requirements-analysis",
      text: "Что такое артефакты системного анализа?",
      answer:
        "Это рабочие материалы, которые фиксируют понимание системы: требования, модели процессов, диаграммы, спецификации, прототипы, схемы данных, API-контракты и решения по спорным вопросам.",
      status: "Учу",
      tags: ["артефакты", "документация", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-003",
      topicId: "requirements-analysis",
      text: "Какие методы сбора информации использует аналитик?",
      answer:
        "Интервью, анкетирование, воркшопы, наблюдение, анализ документов, фокус-группы, изучение текущих систем, вторичный анализ данных и уточняющие сессии с экспертами предметной области.",
      status: "Учу",
      tags: ["elicitation", "интервью", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-004",
      topicId: "requirements-analysis",
      text: "Какие виды требований нужно различать?",
      answer:
        "Бизнес-требования, пользовательские, функциональные, нефункциональные, интеграционные, требования к данным, интерфейсу, безопасности, производительности, обучению и сопровождению.",
      status: "Учу",
      tags: ["требования", "классификация", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-005",
      topicId: "requirements-analysis",
      text: "Что входит в функциональные требования?",
      answer:
        "Они описывают поведение системы: сценарии, операции пользователей, бизнес-правила, обработку данных, валидации, исключения, взаимодействие с внешними системами и ожидаемые результаты.",
      status: "Учу",
      tags: ["функциональные требования", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-006",
      topicId: "requirements-analysis",
      text: "Что входит в нефункциональные требования?",
      answer:
        "Качества системы: производительность, надежность, безопасность, масштабируемость, доступность, удобство использования, сопровождаемость, аудит, восстановление и ограничения эксплуатации.",
      status: "Учу",
      tags: ["nfr", "нефункциональные требования", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-007",
      topicId: "integrations-api",
      text: "Чем SOAP отличается от REST?",
      answer:
        "SOAP является протоколом с формальным XML-контрактом и строгими стандартами, а REST — архитектурный стиль поверх HTTP, где работа строится вокруг ресурсов, методов и представлений данных.",
      status: "Учу",
      tags: ["soap", "rest", "api", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-008",
      topicId: "integrations-api",
      text: "Чем REST отличается от RESTful и REST API?",
      answer:
        "REST задает принципы архитектуры, RESTful означает реализацию, которая им следует, а REST API — конкретный интерфейс с endpoint, методами, параметрами, форматами данных и ошибками.",
      status: "Учу",
      tags: ["rest", "restful", "api", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-009",
      topicId: "integrations-api",
      text: "Какие HTTP-методы чаще всего используются в REST?",
      answer:
        "GET читает ресурс, POST создает или запускает обработку, PUT полностью заменяет ресурс, PATCH частично обновляет, DELETE удаляет, HEAD запрашивает только заголовки.",
      status: "Учу",
      tags: ["http", "rest", "methods", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-010",
      topicId: "integrations-api",
      text: "Чем GET отличается от POST?",
      answer:
        "GET предназначен для чтения и передает параметры в URL, может кэшироваться и должен быть безопасным. POST отправляет данные в теле запроса и обычно меняет состояние или запускает обработку.",
      status: "Учу",
      tags: ["http", "get", "post", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-011",
      topicId: "integrations-api",
      text: "Что такое идемпотентность?",
      answer:
        "Это свойство операции, при котором повторный вызов приводит к тому же конечному состоянию. В HTTP идемпотентность важна для безопасных повторов при сетевых сбоях.",
      status: "Учу",
      tags: ["http", "идемпотентность", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-012",
      topicId: "integrations-api",
      text: "Что содержит URL в REST-запросе?",
      answer:
        "URL указывает ресурс и может включать путь, идентификаторы, query-параметры для фильтрации, сортировки или пагинации. Действие при этом задается HTTP-методом.",
      status: "Учу",
      tags: ["url", "rest", "api", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-013",
      topicId: "integrations-api",
      text: "Как спроектировать простой REST API для сущности?",
      answer:
        "Выделить ресурс, например `/books`, задать операции `GET /books`, `GET /books/{id}`, `POST /books`, `PUT/PATCH /books/{id}`, `DELETE /books/{id}`, описать схемы, статусы и ошибки.",
      status: "Учу",
      tags: ["rest", "api design", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-014",
      topicId: "integrations-api",
      text: "Что такое JSON?",
      answer:
        "JSON — текстовый формат обмена данными из пар ключ-значение, массивов, строк, чисел, boolean и null. Он часто используется в API благодаря простоте чтения и передачи.",
      status: "Учу",
      tags: ["json", "api", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-015",
      topicId: "integrations-api",
      text: "Что такое webhook и зачем он нужен?",
      answer:
        "Webhook позволяет системе отправлять HTTP-уведомление на заданный endpoint при событии. Это удобно для интеграций без постоянного опроса внешнего сервиса.",
      status: "Учу",
      tags: ["webhook", "интеграции", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-016",
      topicId: "integrations-api",
      text: "Что такое HTTP и из чего состоит обмен запрос-ответ?",
      answer:
        "HTTP — протокол клиент-серверного обмена. Запрос содержит метод, URL, заголовки и иногда тело; ответ содержит статус, заголовки и тело с данными или ошибкой.",
      status: "Учу",
      tags: ["http", "protocol", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-017",
      topicId: "integrations-api",
      text: "Как работает HTTPS на уровне идеи?",
      answer:
        "HTTPS добавляет к HTTP защищенный TLS-канал: клиент проверяет сертификат сервера, стороны договариваются о шифровании, после чего данные передаются в защищенном виде.",
      status: "Учу",
      tags: ["https", "tls", "security", "analyst-kb"],
      sourceUrl
    },
    {
      id: "analyst-kb-q-018",
      topicId: "integrations-api",
      text: "Что такое Swagger и чем он связан с OpenAPI?",
      answer:
        "OpenAPI — спецификация описания HTTP API, а Swagger — экосистема инструментов вокруг нее: редактор, UI-документация, генерация клиентов и проверка контракта.",
      status: "Учу",
      tags: ["openapi", "swagger", "api", "analyst-kb"],
      sourceUrl
    }
  ];

  appendToSeed();
  migrateSavedState();

  function appendToSeed() {
    const seed = window.PREPBASE_SEED;
    if (!seed || !Array.isArray(seed.questions)) return;
    appendMissing(seed.questions);
  }

  function migrateSavedState() {
    try {
      if (localStorage.getItem(MIGRATION_KEY)) return;

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(MIGRATION_KEY, "done");
        return;
      }

      const state = JSON.parse(raw);
      if (!state || !Array.isArray(state.questions)) return;

      const changed = appendMissing(state.questions);
      if (changed) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      localStorage.setItem(MIGRATION_KEY, "done");
    } catch {
      localStorage.removeItem(MIGRATION_KEY);
    }
  }

  function appendMissing(target) {
    const existingIds = new Set(target.map((question) => question.id));
    const nextQuestions = questions.filter((question) => !existingIds.has(question.id));
    target.push(...nextQuestions);
    return nextQuestions.length > 0;
  }
})();
