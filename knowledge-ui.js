(() => {
  const ORDER_KEY = "prepbase-knowledge-order-v1";
  const tree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
  const sources = window.PREPBASE_KNOWLEDGE_SOURCES || {};
  const collapsed = getDefaultCollapsedIds(tree);
  let rootOrder = loadRootOrder();
  let textHidden = false;

  const elements = {
    map: document.querySelector("#knowledgeMap"),
    title: document.querySelector("#knowledgePanelTitle"),
    search: document.querySelector("#knowledgeSearch"),
    level: document.querySelector("#knowledgeLevelFilter"),
    sort: document.querySelector("#knowledgeSort"),
    sidebarList: document.querySelector("#knowledgeSidebarList"),
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
  elements.level?.addEventListener("change", render);
  elements.sort?.addEventListener("change", render);
  elements.nav?.addEventListener("click", () => window.setTimeout(render, 0));
  document.addEventListener("click", handleViewOpen);
  elements.map.addEventListener("click", handleMapClick, true);
  elements.sidebarList?.addEventListener("click", handleSidebarClick);

  function handleViewOpen(event) {
    const trigger = event.target.closest("[data-open-view]");
    if (!trigger) return;

    const view = trigger.dataset.openView;
    if (!view) return;

    event.preventDefault();
    document.querySelectorAll("[data-view]").forEach((section) => {
      section.classList.toggle("active", section.dataset.view === view);
    });
    document.querySelectorAll("[data-view-target]").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.viewTarget === view);
    });
    window.setTimeout(render, 0);
  }

  function handleMapClick(event) {
    const control = event.target.closest("[data-knowledge-toggle], [data-knowledge-move]");
    if (!control) return;

    const toggleId = control.dataset.knowledgeToggle;
    const movePayload = control.dataset.knowledgeMove;
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

  function handleSidebarClick(event) {
    const control = event.target.closest("[data-knowledge-focus]");
    if (!control) return;

    event.preventDefault();
    focusNode(control.dataset.knowledgeFocus);
  }

  function render() {
    const nodes = getVisibleTree();
    if (elements.title) elements.title.textContent = "База знаний";
    renderSidebar();

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

  function renderSidebar() {
    if (!elements.sidebarList) return;

    const controls = getControlState();
    const allNodes = flattenTree(sortTree(withDepth(getOrderedTree())));
    const visibleItems = controls.isFiltered
      ? allNodes.filter((node) => matchesControls(node, controls))
      : allNodes.filter((node) => node.__depth === 0);

    if (!visibleItems.length) {
      elements.sidebarList.innerHTML = `<div class="knowledge-sidebar-empty">Ничего не найдено</div>`;
      return;
    }

    elements.sidebarList.innerHTML = visibleItems
      .map((node) => {
        const level = node.__depth + 1;
        return `
          <button class="knowledge-sidebar-item" data-knowledge-focus="${escapeHtml(node.id)}" type="button">
            <span class="knowledge-sidebar-level">${level}</span>
            <span>${escapeHtml(node.title)}</span>
          </button>
        `;
      })
      .join("");
  }

  function getVisibleTree() {
    const ordered = sortTree(withDepth(getOrderedTree()));
    const controls = getControlState();
    return controls.isFiltered ? filterTree(ordered, controls) : ordered;
  }

  function getOrderedTree() {
    const order = rootOrder.length ? rootOrder : tree.map((node) => node.id);
    const knownIds = new Set(tree.map((node) => node.id));
    rootOrder = [...order.filter((id) => knownIds.has(id)), ...tree.map((node) => node.id).filter((id) => !order.includes(id))];
    const indexById = new Map(rootOrder.map((id, index) => [id, index]));
    return [...tree].sort((a, b) => (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0));
  }

  function getControlState() {
    const search = (elements.search?.value || "").trim().toLowerCase();
    const level = elements.level?.value || "all";
    const sort = elements.sort?.value || "structure";
    return {
      search,
      level,
      sort,
      isFiltered: Boolean(search || level !== "all")
    };
  }

  function withDepth(nodes, depth = 0, parentId = null) {
    return nodes.map((node) => ({
      ...node,
      __depth: depth,
      __parentId: parentId,
      children: withDepth(node.children || [], depth + 1, node.id)
    }));
  }

  function sortTree(nodes) {
    const sort = elements.sort?.value || "structure";
    const sorted = sort === "structure"
      ? [...nodes]
      : [...nodes].sort((a, b) => {
          const result = String(a.title).localeCompare(String(b.title), "ru");
          return sort === "az" ? result : -result;
        });

    return sorted.map((node) => ({
      ...node,
      children: sortTree(node.children || [])
    }));
  }

  function flattenTree(nodes) {
    return nodes.flatMap((node) => [node, ...flattenTree(node.children || [])]);
  }

  function getNodeSearchText(node) {
    return [node.title, node.summary, ...(node.details || [])]
      .join(" ")
      .toLowerCase();
  }

  function focusNode(nodeId) {
    if (!nodeId) return;

    getAncestorIds(nodeId).forEach((id) => collapsed.delete(id));
    collapsed.delete(nodeId);
    render();

    window.requestAnimationFrame(() => {
      const target = elements.map.querySelector(`[data-knowledge-node="${cssEscape(nodeId)}"]`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
      target?.classList.add("knowledge-branch-highlight");
      window.setTimeout(() => target?.classList.remove("knowledge-branch-highlight"), 900);
    });
  }

  function getAncestorIds(nodeId) {
    const parentById = new Map();
    flattenTree(withDepth(getOrderedTree())).forEach((node) => {
      if (node.__parentId) parentById.set(node.id, node.__parentId);
    });

    const ids = [];
    let current = parentById.get(nodeId);
    while (current) {
      ids.push(current);
      current = parentById.get(current);
    }
    return ids;
  }

  function filterTree(nodes, controls) {
    return nodes.reduce((result, node) => {
      const children = filterTree(node.children || [], controls);
      if (matchesControls(node, controls)) result.push({ ...node, children });
      else if (children.length) result.push({ ...node, children });
      return result;
    }, []);
  }

  function matchesControls(node, controls) {
    const depthMatch =
      controls.level === "all" ||
      (controls.level === "root" && node.__depth === 0) ||
      (controls.level === "second" && node.__depth === 1) ||
      (controls.level === "deep" && node.__depth >= 2);
    return depthMatch && (!controls.search || matchesSearch(node, controls.search));
  }

  function matchesSearch(node, search) {
    return getNodeSearchText(node).includes(search);
  }

  function renderBranch(node, depth, rootIndex = 0, rootCount = 1) {
    const children = node.children || [];
    const details = getDetails(node, depth);
    const sourceLinks = renderSources(node.sources);
    const controls = getControlState();
    const isCollapsed = !controls.isFiltered && collapsed.has(node.id);
    const hasBody = Boolean(node.summary || details.length || sourceLinks || children.length);
    const icon = renderTopicIcon(node);
    const moveControls = depth === 0
      ? `
        <div class="knowledge-move-controls" aria-label="Переместить раздел">
          <button class="small-button" data-knowledge-move="${node.id}:up" type="button" ${rootIndex === 0 ? "disabled" : ""}>Выше</button>
          <button class="small-button" data-knowledge-move="${node.id}:down" type="button" ${rootIndex === rootCount - 1 ? "disabled" : ""}>Ниже</button>
        </div>
      `
      : "";

    return `
      <article class="knowledge-branch ${depth === 0 ? "root" : "child"} ${isCollapsed ? "collapsed" : ""}" data-knowledge-node="${escapeHtml(node.id)}" style="--depth: ${Math.min(depth, 5)}">
        <div class="knowledge-branch-body">
          <button class="knowledge-toggle" data-knowledge-toggle="${node.id}" type="button" aria-label="${isCollapsed ? "Раскрыть" : "Свернуть"} ${escapeHtml(node.title)}" aria-expanded="${!isCollapsed}" ${hasBody ? "" : "disabled"}>
            <span class="knowledge-toggle-mark" aria-hidden="true">${isCollapsed ? "+" : "-"}</span>
          </button>
          ${icon}
          <div class="knowledge-branch-copy">
            <p class="knowledge-node-title">${escapeHtml(node.title)}</p>
            ${!isCollapsed && !textHidden && node.summary ? `<p class="knowledge-node-goal">${escapeHtml(node.summary)}</p>` : ""}
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

  function getDefaultCollapsedIds(nodes, depth = 0) {
    return nodes.reduce((ids, node) => {
      const children = node.children || [];
      const hasBody = Boolean(node.summary || (node.details || []).length || (node.sources || []).length || children.length);

      if (hasBody) {
        ids.add(node.id);
      }

      getDefaultCollapsedIds(children, depth + 1).forEach((id) => ids.add(id));
      return ids;
    }, new Set());
  }

  function renderTopicIcon(node) {
    const kind = getIconKind(node);
    const shapes = {
      api: `<path d="M8 12h8M6 8h4l2 4 2-4h4M6 16h4l2-4 2 4h4" />`,
      requirements: `<path d="M8 5h8l3 3v11H8z" /><path d="M16 5v4h4M10 12h7M10 16h6" />`,
      process: `<path d="M5 7h6v5H5zM14 12h5v5h-5zM11 9h3M9 12v2h5" />`,
      data: `<path d="M6 7c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2z" /><path d="M6 7v10c0 1.1 2.7 2 6 2s6-.9 6-2V7M6 12c0 1.1 2.7 2 6 2s6-.9 6-2" />`,
      architecture: `<path d="M5 7h5v5H5zM14 7h5v5h-5zM9 16h6M12 12v4M7.5 12v3M16.5 12v3" />`,
      security: `<path d="M12 4l7 3v5c0 4-2.8 6.8-7 8-4.2-1.2-7-4-7-8V7z" /><path d="M9.5 12.5l1.7 1.7 3.7-4" />`,
      testing: `<path d="M7 5h10v14H7z" /><path d="M9 10l2 2 4-4M9 16h6" />`,
      default: `<path d="M12 5v14M5 12h14" /><circle cx="12" cy="12" r="7" />`
    };

    return `
      <span class="knowledge-topic-icon knowledge-topic-icon-${kind}" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          ${shapes[kind] || shapes.default}
        </svg>
      </span>
    `;
  }

  function getIconKind(node) {
    const value = `${node.id || ""} ${node.title || ""}`.toLowerCase();
    if (/(api|rest|http|интеграц|grpc|soap|webhook|kafka)/.test(value)) return "api";
    if (/(requirement|требован|user-story|stakeholder)/.test(value)) return "requirements";
    if (/(process|bpmn|uml|модел|процесс|sequence|activity)/.test(value)) return "process";
    if (/(sql|data|database|dwh|etl|erd|данн|база|метрик)/.test(value)) return "data";
    if (/(architect|c4|контур|систем|архитект)/.test(value)) return "architecture";
    if (/(security|auth|token|oauth|безопас|доступ)/.test(value)) return "security";
    if (/(test|uat|qa|прием|приём|тест)/.test(value)) return "testing";
    return "default";
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

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(value) : String(value).replaceAll('"', '\\"');
  }
})();
