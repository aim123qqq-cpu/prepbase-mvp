window.PREPBASE_KNOWLEDGE_SOURCES = {
  "mdn-http-methods": {
    title: "MDN HTTP methods",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods"
  },
  "mdn-http-status": {
    title: "MDN HTTP status codes",
    url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status"
  },
  "fowler-rmm": {
    title: "Richardson Maturity Model",
    url: "https://martinfowler.com/articles/richardsonMaturityModel.html"
  },
  "graphql-learn": {
    title: "GraphQL Learn",
    url: "https://graphql.org/learn/"
  },
  openapi: {
    title: "OpenAPI Specification",
    url: "https://learn.openapis.org/specification/"
  },
  "omg-bpmn": {
    title: "OMG BPMN 2.0",
    url: "https://www.omg.org/spec/BPMN/2.0/"
  },
  "omg-uml": {
    title: "OMG UML",
    url: "https://www.omg.org/spec/UML/"
  },
  "postgresql-sql": {
    title: "PostgreSQL SQL documentation",
    url: "https://www.postgresql.org/docs/current/sql.htm"
  },
  "aws-etl": {
    title: "AWS ETL",
    url: "https://aws.amazon.com/what-is/etl/"
  },
  "microsoft-star-schema": {
    title: "Microsoft star schema guidance",
    url: "https://learn.microsoft.com/en-us/power-bi/guidance/star-schema"
  },
  "microsoft-dimensional": {
    title: "Microsoft dimensional modeling",
    url: "https://learn.microsoft.com/en-us/fabric/data-warehouse/dimensional-modeling-overview"
  },
  "iiba-standard": {
    title: "IIBA Business Analysis Standard",
    url: "https://www.iiba.org/globalassets/business-analysis-resources/the-business-analysis-standard/files/the-business-analysis-standard.pdf"
  },
  "agile-dod": {
    title: "Agile Alliance Definition of Done",
    url: "https://www.agilealliance.org/wp-content/uploads/2018/05/definition-of-done.pdf"
  },
  "fowler-microservices": {
    title: "Martin Fowler Microservices",
    url: "https://martinfowler.com/articles/microservices.html"
  },
  "microservices-patterns": {
    title: "Microservices.io patterns",
    url: "https://microservices.io/patterns/"
  },
  "openid-connect": {
    title: "OpenID Connect",
    url: "https://openid.net/developers/how-connect-works/"
  }
};

