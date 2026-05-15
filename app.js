const STORAGE_KEY = "prepbase-mvp-v2";
const STATUSES = ["Не знаю", "Учу", "Знаю", "Повторить"];
const PRIORITIES = ["Высокий", "Средний", "Низкий"];

const starterState = {
  activeTopicId: "all",
  topics: [
    {
      id: "algorithms",
      title: "Алгоритмы",
      goal: "Решать базовые задачи и уверенно объяснять сложность."
    },
    {
      id: "system-design",
      title: "System Design",
      goal: "Держать структуру ответа: требования, модель, API, хранение, риски."
    },
    {
      id: "behavioral",
      title: "Поведенческие вопросы",
      goal: "Собрать сильные истории по STAR и не импровизировать с нуля."
    }
  ],
  tasks: [
    {
      id: "task-1",
      topicId: "algorithms",
      title: "Повторить hash map, two pointers, sliding window",
      priority: "Высокий",
      done: false
    },
    {
      id: "task-2",
      topicId: "system-design",
      title: "Собрать шаблон ответа для проектирования сервиса",
      priority: "Средний",
      done: false
    },
    {
      id: "task-3",
      topicId: "behavioral",
      title: "Записать 5 историй: конфликт, провал, лидерство, инициатива, дедлайн",
      priority: "Высокий",
      done: true
    }
  ],
  questions: [
    {
      id: "question-1",
      topicId: "algorithms",
      text: "Как объяснить сложность алгоритма по времени и памяти?",
      answer: "Сначала называю размер входа, затем считаю доминирующие операции и дополнительную память.",
      status: "Учу",
      tags: ["complexity", "basics"]
    },
    {
      id: "question-2",
      topicId: "system-design",
      text: "Как начать system design ответ?",
      answer: "Уточнить функциональные и нефункциональные требования, оценить масштаб и согласовать границы.",
      status: "Повторить",
      tags: ["structure", "requirements"]
    },
    {
      id: "question-3",
      topicId: "behavioral",
      text: "Расскажите о сложном конфликте в команде.",
      answer: "Подготовить историю по STAR: ситуация, задача, действие, результат, вывод.",
      status: "Не знаю",
      tags: ["star", "teamwork"]
    }
  ]
};

const seedState = window.PREPBASE_SEED ?? starterState;
const knowledgeTree = Array.isArray(window.PREPBASE_KNOWLEDGE_TREE) ? window.PREPBASE_KNOWLEDGE_TREE : [];
const knowledgeSources = window.PREPBASE_KNOWLEDGE_SOURCES ?? {};
let state = loadState();
let editingTaskId = null;
let editingQuestionId = null;
let activeView = "overview";

