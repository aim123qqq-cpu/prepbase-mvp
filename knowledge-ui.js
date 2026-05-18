(() => {
  const ORDER_KEY = "prepbase-knowledge-order-v1";
  const tree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
  const sources = window.PREPBASE_KNOWLEDGE_SOURCES || {};
  const collapsed = new Set();
  let rootOrder = loadRootOrder();
  let textHidden = false;

  const elements = {
    map: document.querySelector("#knowledgeMap"),
    count: document.querySelector("#knowledgePanelCount"),
    title: document.querySelector("#knowledgePanelTitle"),
    search: document.querySelector("#knowledgeSearch"),
    expandAll: document.querySelector("#knowledgeExpandAll"),
    toggleText: document.querySelector("#knowledgeToggleText"),
    nav: document.querySelector(".app-nav")
  };

  const detailNotes = {
    integrations: [
      "Смысл блока: понять, как системы обмениваются данными, где проходит контракт и что будет при ошибке на одной из сторон.",
      "Различай синхронные запросы, асинхронные события, пакетные выгрузки и интеграции через общие данные.",
      "Связка для ответа: тип интеграции -> контракт -> надежность -> безопасность -> мониторинг."
    ],
    "http-web": [
      "HTTP — базовый язык большинства API: метод описывает намерение, URL указывает ресурс, статус сообщает результат.",
      "Не смешивай транспортный успех с бизнес-ошибкой: 200 с ошибкой внутри тела часто усложняет клиентов.",
      "Отдельно проговаривай заголовки, кэширование, CORS, формат ошибок и идемпотентность повторных запросов."
    ],
    requirements: [
      "Блок отвечает на вопрос: какую проблему решаем, для кого, в каких границах и как поймем, что решение принято.",
      "Хорошее требование связывает бизнес-цель, пользователя, сценарий, правило, ограничение и критерий приемки.",
      "Риск аналитика — сразу писать решение, не разобрав контекст, стейкхолдеров, исключения и измеримую ценность."
    ],
    "process-modeling": [
      "Модели выносят процесс из головы участников в общую нотацию: шаги, роли, события, решения и данные.",
      "BPMN показывает поток работ, UML описывает структуру и взаимодействие, ERD фиксирует данные и связи.",
      "Ценность модели не в красоте схемы, а в вопросах, которые она помогает согласовать."
    ],
    "sql-data": [
      "SQL важен как язык проверки гипотез: получить срез, найти дубликаты, агрегировать, связать таблицы и объяснить результат.",
      "На собеседовании смотрят не только синтаксис, а понимание join, группировок, оконных функций и порядка выполнения.",
      "Умей объяснять, почему запрос медленный: фильтры, индексы, кардинальность, план выполнения."
    ],
    databases: [
      "База данных — это модель предметной области, правила целостности, транзакции и компромиссы чтения/записи.",
      "При выборе решения проговаривай нагрузку, консистентность, объем данных, задержки и восстановление после сбоя.",
      "Держи в голове нормализацию, индексы, транзакции, репликацию, шардинг и резервное копирование."
    ],
    "dwh-analytics": [
      "DWH и ETL описывают путь данных от операционных систем к витринам, метрикам, BI и управленческим решениям.",
      "Ключевые вопросы: источник истины, частота обновления, качество данных, история изменений и владелец показателя.",
      "Хорошее объяснение связывает факты, измерения, слой трансформаций, витрины и потребителей данных."
    ],
    architecture: [
      "Архитектура фиксирует границы ответственности: компоненты, данные, контракты, зависимости, риски и нефункциональные требования.",
      "Важно объяснять не только стиль, но и компромиссы: скорость разработки, сопровождение, масштабирование, отказоустойчивость.",
      "Для аналитика архитектура полезна как карта влияния требований на системы, команды и интеграции."
    ],
    security: [
      "Безопасность интеграций начинается с идентификации: кто вызывает API, от имени кого действует и какие операции разрешены.",
      "Разделяй authentication, authorization, secrets, token lifetime, rate limits и аудит действий.",
      "Уточняй чувствительные данные, хранение токенов и сценарий отзыва доступа."
    ],
    testing: [
      "Тестирование и приемка проверяют требования, контракты, сценарии и ожидания бизнеса, а не только код.",
      "Различай unit, integration, contract, API, E2E, regression и UAT: каждый слой ловит свой тип риска.",
      "Критерии приемки должны быть проверяемыми: входные условия, действие, ожидаемый результат и исключения."
    ],
    api: [
      "API — публичный договор между системами: он должен быть понятным, стабильным и проверяемым.",
      "В контракте фиксируются методы, параметры, схемы данных, коды ошибок, авторизация, лимиты, версии и совместимость."
    ],
    rest: [
      "REST полезен, когда предметную область удобно выразить ресурсами и стандартными HTTP-операциями.",
      "Сильная REST-модель делает URL предсказуемыми, методы семантичными, а ошибки понятными для клиента."
    ],
    "requirement-types": [
      "Типы требований помогают не смешивать цель бизнеса, потребность пользователя, поведение системы и качество работы.",
      "Если требование невозможно проверить, его стоит уточнить до критериев приемки или измеримого ограничения."
    ],
    "database-design": [
      "Проектирование данных начинается с сущностей, связей, ключей, ограничений и жизненного цикла записей.",
      "Нормализация снижает дублирование, денормализация ускоряет чтение, но требует контроля согласованности."
    ]
  };

  if (!elements.map) return;

  render();

  elements.search?.addEventListener("input", render);
  elements.expandAll?.addEventListener("click", () => {
    collapsed.clear();
    render();
  });
  elements.toggleText?.addEventListener("click", () => {
    textHidden = !textHidden;
    render();
  });
  elements.nav?.addEventListener("click", () => window.setTimeout(render, 0));
  elements.map.addEventListener("click", handleMapClick, true);

  function handleMapClick(event) {
    const toggleId = event.target.dataset.knowledgeToggle;
    const movePayload = event.target.dataset.knowledgeMove;
    if (!toggleId && !movePayload) return;

    event.preventDefault();
    event.stopPropagation();

    if (toggleId) {
      collapsed.has(toggleId) ? collapsed.delete(toggleId) : collapsed.add(toggleId);
      render();
      return;
    }

    const [nodeId, direction] = movePayload.split(":");
    moveRoot(nodeId, direction);
  }

  function render() {
    const nodes = getVisibleTree();
    const count = countNodes(nodes);

    if (elements.title) elements.title.textContent = "База знаний";
    if (elements.count) elements.count.textContent = `${count} ${plural(count, "узел", "узла", "узлов")}`;
    if (elements.toggleText) elements.toggleText.textContent = textHidden ? "Показать текст" : "Скрыть текст";

    if (!nodes.length) {
      elements.map.innerHTML = `<div class="empty-state">По этому запросу ничего не найдено.</div>`;
      return;
    }

    elements.map.innerHTML = `
      <div class="knowledge-tree">
        ${nodes.map((node, index) => renderBranch(node, 0, index, nodes.length)).join("")}
      </div>
    `;
  }

  function getVisibleTree() {
    const ordered = getOrderedTree();
    const search = (elements.search?.value || "").trim().toLowerCase();
    return search ? filterTree(ordered, search) : ordered;
  }

  function getOrderedTree() {
    const order = rootOrder.length ? rootOrder : tree.map((node) => node.id);
    const knownIds = new Set(tree.map((node) => node.id));
    rootOrder = [...order.filter((id) => knownIds.has(id)), ...tree.map((node) => node.id).filter((id) => !order.includes(id))];
    const indexById = new Map(rootOrder.map((id, index) => [id, index]));
    return [...tree].sort((a, b) => (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0));
  }

  function filterTree(nodes, search) {
    return nodes.reduce((result, node) => {
      const children = filterTree(node.children || [], search);
      if (matches(node, search)) result.push({ ...node, children: node.children || [] });
      else if (children.length) result.push({ ...node, children });
      return result;
    }, []);
  }

  function matches(node, search) {
    return [node.title, node.summary, ...(node.details || []), ...(node.children || []).map((child) => child.title)]
      .join(" ")
      .toLowerCase()
      .includes(search);
  }

  function renderBranch(node, depth, rootIndex = 0, rootCount = 1) {
    const children = node.children || [];
    const details = getDetails(node, depth);
    const sourceLinks = renderSources(node.sources);
    const isCollapsed = collapsed.has(node.id);
    const hasBody = Boolean(node.summary || details.length || sourceLinks || children.length);
    const moveControls = depth === 0
      ? `
        <div class="knowledge-move-controls" aria-label="Переместить раздел">
          <button class="small-button" data-knowledge-move="${node.id}:up" type="button" ${rootIndex === 0 ? "disabled" : ""}>Выше</button>
          <button class="small-button" data-knowledge-move="${node.id}:down" type="button" ${rootIndex === rootCount - 1 ? "disabled" : ""}>Ниже</button>
        </div>
      `
      : "";

    return `
      <article class="knowledge-branch ${depth === 0 ? "root" : "child"} ${isCollapsed ? "collapsed" : ""}" style="--depth: ${Math.min(depth, 5)}">
        <div class="knowledge-branch-body">
          <button class="knowledge-toggle" data-knowledge-toggle="${node.id}" type="button" aria-expanded="${!isCollapsed}" ${hasBody ? "" : "disabled"}>${isCollapsed ? "+" : "-"}</button>
          <div class="knowledge-branch-copy">
            <p class="knowledge-node-title">${escapeHtml(node.title)}</p>
            ${!textHidden && node.summary ? `<p class="knowledge-node-goal">${escapeHtml(node.summary)}</p>` : ""}
          </div>
          ${moveControls}
        </div>
        ${!isCollapsed && !textHidden && details.length ? `<ul class="knowledge-details">${details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${!isCollapsed && !textHidden && sourceLinks ? `<div class="knowledge-source-row">${sourceLinks}</div>` : ""}
        ${!isCollapsed && children.length ? `<div class="knowledge-children">${children.map((child) => renderBranch(child, depth + 1)).join("")}</div>` : ""}
      </article>
    `;
  }

  function getDetails(node, depth) {
    if (detailNotes[node.id]) return detailNotes[node.id];
    if (Array.isArray(node.details) && node.details.length) return node.details;
    if (depth === 0) {
      return [
        "Это укрупненный блок: внутри собраны основные понятия, типовые решения и контекст для уверенного объяснения темы.",
        "Изучать лучше сверху вниз: смысл и границы, затем виды, затем практические детали и частые ошибки.",
        "Проверка понимания: получится ли объяснить применение, альтернативы и риски."
      ];
    }
    if (depth === 1) {
      return [
        "Раздел раскрывает одну грань темы и помогает отделить похожие понятия друг от друга.",
        "Для подготовки полезно держать рядом пример из проекта: входные данные, результат, ограничения и критерии приемки."
      ];
    }
    return ["Короткое определение нужно дополнить примером, ограничениями и связью с соседними понятиями."];
  }

  function renderSources(sourceIds = []) {
    return sourceIds
      .map((sourceId) => sources[sourceId])
      .filter(Boolean)
      .map((source) => `<a class="knowledge-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`)
      .join("");
  }

  function moveRoot(nodeId, direction) {
    const roots = getOrderedTree();
    const index = roots.findIndex((node) => node.id === nodeId);
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || nextIndex < 0 || nextIndex >= roots.length) return;

    const ids = roots.map((node) => node.id);
    [ids[index], ids[nextIndex]] = [ids[nextIndex], ids[index]];
    rootOrder = ids;
    saveRootOrder();
    render();
  }

  function countNodes(nodes) {
    return nodes.reduce((count, node) => count + 1 + countNodes(node.children || []), 0);
  }

  function loadRootOrder() {
    try {
      const saved = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
      return Array.isArray(saved) ? saved.map(String) : [];
    } catch {
      return [];
    }
  }

  function saveRootOrder() {
    localStorage.setItem(ORDER_KEY, JSON.stringify(rootOrder));
  }

  function plural(count, one, few, many) {
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
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
