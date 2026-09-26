// ---------- API configuration ----------
// Change this to your deployed Render URL once the backend is hosted;
// everything else in this file is agnostic to where the API actually lives.
const API_BASE_URL = "http://localhost:3000";

// In-memory cache of whatever the API last returned. This is the only
// source of truth for task state now — no localStorage fallback, since
// the whole point of Task 7 is that the server (not the browser) owns
// this data. Restarting the backend resets progress to tasks.json; that's
// expected, not a bug.
let allTasks = [];

// ---------- DOM references ----------
const taskGrid = document.getElementById("task-grid");
const progressCount = document.getElementById("progress-count");
const progressPercent = document.getElementById("progress-percent");
const progressTrack = document.getElementById("progress-track");
const progressRemaining = document.getElementById("progress-remaining");
const backendStatusEl = document.getElementById("backend-status");

const modal = document.getElementById("task-modal");
const modalClose = document.getElementById("task-modal-close");
const modalTitle = document.getElementById("task-modal-title");
const modalDesc = document.getElementById("task-modal-desc");
const modalStatus = document.getElementById("task-modal-status");
const modalCompleteBtn = document.getElementById("task-modal-complete");

let activeFilter = "all";
let modalTaskId = null;
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

// ---------- Backend status indicator ----------
function setBackendStatus(connected) {
  backendStatusEl.textContent = connected
    ? "Backend Status: Connected"
    : "Backend Status: Offline";
  backendStatusEl.classList.toggle("backend-online", connected);
  backendStatusEl.classList.toggle("backend-offline", !connected);
}

// ---------- Loading / error states ----------
function showLoadingState() {
  taskGrid.innerHTML = `<p class="loading-message">Loading tasks&hellip;</p>`;
}

function showErrorState() {
  taskGrid.innerHTML = `
    <div class="glass-card error-state">
      <h3>Unable to load tasks</h3>
      <p>Please check your connection or try again.</p>
      <button type="button" class="btn btn-accent" id="retry-btn">Try Again</button>
    </div>
  `;
  document.getElementById("retry-btn").addEventListener("click", loadTasks);
}

// ---------- Fetch tasks from the API ----------
async function loadTasks() {
  showLoadingState();
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks`);
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    allTasks = await response.json();
    setBackendStatus(true);
    renderTasks();
  } catch (error) {
    setBackendStatus(false);
    showErrorState();
  }
}

// ---------- Progress section ----------
function renderProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.status === "completed").length;
  const remaining = total - completed;
  const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

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

// ---------- Task tracker ----------
function renderTasks() {
  renderProgress(allTasks);

  const visible =
    activeFilter === "all"
      ? allTasks
      : allTasks.filter((t) => t.status === activeFilter);

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
      <h3>Task ${task.id}: ${task.title}</h3>
      <p>${task.description}</p>
      <button type="button" class="btn btn-glass view-task-btn" data-id="${task.id}">View Task</button>
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

// ---------- View Task modal ----------
taskGrid.addEventListener("click", (event) => {
  const btn = event.target.closest(".view-task-btn");
  if (!btn) return;
  openTaskModal(parseInt(btn.dataset.id));
});

async function openTaskModal(id) {
  modalTaskId = id;
  modal.classList.remove("hidden");
  modal.classList.add("active");
  lastFocusedElement = document.activeElement;

  modalTitle.textContent = "Loading\u2026";
  modalDesc.textContent = "";
  modalStatus.textContent = "";
  modalCompleteBtn.disabled = true;
  modalClose.focus();

  // A real round-trip per the brief (step 16), rather than just reading
  // the copy already sitting in allTasks from the initial GET /api/tasks.
  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${id}`);
    if (!response.ok)
      throw new Error(`Server responded with ${response.status}`);
    const task = await response.json();
    populateModal(task);
  } catch (error) {
    modalTitle.textContent = "Couldn't load this task";
    modalDesc.textContent = "Please check your connection and try again.";
  }
}

function populateModal(task) {
  modalTitle.textContent = `Task ${task.id}: ${task.title}`;
  modalDesc.textContent = task.description;
  modalStatus.textContent = STATUS_LABEL[task.status];
  modalStatus.className = `status-tag ${STATUS_CLASS[task.status]}`;

  if (task.status === "completed") {
    modalCompleteBtn.textContent = "\u2713 Already Completed";
    modalCompleteBtn.disabled = true;
  } else {
    modalCompleteBtn.textContent = "Mark as Completed";
    modalCompleteBtn.disabled = false;
  }
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

modalCompleteBtn.addEventListener("click", async () => {
  if (modalTaskId === null) return;

  const originalText = modalCompleteBtn.textContent;
  modalCompleteBtn.disabled = true;
  modalCompleteBtn.textContent = "Saving\u2026";

  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${modalTaskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "completed" }),
    });
    if (!response.ok)
      throw new Error(`Server responded with ${response.status}`);
    const updated = await response.json();

    const index = allTasks.findIndex((t) => t.id === updated.id);
    if (index !== -1) allTasks[index] = updated;

    renderTasks();
    closeTaskModal();
  } catch (error) {
    modalCompleteBtn.disabled = false;
    modalCompleteBtn.textContent = originalText;
    modalDesc.textContent =
      "Couldn't save that change — check your connection and try again.";
  }
});

// ---------- Challenge Hub connection ----------
function renderChallengeCount() {
  const el = document.getElementById("challenge-count-text");
  if (typeof challengeData === "undefined") {
    el.textContent = "Browse practical challenges across both tracks.";
    return;
  }
  el.textContent = `${challengeData.length} challenges available across Data Analytics and Web Development.`;
}

// ---------- Technology Explorer ----------
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
    body: "Backend development handles everything that happens behind the scenes of a website — servers, databases, authentication, and business logic — while the frontend (what you've been building throughout this internship) handles what the user actually sees and interacts with. The two typically communicate over an API, exchanging data as JSON — exactly what this dashboard now does with its own Node.js and Express backend. Common backend technologies include Node.js with Express.js (JavaScript, runs on the same language as the frontend), Django or Flask (Python), and Laravel (PHP) — each pairing a language with a framework that handles routing, database access, and server logic.",
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
  loadTasks();
  renderChallengeCount();
  renderTechPanel("nextjs");
});
