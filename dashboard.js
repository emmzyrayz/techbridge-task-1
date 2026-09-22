// ---------- Persistence ----------
// Only completions are ever written here (a task moving to "completed"),
// stored as { [taskNumber]: "completed" } and merged over the defaults in
// dashboard-data.js at render time. This means refreshing the page (or
// coming back later) doesn't silently lose progress you already marked.
const DASHBOARD_STORAGE_KEY = "techbridge-dashboard-progress";

function getStatusOverrides() {
  try {
    const raw = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function persistTaskCompleted(number) {
  const overrides = getStatusOverrides();
  overrides[number] = "completed";
  localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(overrides));
}

function getEffectiveTasks() {
  const overrides = getStatusOverrides();
  return dashboardTasks.map((task) => ({
    ...task,
    status: overrides[task.number] || task.status,
  }));
}

// ---------- DOM references ----------
const taskGrid = document.getElementById("task-grid");
const progressCount = document.getElementById("progress-count");
const progressPercent = document.getElementById("progress-percent");
const progressTrack = document.getElementById("progress-track");
const progressRemaining = document.getElementById("progress-remaining");

const modal = document.getElementById("task-modal");
const modalClose = document.getElementById("task-modal-close");
const modalTitle = document.getElementById("task-modal-title");
const modalDesc = document.getElementById("task-modal-desc");
const modalStatus = document.getElementById("task-modal-status");
const modalCompleteBtn = document.getElementById("task-modal-complete");

let activeFilter = "all";
let modalTaskNumber = null;
let lastFocusedElement = null;

// ---------- Status display helpers ----------
const STATUS_LABEL = {
  completed: "Completed",
  "in-progress": "In Progress",
  "not-started": "Not Started",
};

const STATUS_CLASS = {
  completed: "status-completed",
  "in-progress": "status-current",
  "not-started": "status-upcoming",
};

// ---------- Progress section (B) ----------
function renderProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const remaining = total - completed;
  const percent = Math.round((completed / total) * 100);

  progressCount.textContent = `${completed} of ${total} tasks completed`;
  progressPercent.textContent = `${percent}%`;
  progressRemaining.textContent =
    remaining === 0
      ? "All tasks complete — nice work!"
      : `${remaining} task${remaining === 1 ? "" : "s"} remaining`;

  progressTrack.innerHTML = "";
  tasks.forEach((task) => {
    const segment = document.createElement("span");
    segment.className = "progress-segment";
    if (task.status === "completed") segment.classList.add("done");
    else if (task.status === "in-progress") segment.classList.add("current");
    progressTrack.appendChild(segment);
  });
}

// ---------- Task tracker (C/D/E/F) ----------
function renderTasks() {
  const tasks = getEffectiveTasks();
  renderProgress(tasks);

  const visible =
    activeFilter === "all"
      ? tasks
      : tasks.filter((t) => t.status === activeFilter);

  taskGrid.innerHTML = "";

  if (visible.length === 0) {
    taskGrid.innerHTML = `<p class="no-tasks-message">No tasks match this filter.</p>`;
    return;
  }

  visible.forEach((task) => {
    const card = document.createElement("div");
    card.className = "glass-card tilt-card hover-card task-tracker-card";
    card.innerHTML = `
      <span class="status-tag ${STATUS_CLASS[task.status]}">${STATUS_LABEL[task.status]}</span>
      <h3>Task ${task.number}: ${task.title}</h3>
      <p>${task.desc}</p>
      <button type="button" class="btn btn-glass view-task-btn" data-number="${task.number}">View Task</button>
    `;
    taskGrid.appendChild(card);
  });
}

// ---------- Filters ----------
document.querySelectorAll(".filter-pill-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-pill-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

// ---------- View Task modal (G) ----------
taskGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".view-task-btn");
  if (!btn) return;
  openTaskModal(parseInt(btn.dataset.number));
});

function openTaskModal(number) {
  const task = getEffectiveTasks().find((t) => t.number === number);
  if (!task) return;

  modalTaskNumber = number;
  modalTitle.textContent = `Task ${task.number}: ${task.title}`;
  modalDesc.textContent = task.desc;
  modalStatus.textContent = STATUS_LABEL[task.status];
  modalStatus.className = `status-tag ${STATUS_CLASS[task.status]}`;

  if (task.status === "completed") {
    modalCompleteBtn.textContent = "\u2713 Already Completed";
    modalCompleteBtn.disabled = true;
  } else {
    modalCompleteBtn.textContent = "Mark as Completed";
    modalCompleteBtn.disabled = false;
  }

  modal.classList.remove("hidden");
  modal.classList.add("active");
  lastFocusedElement = document.activeElement;
  modalClose.focus();
}

function closeTaskModal() {
  modal.classList.remove("active");
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

modalClose.addEventListener("click", closeTaskModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeTaskModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("active")) {
    closeTaskModal();
  }
});

modalCompleteBtn.addEventListener("click", () => {
  if (modalTaskNumber === null) return;
  persistTaskCompleted(modalTaskNumber);
  renderTasks();
  closeTaskModal();
});

// ---------- Challenge Hub connection (H) ----------
function renderChallengeCount() {
  const el = document.getElementById("challenge-count-text");
  if (typeof challengeData === "undefined") {
    el.textContent = "Browse practical challenges across both tracks.";
    return;
  }
  el.textContent = `${challengeData.length} challenges available across Data Analytics and Web Development.`;
}

// ---------- Technology Explorer (I/J) ----------
const techInfo = {
  nextjs: {
    name: "Next.js",
    body: "Next.js is a React framework for building full-stack web applications. It adds server-side rendering, file-based routing, and built-in API routes on top of React, so pages can load fast and rank well in search engines without extra configuration. It's commonly used for production marketing sites, e-commerce platforms, and dashboards where both performance and SEO matter.",
  },
  vue: {
    name: "Vue.js",
    body: "Vue.js is a progressive JavaScript framework for building user interfaces. It's designed to be adopted incrementally — you can drop it into part of an existing page or build an entire single-page application with it. Developers often choose Vue for its gentle learning curve, clear component structure, and readable template syntax.",
  },
  angular: {
    name: "Angular",
    body: "Angular is a full-featured framework maintained by Google for building large, structured web applications. Unlike React or Vue, it comes with routing, form handling, and HTTP tooling built in, following an opinionated structure out of the box. It's common in enterprise applications, where many developers working on the same codebase benefit from that consistency.",
  },
  backend: {
    name: "Backend Development",
    body: "Backend development handles everything that happens behind the scenes of a website — servers, databases, authentication, and business logic — while the frontend (what you've been building throughout this internship) handles what the user actually sees and interacts with. The two typically communicate over an API, exchanging data as JSON. Common backend technologies include Node.js with Express.js (JavaScript, runs on the same language as the frontend), Django or Flask (Python), and Laravel (PHP) — each pairing a language with a framework that handles routing, database access, and server logic.",
  },
};

function renderTechPanel(key) {
  const info = techInfo[key];
  const panel = document.getElementById("tech-panel");
  panel.innerHTML = `<h3>${info.name}</h3><p>${info.body}</p>`;
}

document.querySelectorAll(".tech-tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tech-tab-btn").forEach((b) => {
      b.classList.remove("btn-accent", "active");
      b.classList.add("btn-glass");
    });
    btn.classList.remove("btn-glass");
    btn.classList.add("btn-accent", "active");
    renderTechPanel(btn.dataset.tech);
  });
});

// ---------- Init ----------
document.addEventListener("DOMContentLoaded", () => {
  renderTasks();
  renderChallengeCount();
  renderTechPanel("nextjs");
});
