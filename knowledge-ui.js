(() => {
  const ORDER_KEY = "prepbase-knowledge-order-v2";
  const tree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
  const sources = window.PREPBASE_KNOWLEDGE_SOURCES || {};
  const collapsed = getDefaultCollapsedIds(tree);
  let rootOrder = loadRootOrder();

  const elements = {
    map: document.querySelector("#knowledgeMap"),
    title: document.querySelector("#knowledgePanelTitle"),
    search: document.querySelector("#knowledgeSearch"),
    level: document.querySelector("#knowledgeLevelFilter"),
    sort: document.querySelector("#knowledgeSort"),
    sidebarList: document.querySelector("#knowledgeSidebarList"),
    nav: document.querySelector(".app-nav")
  };

  if (!elements.map) return;

  render();
  elements.search?.addEventListener("input", render);
  elements.level?.addEventListener("change", render);
  elements.sort?.addEventListener("change", render);
  elements.nav?.addEventListener("click", () => window.setTimeout(render, 0));
  elements.map.addEventListener("click", handleMapClick, true);
  elements.sidebarList?.addEventListener("click", handleSidebarClick);
  document.addEventListener("click", handleViewOpen);

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
    const toggle = event.target.closest("[data-knowledge-toggle]");
    const move = event.target.closest("[data-knowledge-move]");
    if (!toggle && !move) return;

    event.preventDefault();
    event.stopPropagation();

    if (toggle) {
      const id = toggle.dataset.knowledgeToggle;
      collapsed.has(id) ? collapsed.delete(id) : collapsed.add(id);
      render();
      return;
    }

    const [id, direction] = move.dataset.knowledgeMove.split(":");
    moveRoot(id, direction);
  }

  function handleSidebarClick(event) {
    const control = event.target.closest("[data-knowledge-focus]");
    if (!control) return;
    event.preventDefault();
    focusNode(control.dataset.knowledgeFocus);
  }

  function render() {
    if (elements.title) elements.title.textContent = "База знаний";
    renderSidebar();

    const nodes = getVisibleTree();
    if (!nodes.length) {
      elements.map.innerHTML = `<div class="empty-state">По этому запросу ничего не найдено.</div>`;
      return;
    }

    elements.map.innerHTML = `<div class="knowledge-tree">${nodes.map((node, index) => renderBranch(node, 0, index, nodes.length)).join("")}</div>`;
  }

  function renderSidebar() {
    if (!elements.sidebarList) return;
    const controls = getControlState();
    const allNodes = flattenTree(sortTree(withDepth(getOrderedTree())));
    const items = controls.isFiltered
      ? allNodes.filter((node) => matchesControls(node, controls))
      : allNodes.filter((node) => node.__depth === 0);

    if (!items.length) {
      elements.sidebarList.innerHTML = `<div class="knowledge-sidebar-empty">Ничего не найдено</div>`;
      return;
    }

    elements.sidebarList.innerHTML = items.map((node) => `
      <button class="knowledge-sidebar-item" data-knowledge-focus="${escapeHtml(node.id)}" type="button">
        <span class="knowledge-sidebar-level">${node.__depth + 1}</span>
        <span>${escapeHtml(node.title)}</span>
      </button>
    `).join("");
  }

  function getVisibleTree() {
    const ordered = sortTree(withDepth(getOrderedTree()));
    const controls = getControlState();
    return controls.isFiltered ? filterTree(ordered, controls) : ordered;
  }

  function getOrderedTree() {
    const order = rootOrder.length ? rootOrder : tree.map((node) => node.id);
    const knownIds = new Set(tree.map((node) => node.id));
    rootOrder = [
      ...order.filter((id) => knownIds.has(id)),
      ...tree.map((node) => node.id).filter((id) => !order.includes(id))
    ];
    const indexById = new Map(rootOrder.map((id, index) => [id, index]));
    return [...tree].sort((a, b) => (indexById.get(a.id) || 0) - (indexById.get(b.id) || 0));
  }

  function getControlState() {
    const search = (elements.search?.value || "").trim().toLowerCase();
    const level = elements.level?.value || "all";
    const sort = elements.sort?.value || "structure";
    return { search, level, sort, isFiltered: Boolean(search || level !== "all") };
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
    const sorted = sort === "structure" ? [...nodes] : [...nodes].sort((a, b) => {
      const result = String(a.title).localeCompare(String(b.title), "ru");
      return sort === "az" ? result : -result;
    });
    return sorted.map((node) => ({ ...node, children: sortTree(node.children || []) }));
  }

  function flattenTree(nodes) {
    return nodes.flatMap((node) => [node, ...flattenTree(node.children || [])]);
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
    return depthMatch && (!controls.search || getSearchText(node).includes(controls.search));
  }

  function getSearchText(node) {
    return [node.title, node.summary, ...(node.details || [])].join(" ").toLowerCase();
  }

  function renderBranch(node, depth, rootIndex = 0, rootCount = 1) {
    const controls = getControlState();
    const children = node.children || [];
    const details = Array.isArray(node.details) ? node.details : [];
    const sourceLinks = renderSources(node.sources);
    const isCollapsed = !controls.isFiltered && collapsed.has(node.id);
    const hasBody = Boolean(node.summary || details.length || sourceLinks || children.length);
    const moveControls = depth === 0 ? `
      <div class="knowledge-move-controls" aria-label="Переместить раздел">
        <button class="small-button" data-knowledge-move="${node.id}:up" type="button" ${rootIndex === 0 ? "disabled" : ""}>Выше</button>
        <button class="small-button" data-knowledge-move="${node.id}:down" type="button" ${rootIndex === rootCount - 1 ? "disabled" : ""}>Ниже</button>
      </div>
    ` : "";

    return `
      <article class="knowledge-branch ${depth === 0 ? "root" : "child"} ${isCollapsed ? "collapsed" : ""}" data-knowledge-node="${escapeHtml(node.id)}" style="--depth: ${Math.min(depth, 5)}">
        <div class="knowledge-branch-body">
          <button class="knowledge-toggle" data-knowledge-toggle="${escapeHtml(node.id)}" type="button" aria-label="${isCollapsed ? "Раскрыть" : "Свернуть"} ${escapeHtml(node.title)}" aria-expanded="${!isCollapsed}" ${hasBody ? "" : "disabled"}>
            <span class="knowledge-toggle-mark" aria-hidden="true">${isCollapsed ? "+" : "-"}</span>
          </button>
          ${renderTopicIcon(node)}
          <div class="knowledge-branch-copy">
            <p class="knowledge-node-title">${escapeHtml(node.title)}</p>
            ${!isCollapsed && node.summary ? `<p class="knowledge-node-goal">${escapeHtml(node.summary)}</p>` : ""}
          </div>
          ${moveControls}
        </div>
        ${!isCollapsed && details.length ? `<ul class="knowledge-details">${details.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}
        ${!isCollapsed && sourceLinks ? `<div class="knowledge-source-row">${sourceLinks}</div>` : ""}
        ${!isCollapsed && children.length ? `<div class="knowledge-children">${children.map((child) => renderBranch(child, depth + 1)).join("")}</div>` : ""}
      </article>
    `;
  }

  function renderSources(sourceIds = []) {
    return sourceIds
      .map((id) => sources[id])
      .filter(Boolean)
      .map((source) => `<a class="knowledge-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`)
      .join("");
  }

  function renderTopicIcon(node) {
    const kind = getIconKind(node);
    const path = {
      api: "M8 12h8M6 8h4l2 4 2-4h4M6 16h4l2-4 2 4h4",
      requirements: "M8 5h8l3 3v11H8zM16 5v4h4M10 12h7M10 16h6",
      process: "M5 7h6v5H5zM14 12h5v5h-5zM11 9h3M9 12v2h5",
      data: "M6 7c0-1.1 2.7-2 6-2s6 .9 6 2-2.7 2-6 2-6-.9-6-2zM6 7v10c0 1.1 2.7 2 6 2s6-.9 6-2V7M6 12c0 1.1 2.7 2 6 2s6-.9 6-2",
      architecture: "M5 7h5v5H5zM14 7h5v5h-5zM9 16h6M12 12v4M7.5 12v3M16.5 12v3",
      security: "M12 4l7 3v5c0 4-2.8 6.8-7 8-4.2-1.2-7-4-7-8V7zM9.5 12.5l1.7 1.7 3.7-4",
      default: "M12 5v14M5 12h14M12 5a7 7 0 1 1 0 14 7 7 0 0 1 0-14z"
    }[kind];
    return `<span class="knowledge-topic-icon knowledge-topic-icon-${kind}" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="${path}" /></svg></span>`;
  }

  function getIconKind(node) {
    const value = `${node.id || ""} ${node.title || ""}`.toLowerCase();
    if (/api|rest|http|grpc|soap|webhook|kafka|integration|broker/.test(value)) return "api";
    if (/requirement|story|stakeholder|elicitation/.test(value)) return "requirements";
    if (/process|bpmn|uml|diagram|journey|workflow/.test(value)) return "process";
    if (/sql|data|database|metrics|erd|analytics/.test(value)) return "data";
    if (/architecture|system|distributed|reliability|nfr/.test(value)) return "architecture";
    if (/security|auth|oauth|jwt|pii|audit/.test(value)) return "security";
    return "default";
  }

  function focusNode(nodeId) {
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
      if (depth > 0 && (node.children || []).length) ids.add(node.id);
      getDefaultCollapsedIds(node.children || [], depth + 1).forEach((id) => ids.add(id));
      return ids;
    }, new Set());
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

  function escapeHtml(value) {
    return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  }

  function cssEscape(value) {
    return window.CSS?.escape ? window.CSS.escape(value) : String(value).replaceAll('"', '\\"');
  }
})();