const elements = {
  appNav: document.querySelector(".app-nav"),
  viewSections: document.querySelectorAll("[data-view]"),
  navTabs: document.querySelectorAll("[data-view-target]"),
  taskProgress: document.querySelector("#taskProgress"),
  taskProgressBar: document.querySelector("#taskProgressBar"),
  questionCount: document.querySelector("#questionCount"),
  repeatCount: document.querySelector("#repeatCount"),
  activeTopicName: document.querySelector("#activeTopicName"),
  activeTopicMeta: document.querySelector("#activeTopicMeta"),
  overviewFocusTitle: document.querySelector("#overviewFocusTitle"),
  overviewFocusText: document.querySelector("#overviewFocusText"),
  topicForm: document.querySelector("#topicForm"),
  topicTitle: document.querySelector("#topicTitle"),
  topicGoal: document.querySelector("#topicGoal"),
  topicFilters: document.querySelector("#topicFilters"),
  topicList: document.querySelector("#topicList"),
  knowledgePanelTitle: document.querySelector("#knowledgePanelTitle"),
  knowledgePanelCount: document.querySelector("#knowledgePanelCount"),
  knowledgeMap: document.querySelector("#knowledgeMap"),
  taskForm: document.querySelector("#taskForm"),
  taskTitle: document.querySelector("#taskTitle"),
  taskTopic: document.querySelector("#taskTopic"),
  taskPriority: document.querySelector("#taskPriority"),
  taskSubmit: document.querySelector("#taskSubmit"),
  cancelTaskEdit: document.querySelector("#cancelTaskEdit"),
  taskList: document.querySelector("#taskList"),
  taskPanelTitle: document.querySelector("#taskPanelTitle"),
  taskPanelCount: document.querySelector("#taskPanelCount"),
  questionForm: document.querySelector("#questionForm"),
  questionText: document.querySelector("#questionText"),
  questionTopic: document.querySelector("#questionTopic"),
  questionStatus: document.querySelector("#questionStatus"),
  questionTags: document.querySelector("#questionTags"),
  questionAnswer: document.querySelector("#questionAnswer"),
  questionSubmit: document.querySelector("#questionSubmit"),
  cancelQuestionEdit: document.querySelector("#cancelQuestionEdit"),
  questionSearch: document.querySelector("#questionSearch"),
  statusFilter: document.querySelector("#statusFilter"),
  questionList: document.querySelector("#questionList"),
  exportData: document.querySelector("#exportData"),
  importData: document.querySelector("#importData"),
  importFile: document.querySelector("#importFile"),
  resetDemo: document.querySelector("#resetDemo")
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return structuredClone(seedState);

  try {
    return normalizeState(JSON.parse(saved));
  } catch {
    return structuredClone(seedState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeState(raw) {
  const fallback = structuredClone(seedState);
  if (!raw || !Array.isArray(raw.topics) || !Array.isArray(raw.tasks) || !Array.isArray(raw.questions)) {
    return fallback;
  }

  const topics = raw.topics
    .filter((topic) => topic && topic.title)
    .map((topic) => ({
      id: String(topic.id || makeId("topic")),
      title: String(topic.title),
      goal: String(topic.goal || "")
    }));

  const topicIds = new Set(topics.map((topic) => topic.id));
  const firstTopicId = topics[0]?.id || fallback.topics[0].id;

  const tasks = raw.tasks
    .filter((task) => task && task.title)
    .map((task) => ({
      id: String(task.id || makeId("task")),
      topicId: topicIds.has(task.topicId) ? task.topicId : firstTopicId,
      title: String(task.title),
      priority: PRIORITIES.includes(task.priority) ? task.priority : "Средний",
      done: Boolean(task.done)
    }));

  const questions = raw.questions
    .filter((question) => question && question.text)
    .map((question) => ({
      id: String(question.id || makeId("question")),
      topicId: topicIds.has(question.topicId) ? question.topicId : firstTopicId,
      text: String(question.text),
      answer: String(question.answer || ""),
      status: STATUSES.includes(question.status) ? question.status : "Учу",
      tags: Array.isArray(question.tags) ? question.tags.map(String).filter(Boolean) : []
    }));

  return {
    activeTopicId: raw.activeTopicId && (raw.activeTopicId === "all" || topicIds.has(raw.activeTopicId)) ? raw.activeTopicId : "all",
    topics: topics.length ? topics : fallback.topics,
    tasks,
    questions
  };
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getTopic(topicId) {
  return state.topics.find((topic) => topic.id === topicId);
}

function getActiveTopic() {
  return state.activeTopicId === "all" ? null : getTopic(state.activeTopicId);
}

function getVisibleTasks() {
  if (state.activeTopicId === "all") return state.tasks;
  return state.tasks.filter((task) => task.topicId === state.activeTopicId);
}

function getVisibleQuestions() {
  const search = elements.questionSearch.value.trim().toLowerCase();
  const status = elements.statusFilter.value;

  return state.questions.filter((question) => {
    const topicMatch = state.activeTopicId === "all" || question.topicId === state.activeTopicId;
    const statusMatch = status === "all" || question.status === status;
    const searchText = [
      question.text,
      question.answer,
      question.tags.join(" "),
      getTopic(question.topicId)?.title ?? ""
    ]
      .join(" ")
      .toLowerCase();
    return topicMatch && statusMatch && (!search || searchText.includes(search));
  });
}

function render() {
  renderView();
  renderStats();
  renderTopicControls();
  renderTopicCards();
  renderKnowledgeMap();
  renderTaskFormOptions();
  renderTasks();
  renderQuestionFormOptions();
  renderQuestions();
}

function setActiveView(view) {
  activeView = view;
  renderView();
}

function renderView() {
  elements.viewSections.forEach((section) => {
    section.classList.toggle("active", section.dataset.view === activeView);
  });

  elements.navTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.viewTarget === activeView);
  });
}

function renderStats() {
  const completed = state.tasks.filter((task) => task.done).length;
  const total = state.tasks.length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  const repeat = state.questions.filter((question) => question.status === "Повторить").length;
  const activeTopic = getActiveTopic();

  elements.taskProgress.textContent = `${progress}%`;
  elements.taskProgressBar.style.width = `${progress}%`;
  elements.questionCount.textContent = state.questions.length;
  elements.repeatCount.textContent = `${repeat} на повторение`;
  elements.activeTopicName.textContent = activeTopic ? activeTopic.title : "Все темы";
  elements.activeTopicMeta.textContent = activeTopic ? activeTopic.goal : "Фильтр не выбран";
  elements.overviewFocusTitle.textContent = activeTopic ? activeTopic.title : "Все темы";
  elements.overviewFocusText.textContent = activeTopic
    ? activeTopic.goal
    : "Выберите тему в базе знаний, чтобы сузить задачи и вопросы.";
}

function renderTopicControls() {
  const chips = [
    `<button class="filter-chip ${state.activeTopicId === "all" ? "active" : ""}" data-topic-filter="all" type="button">Все</button>`,
    ...state.topics.map(
      (topic) =>
        `<button class="filter-chip ${state.activeTopicId === topic.id ? "active" : ""}" data-topic-filter="${topic.id}" type="button">${escapeHtml(topic.title)}</button>`
    )
  ];

  elements.topicFilters.innerHTML = chips.join("");
}

function renderTopicCards() {
  elements.topicList.innerHTML = state.topics
    .map((topic) => {
      const tasks = state.tasks.filter((task) => task.topicId === topic.id);
      const done = tasks.filter((task) => task.done).length;
      const questions = state.questions.filter((question) => question.topicId === topic.id).length;

      return `
        <article class="topic-card ${state.activeTopicId === topic.id ? "active" : ""}">
          <div class="topic-top">
            <div>
              <p class="topic-title">${escapeHtml(topic.title)}</p>
              <p class="topic-goal">${escapeHtml(topic.goal)}</p>
            </div>
            <span class="pill">${done}/${tasks.length}</span>
          </div>
          <div class="topic-actions">
            <button class="small-button" data-topic-filter="${topic.id}" type="button">Открыть</button>
            <span class="tag">${questions} вопросов</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderKnowledgeMap() {
  const activeTopic = getActiveTopic();
  const nodes = getVisibleKnowledgeTree();
  const nodeCount = countKnowledgeNodes(nodes);

  elements.knowledgePanelTitle.textContent = activeTopic ? activeTopic.title : "Карта знаний";
  elements.knowledgePanelCount.textContent = `${nodeCount} ${getPlural(nodeCount, "узел", "узла", "узлов")}`;

  if (!nodes.length) {
    elements.knowledgeMap.innerHTML = `<div class="empty-state">Для выбранной темы пока нет ветки знаний.</div>`;
    return;
  }

  elements.knowledgeMap.innerHTML = `
    <div class="knowledge-tree">
      ${nodes.map((node) => renderKnowledgeBranch(node)).join("")}
    </div>
  `;
}

function getVisibleKnowledgeTree() {
  if (state.activeTopicId === "all") return knowledgeTree;
  return filterKnowledgeTree(knowledgeTree, state.activeTopicId);
}

function filterKnowledgeTree(nodes, topicId) {
  return nodes.reduce((filtered, node) => {
    const children = filterKnowledgeTree(node.children || [], topicId);
    if (node.topicId === topicId) {
      filtered.push(node);
      return filtered;
    }
    if (children.length) filtered.push({ ...node, children });
    return filtered;
  }, []);
}

function countKnowledgeNodes(nodes) {
  return nodes.reduce((count, node) => count + 1 + countKnowledgeNodes(node.children || []), 0);
}

function renderKnowledgeBranch(node, depth = 0) {
  const children = Array.isArray(node.children) ? node.children : [];
  const topic = node.topicId ? getTopic(node.topicId) : null;
  const sources = renderKnowledgeSources(node.sources);
  const depthClass = depth === 0 ? "root" : "child";

  return `
    <article class="knowledge-branch ${depthClass}" style="--depth: ${Math.min(depth, 5)}">
      <div class="knowledge-branch-body">
        <div class="knowledge-branch-copy">
          <p class="knowledge-node-title">${escapeHtml(node.title)}</p>
          <p class="knowledge-node-goal">${escapeHtml(node.summary || "")}</p>
        </div>
        ${topic ? `<button class="small-button" data-topic-filter="${topic.id}" type="button">${escapeHtml(topic.title)}</button>` : ""}
      </div>
      ${sources ? `<div class="knowledge-source-row">${sources}</div>` : ""}
      ${children.length ? `<div class="knowledge-children">${children.map((child) => renderKnowledgeBranch(child, depth + 1)).join("")}</div>` : ""}
    </article>
  `;
}

function renderKnowledgeSources(sourceIds = []) {
  return sourceIds
    .map((sourceId) => knowledgeSources[sourceId])
    .filter(Boolean)
    .map(
      (source) =>
        `<a class="knowledge-source" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>`
    )
    .join("");
}

function renderTaskFormOptions() {
  elements.taskTopic.innerHTML = state.topics
    .map((topic) => `<option value="${topic.id}">${escapeHtml(topic.title)}</option>`)
    .join("");

  const task = state.tasks.find((item) => item.id === editingTaskId);
  if (task) {
    elements.taskTopic.value = task.topicId;
    return;
  }

  if (state.activeTopicId !== "all") elements.taskTopic.value = state.activeTopicId;
}

function renderTasks() {
  const activeTopic = getActiveTopic();
  const tasks = getVisibleTasks();

  elements.taskPanelTitle.textContent = activeTopic ? `Задачи: ${activeTopic.title}` : "Задачи";
  elements.taskPanelCount.textContent = tasks.length;

  if (!tasks.length) {
    elements.taskList.innerHTML = `<div class="empty-state">Для этой темы пока нет задач.</div>`;
    return;
  }

  elements.taskList.innerHTML = tasks
    .map((task) => {
      const topic = getTopic(task.topicId);
      return `
        <article class="task-card ${task.done ? "done" : ""} ${editingTaskId === task.id ? "editing" : ""}">
          <div>
            <p class="task-title">${escapeHtml(task.title)}</p>
            <p class="task-meta">${escapeHtml(topic?.title ?? "Без темы")} · ${escapeHtml(task.priority)}</p>
          </div>
          <div class="task-actions">
            <button class="small-button" data-edit-task="${task.id}" type="button">Редактировать</button>
            <button class="small-button" data-toggle-task="${task.id}" type="button">${task.done ? "Вернуть" : "Готово"}</button>
            <button class="small-button danger" data-delete-task="${task.id}" type="button">Удалить</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderQuestionFormOptions() {
  elements.questionTopic.innerHTML = state.topics
    .map((topic) => `<option value="${topic.id}">${escapeHtml(topic.title)}</option>`)
    .join("");

  const question = state.questions.find((item) => item.id === editingQuestionId);
  if (question) {
    elements.questionTopic.value = question.topicId;
    return;
  }

  if (state.activeTopicId !== "all") elements.questionTopic.value = state.activeTopicId;
}

function renderQuestions() {
  const questions = getVisibleQuestions();

  if (!questions.length) {
    elements.questionList.innerHTML = `<div class="empty-state">Нет вопросов под выбранные фильтры.</div>`;
    return;
  }

  elements.questionList.innerHTML = questions
    .map((question) => {
      const topic = getTopic(question.topicId);
      const tags = question.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("");

      return `
        <article class="question-card ${editingQuestionId === question.id ? "editing" : ""}">
          <div class="question-top">
            <div>
              <p class="question-title">${escapeHtml(question.text)}</p>
              <p class="task-meta">${escapeHtml(topic?.title ?? "Без темы")}</p>
            </div>
            <span class="status" data-status="${question.status}">${escapeHtml(question.status)}</span>
          </div>
          <p class="question-answer">${escapeHtml(question.answer || "Ответ пока не добавлен.")}</p>
          <div class="tag-row">${tags || `<span class="tag">без тегов</span>`}</div>
          <div class="question-actions">
            <button class="small-button" data-edit-question="${question.id}" type="button">Редактировать</button>
            ${STATUSES.map(
              (status) =>
                `<button class="small-button" data-question-status="${question.id}:${status}" type="button">${status}</button>`
            ).join("")}
            <button class="small-button danger" data-delete-question="${question.id}" type="button">Удалить</button>
          </div>
        </article>
      `;
    })
    .join("");
}

function setTaskEditMode(task) {
  editingTaskId = task?.id ?? null;
  elements.taskSubmit.textContent = task ? "Сохранить задачу" : "Добавить";
  elements.cancelTaskEdit.classList.toggle("hidden", !task);

  if (!task) {
    elements.taskForm.reset();
    renderTaskFormOptions();
    return;
  }

  elements.taskTitle.value = task.title;
  elements.taskTopic.value = task.topicId;
  elements.taskPriority.value = task.priority;
  elements.taskTitle.focus();
}

function setQuestionEditMode(question) {
  editingQuestionId = question?.id ?? null;
  elements.questionSubmit.textContent = question ? "Сохранить вопрос" : "Добавить вопрос";
  elements.cancelQuestionEdit.classList.toggle("hidden", !question);

  if (!question) {
    elements.questionForm.reset();
    renderQuestionFormOptions();
    return;
  }

  elements.questionText.value = question.text;
  elements.questionTopic.value = question.topicId;
  elements.questionStatus.value = question.status;
  elements.questionTags.value = question.tags.join(", ");
  elements.questionAnswer.value = question.answer;
  elements.questionText.focus();
}

function exportState() {
  const payload = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: "Prepbase MVP",
      ...state
    },
    null,
    2
  );
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `prepbase-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

async function importState(file) {
  if (!file) return;

  try {
    const imported = normalizeState(JSON.parse(await file.text()));
    state = imported;
    editingTaskId = null;
    editingQuestionId = null;
    elements.questionSearch.value = "";
    elements.statusFilter.value = "all";
    saveState();
    render();
  } catch {
    alert("Не удалось импортировать файл. Проверьте, что это JSON-экспорт Prepbase.");
  } finally {
    elements.importFile.value = "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getPlural(count, one, few, many) {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

elements.appNav.addEventListener("click", (event) => {
  const view = event.target.dataset.viewTarget;
  if (!view) return;
  setActiveView(view);
});

elements.topicForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.topicTitle.value.trim();
  const goal = elements.topicGoal.value.trim();
  if (!title || !goal) return;

  const topic = { id: makeId("topic"), title, goal };
  state.topics.push(topic);
  state.activeTopicId = topic.id;
  elements.topicForm.reset();
  saveState();
  render();
});

elements.topicFilters.addEventListener("click", (event) => {
  const topicId = event.target.dataset.topicFilter;
  if (!topicId) return;
  state.activeTopicId = topicId;
  saveState();
  render();
});

elements.topicList.addEventListener("click", (event) => {
  const topicId = event.target.dataset.topicFilter;
  if (!topicId) return;
  state.activeTopicId = topicId;
  saveState();
  render();
});

elements.knowledgeMap.addEventListener("click", (event) => {
  const topicId = event.target.dataset.topicFilter;
  const view = event.target.dataset.openView;
  if (!topicId && !view) return;

  if (topicId) {
    state.activeTopicId = topicId;
    saveState();
  }

  if (view) activeView = view;
  render();
});

elements.taskForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const title = elements.taskTitle.value.trim();
  if (!title) return;

  if (editingTaskId) {
    state.tasks = state.tasks.map((task) =>
      task.id === editingTaskId
        ? {
            ...task,
            topicId: elements.taskTopic.value,
            title,
            priority: elements.taskPriority.value
          }
        : task
    );
    setTaskEditMode(null);
  } else {
    state.tasks.unshift({
      id: makeId("task"),
      topicId: elements.taskTopic.value,
      title,
      priority: elements.taskPriority.value,
      done: false
    });
    elements.taskForm.reset();
  }

  saveState();
  render();
});

elements.taskList.addEventListener("click", (event) => {
  const editId = event.target.dataset.editTask;
  const toggleId = event.target.dataset.toggleTask;
  const deleteId = event.target.dataset.deleteTask;

  if (editId) {
    const task = state.tasks.find((item) => item.id === editId);
    setTaskEditMode(task);
    renderTasks();
    return;
  }

  if (toggleId) {
    state.tasks = state.tasks.map((task) =>
      task.id === toggleId ? { ...task, done: !task.done } : task
    );
  }

  if (deleteId) {
    state.tasks = state.tasks.filter((task) => task.id !== deleteId);
    if (editingTaskId === deleteId) setTaskEditMode(null);
  }

  if (toggleId || deleteId) {
    saveState();
    render();
  }
});

elements.cancelTaskEdit.addEventListener("click", () => {
  setTaskEditMode(null);
  render();
});

elements.questionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = elements.questionText.value.trim();
  if (!text) return;

  const questionData = {
    topicId: elements.questionTopic.value,
    text,
    answer: elements.questionAnswer.value.trim(),
    status: elements.questionStatus.value,
    tags: elements.questionTags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
  };

  if (editingQuestionId) {
    state.questions = state.questions.map((question) =>
      question.id === editingQuestionId ? { ...question, ...questionData } : question
    );
    setQuestionEditMode(null);
  } else {
    state.questions.unshift({
      id: makeId("question"),
      ...questionData
    });
    elements.questionForm.reset();
  }

  saveState();
  render();
});

elements.questionList.addEventListener("click", (event) => {
  const editId = event.target.dataset.editQuestion;
  const statusPayload = event.target.dataset.questionStatus;
  const deleteId = event.target.dataset.deleteQuestion;

  if (editId) {
    const question = state.questions.find((item) => item.id === editId);
    setQuestionEditMode(question);
    renderQuestions();
    return;
  }

  if (statusPayload) {
    const [id, status] = statusPayload.split(":");
    state.questions = state.questions.map((question) =>
      question.id === id ? { ...question, status } : question
    );
  }

  if (deleteId) {
    state.questions = state.questions.filter((question) => question.id !== deleteId);
    if (editingQuestionId === deleteId) setQuestionEditMode(null);
  }

  if (statusPayload || deleteId) {
    saveState();
    render();
  }
});

elements.cancelQuestionEdit.addEventListener("click", () => {
  setQuestionEditMode(null);
  render();
});

elements.questionSearch.addEventListener("input", renderQuestions);
elements.statusFilter.addEventListener("change", renderQuestions);
elements.exportData.addEventListener("click", exportState);
elements.importData.addEventListener("click", () => elements.importFile.click());
elements.importFile.addEventListener("change", (event) => importState(event.target.files[0]));

elements.resetDemo.addEventListener("click", () => {
  state = structuredClone(seedState);
  editingTaskId = null;
  editingQuestionId = null;
  elements.questionSearch.value = "";
  elements.statusFilter.value = "all";
  saveState();
  render();
});

render();