window.PREPBASE_KNOWLEDGE_TREE = [
  {
    id: "integrations",
    topicId: "integrations-api",
    title: "Интеграции",
    summary: "Связь систем через контракты, события, файлы, общие данные или пользовательские интерфейсы.",
    sources: ["fowler-rmm", "openapi"],
    children: [
      {
        id: "integration-types",
        title: "Виды интеграций",
        summary: "Синхронные, асинхронные, пакетные, файловые, событийные и интеграции через общую БД.",
        children: [
          { id: "sync-integration", title: "Синхронная", summary: "Запрос и ответ в одном пользовательском или системном сценарии." },
          { id: "async-integration", title: "Асинхронная", summary: "Система принимает событие или команду и обрабатывает ее позже." },
          { id: "batch-integration", title: "Пакетная", summary: "Данные передаются пачками по расписанию или по событию готовности." },
          { id: "file-integration", title: "Файловая", summary: "Обмен через CSV, XML, JSON, XLSX или архивы в хранилище." },
          { id: "shared-db-integration", title: "Общая БД", summary: "Быстрый, но рискованный способ связи через одну схему данных." }
        ]
      },
      {
        id: "api",
        title: "API",
        summary: "Контракт, через который одна система предоставляет другой данные или операции.",
        sources: ["openapi"],
        children: [
          { id: "api-contract", title: "Контракт", summary: "Методы, URL, параметры, схемы, ошибки, авторизация, лимиты и SLA." },
          { id: "api-versioning", title: "Версионирование", summary: "Способ менять контракт без поломки существующих клиентов." },
          { id: "api-backward-compatibility", title: "Обратная совместимость", summary: "Новые изменения не ломают старые сценарии и клиентов." },
          { id: "api-openapi", title: "OpenAPI", summary: "Формальное описание HTTP API для документации, генерации клиентов и тестов.", sources: ["openapi"] }
        ]
      },
      {
        id: "rest",
        title: "REST",
        summary: "Стиль проектирования HTTP API вокруг ресурсов, методов, статусов и представлений.",
        sources: ["fowler-rmm", "mdn-http-methods", "mdn-http-status"],
        children: [
          { id: "rest-resources", title: "Ресурсы", summary: "Сущности предметной области, доступные через стабильные URI." },
          { id: "rest-methods", title: "HTTP-методы", summary: "GET, POST, PUT, PATCH, DELETE и их семантика.", sources: ["mdn-http-methods"] },
          { id: "rest-status-codes", title: "HTTP-статусы", summary: "2xx, 3xx, 4xx, 5xx как язык результата запроса.", sources: ["mdn-http-status"] },
          { id: "rest-idempotency", title: "Идемпотентность", summary: "Повторный запрос не должен менять результат сверх первого применения." },
          { id: "rest-pagination", title: "Пагинация", summary: "Разбиение больших списков на страницы, курсоры или окна." },
          { id: "rest-filtering-sorting", title: "Фильтрация и сортировка", summary: "Управление выдачей через query-параметры и согласованные правила." }
        ]
      },
      {
        id: "soap-rpc-graphql",
        title: "SOAP, RPC, GraphQL",
        summary: "Альтернативные стили API с разной моделью контракта и вызова.",
        children: [
          { id: "soap", title: "SOAP", summary: "XML-протокол с формальным контрактом, envelope и строгими сообщениями." },
          { id: "rpc", title: "RPC", summary: "Удаленный вызов процедур: клиент мыслит операциями, а не ресурсами." },
          { id: "graphql", title: "GraphQL", summary: "Клиент запрашивает ровно нужную структуру данных через схему.", sources: ["graphql-learn"] },
          { id: "graphql-schema", title: "Схема GraphQL", summary: "Типы, поля, связи, queries, mutations и subscriptions.", sources: ["graphql-learn"] }
        ]
      },
      {
        id: "integration-reliability",
        title: "Надежность интеграций",
        summary: "Повторяемость, таймауты, очереди, ретраи и обработка частичных отказов.",
        children: [
          { id: "timeouts", title: "Таймауты", summary: "Ограничение ожидания ответа, чтобы не держать цепочку бесконечно." },
          { id: "retries", title: "Повторы", summary: "Повтор запроса при временной ошибке с учетом идемпотентности." },
          { id: "dlq", title: "Dead Letter Queue", summary: "Хранилище сообщений, которые не удалось обработать штатно." },
          { id: "outbox", title: "Outbox", summary: "Паттерн надежной публикации событий из транзакционной системы.", sources: ["microservices-patterns"] },
          { id: "saga", title: "Saga", summary: "Цепочка локальных транзакций с компенсирующими действиями.", sources: ["microservices-patterns"] }
        ]
      }
    ]
  },
  {
    id: "http-web",
    topicId: "integrations-api",
    title: "HTTP и Web",
    summary: "Базовый транспорт большинства современных интеграций.",
    sources: ["mdn-http-methods", "mdn-http-status"],
    children: [
      { id: "http-methods", title: "Методы", summary: "Назначение запроса: чтение, создание, замена, изменение, удаление.", sources: ["mdn-http-methods"] },
      { id: "http-statuses", title: "Статусы", summary: "Классы ответов: информационные, успешные, редиректы, ошибки клиента и сервера.", sources: ["mdn-http-status"] },
      { id: "http-headers", title: "Заголовки", summary: "Метаданные запроса и ответа: формат, авторизация, кеш, язык, трассировка." },
      { id: "http-body", title: "Тело запроса", summary: "Данные операции: JSON, XML, form-data, бинарные файлы." },
      { id: "http-caching", title: "Кеширование", summary: "Повторное использование ответа через Cache-Control, ETag и условные запросы." },
      { id: "http-cors", title: "CORS", summary: "Правила браузера для запросов между разными origin." },
      { id: "http-errors", title: "Ошибки API", summary: "Согласованный формат ошибки, код, человекочитаемое сообщение и детали." }
    ]
  },
  {
    id: "requirements",
    topicId: "requirements-analysis",
    title: "Требования и бизнес-анализ",
    summary: "Переход от проблемы бизнеса к согласованному изменению системы.",
    sources: ["iiba-standard", "agile-dod"],
    children: [
      {
        id: "ba-context",
        title: "Контекст",
        summary: "Цели, пользователи, ограничения, текущий процесс, проблема и ожидаемая ценность.",
        children: [
          { id: "stakeholders", title: "Стейкхолдеры", summary: "Люди и роли, влияющие на требования или затронутые решением." },
          { id: "goals", title: "Цели", summary: "Измеримые результаты, ради которых меняется процесс или система." },
          { id: "scope", title: "Границы", summary: "Что входит в решение, что исключено и какие есть зависимости." }
        ]
      },
      {
        id: "elicitation",
        title: "Выявление требований",
        summary: "Интервью, воркшопы, анализ документов, наблюдение и уточнение гипотез.",
        sources: ["iiba-standard"],
        children: [
          { id: "interviews", title: "Интервью", summary: "Структурированный разговор для выявления целей, проблем и ограничений." },
          { id: "workshops", title: "Воркшопы", summary: "Совместное согласование требований несколькими сторонами." },
          { id: "document-analysis", title: "Анализ документов", summary: "Извлечение правил и ограничений из регламентов, договоров и отчетов." },
          { id: "observation", title: "Наблюдение", summary: "Изучение реального процесса, а не только слов о процессе." }
        ]
      },
      {
        id: "requirement-types",
        title: "Типы требований",
        summary: "Разные уровни описания того, что нужно бизнесу, пользователю и системе.",
        children: [
          { id: "business-requirements", title: "Бизнес-требования", summary: "Цели, ценность и бизнес-результат." },
          { id: "stakeholder-requirements", title: "Пользовательские", summary: "Потребности ролей и участников процесса." },
          { id: "functional-requirements", title: "Функциональные", summary: "Что система должна делать." },
          { id: "nonfunctional-requirements", title: "Нефункциональные", summary: "Качество работы: скорость, доступность, безопасность, удобство." },
          { id: "constraints", title: "Ограничения", summary: "Технологии, сроки, законы, процессы и зависимости." }
        ]
      },
      {
        id: "requirements-artifacts",
        title: "Артефакты",
        summary: "Документы и модели, которые помогают согласовать и проверить решение.",
        children: [
          { id: "user-story", title: "User Story", summary: "Краткое описание потребности роли и ожидаемой ценности." },
          { id: "use-case", title: "Use Case", summary: "Сценарий взаимодействия актора с системой для достижения цели." },
          { id: "acceptance-criteria", title: "Acceptance Criteria", summary: "Проверяемые условия, при которых работа считается принятой." },
          { id: "definition-of-done", title: "Definition of Done", summary: "Общие критерии завершенности инкремента.", sources: ["agile-dod"] },
          { id: "brd-srs", title: "BRD/SRS", summary: "Структурированное описание бизнес- и системных требований." }
        ]
      },
      {
        id: "requirements-quality",
        title: "Качество требований",
        summary: "Требование должно быть понятным, проверяемым, непротиворечивым и трассируемым.",
        children: [
          { id: "traceability", title: "Трассируемость", summary: "Связь цели, требования, реализации, теста и релиза." },
          { id: "prioritization", title: "Приоритизация", summary: "Согласование порядка реализации по ценности, риску и стоимости." },
          { id: "change-management", title: "Управление изменениями", summary: "Фиксация, оценка и согласование изменений требований." }
        ]
      }
    ]
  },
  {
    id: "process-modeling",
    topicId: "requirements-analysis",
    title: "Моделирование процессов и систем",
    summary: "Диаграммы, которые помогают увидеть сценарии, состояния, данные и взаимодействия.",
    sources: ["omg-bpmn", "omg-uml"],
    children: [
      {
        id: "bpmn",
        title: "BPMN",
        summary: "Нотация для бизнес-процессов, ролей, событий, задач и шлюзов.",
        sources: ["omg-bpmn"],
        children: [
          { id: "bpmn-events", title: "События", summary: "Старт, промежуточные события и завершение процесса." },
          { id: "bpmn-activities", title: "Задачи и подпроцессы", summary: "Работы, которые выполняются человеком, системой или процессом." },
          { id: "bpmn-gateways", title: "Шлюзы", summary: "Разветвления, объединения и условия движения процесса." },
          { id: "bpmn-pools-lanes", title: "Пулы и дорожки", summary: "Участники процесса и зоны ответственности." },
          { id: "bpmn-flows", title: "Потоки", summary: "Последовательность действий, сообщения и ассоциации." }
        ]
      },
      {
        id: "uml",
        title: "UML",
        summary: "Набор диаграмм для структуры и поведения системы.",
        sources: ["omg-uml"],
        children: [
          { id: "uml-use-case", title: "Use Case diagram", summary: "Акторы, цели и границы системы." },
          { id: "uml-sequence", title: "Sequence diagram", summary: "Обмен сообщениями между участниками во времени." },
          { id: "uml-activity", title: "Activity diagram", summary: "Поток действий, условий и параллельных веток." },
          { id: "uml-state", title: "State machine", summary: "Состояния объекта и переходы между ними." },
          { id: "uml-class", title: "Class diagram", summary: "Сущности, атрибуты, операции и связи." }
        ]
      },
      {
        id: "data-modeling",
        topicId: "databases",
        title: "Моделирование данных",
        summary: "Сущности, связи, атрибуты, ключи, ограничения и жизненный цикл данных.",
        children: [
          { id: "erd", title: "ERD", summary: "Сущности, отношения, cardinality и ключи." },
          { id: "data-dictionary", title: "Словарь данных", summary: "Единое описание полей, типов, форматов и бизнес-смысла." },
          { id: "state-model", title: "Модель состояний", summary: "Статусы объекта, события перехода и недопустимые состояния." }
        ]
      }
    ]
  },
  {
    id: "sql-data",
    topicId: "sql",
    title: "SQL и реляционные данные",
    summary: "Язык работы с табличными данными, связями и транзакциями.",
    sources: ["postgresql-sql"],
    children: [
      {
        id: "sql-basics",
        title: "База SQL",
        summary: "SELECT, фильтрация, сортировка, группировка и агрегаты.",
        children: [
          { id: "select-from-where", title: "SELECT/FROM/WHERE", summary: "Выбор колонок, источника и условий отбора." },
          { id: "group-by-having", title: "GROUP BY/HAVING", summary: "Группировка и фильтрация агрегированных данных." },
          { id: "order-limit", title: "ORDER BY/LIMIT", summary: "Сортировка и ограничение количества строк." },
          { id: "aggregate-functions", title: "Агрегаты", summary: "COUNT, SUM, AVG, MIN, MAX и расчет показателей." }
        ]
      },
      {
        id: "sql-joins",
        title: "JOIN",
        summary: "Объединение таблиц через ключи и условия связи.",
        children: [
          { id: "inner-join", title: "INNER JOIN", summary: "Только совпавшие строки из обеих таблиц." },
          { id: "left-join", title: "LEFT JOIN", summary: "Все строки слева и найденные совпадения справа." },
          { id: "right-full-join", title: "RIGHT/FULL JOIN", summary: "Сохранение строк правой таблицы или обеих таблиц." },
          { id: "self-cross-join", title: "SELF/CROSS JOIN", summary: "Связь таблицы с собой или декартово произведение." }
        ]
      },
      {
        id: "sql-ddl-dml",
        title: "DDL, DML, DCL, TCL",
        summary: "Группы SQL-операций для схемы, данных, прав и транзакций.",
        children: [
          { id: "ddl", title: "DDL", summary: "CREATE, ALTER, DROP для объектов БД." },
          { id: "dml", title: "DML", summary: "SELECT, INSERT, UPDATE, DELETE для данных." },
          { id: "dcl", title: "DCL", summary: "GRANT и REVOKE для прав доступа." },
          { id: "tcl", title: "TCL", summary: "BEGIN, COMMIT, ROLLBACK и SAVEPOINT для транзакций." }
        ]
      },
      {
        id: "sql-transactions",
        title: "Транзакции",
        summary: "Группа операций, которая должна сохранять целостность данных.",
        children: [
          { id: "acid", title: "ACID", summary: "Атомарность, согласованность, изоляция, долговечность." },
          { id: "isolation-levels", title: "Уровни изоляции", summary: "Компромисс между параллельностью и аномалиями чтения." },
          { id: "locks", title: "Блокировки", summary: "Механизм защиты данных при конкурентном доступе." }
        ]
      },
      {
        id: "sql-performance",
        title: "Производительность",
        summary: "Индексы, план запроса, селективность, статистика и денормализация.",
        children: [
          { id: "indexes", title: "Индексы", summary: "Структуры для ускорения поиска ценой места и записи." },
          { id: "query-plan", title: "План запроса", summary: "Как СУБД собирается получить результат." },
          { id: "n-plus-one", title: "N+1", summary: "Антипаттерн большого числа мелких запросов вместо одного осмысленного." }
        ]
      }
    ]
  },
  {
    id: "databases",
    topicId: "databases",
    title: "Базы данных",
    summary: "Хранение, доступ, целостность, масштабирование и эксплуатация данных.",
    sources: ["postgresql-sql"],
    children: [
      {
        id: "database-types",
        title: "Типы БД",
        summary: "Разные модели хранения под разные запросы, нагрузку и структуру данных.",
        children: [
          { id: "relational-db", title: "Реляционные", summary: "Таблицы, связи, SQL, транзакции и ограничения." },
          { id: "document-db", title: "Документные", summary: "JSON-подобные документы и гибкая структура." },
          { id: "key-value-db", title: "Key-value", summary: "Очень быстрый доступ по ключу к значению." },
          { id: "columnar-db", title: "Колоночные", summary: "Хранение по колонкам для аналитических запросов." },
          { id: "graph-db", title: "Графовые", summary: "Узлы и связи для задач с богатой сетью отношений." }
        ]
      },
      {
        id: "database-design",
        title: "Проектирование",
        summary: "От предметной области к схеме данных и ограничениям.",
        children: [
          { id: "normalization", title: "Нормализация", summary: "Снижение избыточности и аномалий изменения данных." },
          { id: "denormalization", title: "Денормализация", summary: "Осознанное дублирование ради чтения и аналитики." },
          { id: "keys", title: "Ключи", summary: "Primary, foreign, unique и surrogate keys." },
          { id: "constraints", title: "Ограничения", summary: "Правила целостности на уровне базы." }
        ]
      },
      {
        id: "database-scalability",
        title: "Масштабирование",
        summary: "Как БД выдерживает рост данных, запросов и пользователей.",
        children: [
          { id: "replication", title: "Репликация", summary: "Копии данных для чтения, отказоустойчивости или географии." },
          { id: "sharding", title: "Шардирование", summary: "Разделение данных между узлами по ключу." },
          { id: "partitioning", title: "Партиционирование", summary: "Разбиение больших таблиц на управляемые части." },
          { id: "backup-restore", title: "Backup/restore", summary: "Восстановление данных после ошибки, сбоя или удаления." }
        ]
      }
    ]
  },
  {
    id: "dwh-analytics",
    topicId: "databases",
    title: "DWH, ETL и аналитика",
    summary: "Путь данных от операционных систем к витринам, BI и решениям.",
    sources: ["aws-etl", "microsoft-star-schema", "microsoft-dimensional"],
    children: [
      {
        id: "oltp-olap",
        title: "OLTP и OLAP",
        summary: "Операционные системы обслуживают процессы, аналитические - исследование данных.",
        children: [
          { id: "oltp", title: "OLTP", summary: "Много коротких транзакций и актуальное состояние операций." },
          { id: "olap", title: "OLAP", summary: "Агрегации, историчность, срезы и анализ." }
        ]
      },
      {
        id: "etl-elt",
        title: "ETL/ELT",
        summary: "Извлечение, загрузка и преобразование данных для аналитики.",
        sources: ["aws-etl"],
        children: [
          { id: "extract", title: "Extract", summary: "Получение данных из источников." },
          { id: "transform", title: "Transform", summary: "Очистка, сопоставление, нормализация и расчет." },
          { id: "load", title: "Load", summary: "Загрузка в целевое хранилище или витрину." },
          { id: "incremental-load", title: "Инкрементальная загрузка", summary: "Загрузка только изменившихся данных." },
          { id: "data-quality", title: "Качество данных", summary: "Полнота, точность, уникальность, свежесть и согласованность." }
        ]
      },
      {
        id: "dimensional-modeling",
        title: "Dimensional modeling",
        summary: "Модель фактов и измерений для аналитических запросов.",
        sources: ["microsoft-star-schema", "microsoft-dimensional"],
        children: [
          { id: "facts", title: "Факты", summary: "События и числовые показатели для агрегации." },
          { id: "dimensions", title: "Измерения", summary: "Контекст анализа: клиент, продукт, дата, канал." },
          { id: "star-schema", title: "Звезда", summary: "Факт в центре и измерения вокруг него." },
          { id: "snowflake-schema", title: "Снежинка", summary: "Нормализованные измерения с дополнительными связями." },
          { id: "scd", title: "Slowly Changing Dimensions", summary: "Хранение изменений измерений во времени." }
        ]
      },
      {
        id: "bi-metrics",
        title: "BI и метрики",
        summary: "Показатели, отчеты и дашборды, которые помогают принимать решения.",
        children: [
          { id: "metric-tree", title: "Дерево метрик", summary: "Связь цели бизнеса с показателями разных уровней." },
          { id: "dashboard", title: "Дашборд", summary: "Сжатое представление состояния процесса или продукта." },
          { id: "self-service-bi", title: "Self-service BI", summary: "Доступ бизнес-пользователей к данным без постоянной помощи разработки." }
        ]
      }
    ]
  },
  {
    id: "architecture",
    topicId: "architecture",
    title: "Архитектура ПО",
    summary: "Структура системы, границы ответственности и технические компромиссы.",
    sources: ["fowler-microservices", "microservices-patterns"],
    children: [
      {
        id: "architecture-styles",
        title: "Стили",
        summary: "Способы организовать приложение и взаимодействие компонентов.",
        children: [
          { id: "client-server", title: "Клиент-сервер", summary: "Клиент отвечает за интерфейс, сервер - за логику и данные." },
          { id: "monolith", title: "Монолит", summary: "Единое приложение с общим релизным циклом." },
          { id: "soa", title: "SOA", summary: "Сервисы предприятия с контрактами и интеграционной логикой." },
          { id: "microservices", title: "Микросервисы", summary: "Набор независимо развертываемых сервисов вокруг бизнес-возможностей.", sources: ["fowler-microservices"] }
        ]
      },
      {
        id: "service-boundaries",
        title: "Границы сервисов",
        summary: "Где проходит ответственность, данные, API и команда.",
        children: [
          { id: "bounded-context", title: "Bounded Context", summary: "Граница смысла модели и языка предметной области." },
          { id: "database-per-service", title: "Database per service", summary: "Данные сервиса скрыты и доступны через его API.", sources: ["microservices-patterns"] },
          { id: "api-gateway", title: "API Gateway", summary: "Единая точка входа для клиентов и маршрутизации запросов.", sources: ["microservices-patterns"] }
        ]
      },
      {
        id: "nfr",
        title: "Нефункциональные требования",
        summary: "Качества системы, которые часто определяют архитектурные решения.",
        children: [
          { id: "performance", title: "Производительность", summary: "Время ответа, пропускная способность, latency." },
          { id: "availability", title: "Доступность", summary: "Доля времени, когда сервис способен выполнять функции." },
          { id: "scalability", title: "Масштабируемость", summary: "Способность выдерживать рост нагрузки." },
          { id: "maintainability", title: "Сопровождаемость", summary: "Насколько легко менять и диагностировать систему." },
          { id: "security", title: "Безопасность", summary: "Защита данных, операций и доступа." }
        ]
      },
      {
        id: "observability",
        title: "Наблюдаемость",
        summary: "Понимание поведения системы через метрики, логи и трассировку.",
        children: [
          { id: "logs", title: "Логи", summary: "События и детали выполнения." },
          { id: "metrics", title: "Метрики", summary: "Численные показатели здоровья и нагрузки." },
          { id: "traces", title: "Трейсы", summary: "Прохождение запроса через несколько компонентов." },
          { id: "alerts", title: "Алерты", summary: "Сигналы о нарушении порогов или ожиданий." }
        ]
      }
    ]
  },
  {
    id: "security",
    topicId: "integrations-api",
    title: "Безопасность интеграций",
    summary: "Кто обращается к системе, что ему разрешено и как защищены данные.",
    sources: ["openid-connect"],
    children: [
      { id: "authentication", title: "Аутентификация", summary: "Проверка личности пользователя или системы." },
      { id: "authorization", title: "Авторизация", summary: "Проверка прав на действие или ресурс." },
      { id: "oauth2", title: "OAuth 2.0", summary: "Фреймворк делегированной авторизации через токены.", sources: ["openid-connect"] },
      { id: "openid-connect-node", title: "OpenID Connect", summary: "Слой аутентификации поверх OAuth 2.0.", sources: ["openid-connect"] },
      { id: "jwt", title: "JWT", summary: "Компактный формат токена с claims и подписью." },
      { id: "api-keys", title: "API keys", summary: "Простая идентификация клиента, чаще для server-to-server сценариев." },
      { id: "secrets", title: "Secrets", summary: "Ключи и токены должны храниться отдельно от кода." },
      { id: "rate-limits", title: "Rate limits", summary: "Ограничение частоты запросов для защиты сервиса." }
    ]
  },
  {
    id: "testing",
    topicId: "requirements-analysis",
    title: "Тестирование и приемка",
    summary: "Проверка, что система реализует требования и не ломает важные сценарии.",
    children: [
      { id: "unit-tests", title: "Unit tests", summary: "Проверка маленьких изолированных частей логики." },
      { id: "integration-tests", title: "Integration tests", summary: "Проверка взаимодействия компонентов или внешних систем." },
      { id: "e2e-tests", title: "E2E tests", summary: "Проверка пользовательского сценария целиком." },
      { id: "api-tests", title: "API tests", summary: "Проверка контрактов, статусов, схем, ошибок и прав." },
      { id: "contract-tests", title: "Contract tests", summary: "Проверка совместимости поставщика и потребителя API." },
      { id: "uat", title: "UAT", summary: "Приемка решения бизнес-пользователями." },
      { id: "regression", title: "Regression", summary: "Проверка, что новые изменения не сломали старое поведение." }
    ]
  }
];
