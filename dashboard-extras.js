// dashboard-extras.js — Task 7 optional challenges 1, 2, 3, 5
// (POST/add task, DELETE/remove task, search, and UI polish).
//
// This is written as a separate, additive script rather than folded
// directly into dashboard.js, so it can be dropped in without touching
// working code. It expects the following globals to already exist from
// dashboard.js — adjust the names below if the real file differs:
//   - API_BASE_URL      (string, the API origin)
//   - allTasks          (array, the currently-loaded task list)
//   - renderTasks()      (function, re-renders the task grid from allTasks)
//   - searchMatchIds     (Set of ids matching the active search, or null)
//
// Include this AFTER dashboard.js on dashboard.html:
//   <script src="dashboard.js"></script>
//   <script src="dashboard-extras.js"></script>

// ---------- Toast notifications ----------
function showToast(message, type = "info") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  // Force a reflow so the enter animation actually plays instead of the
  // element appearing already in its end state.
  void toast.offsetWidth;
  toast.classList.add("toast-visible");

  setTimeout(() => {
    toast.classList.remove("toast-visible");
    toast.addEventListener("transitionend", () => toast.remove(), {
      once: true,
    });
  }, 3200);
}

// ---------- Dashboard statistics (Option 5) ----------
function renderStats(tasks) {
  const statsEl = document.getElementById("dashboard-stats");
  if (!statsEl) return;

  const counts = { completed: 0, "in-progress": 0, "not-started": 0 };
  tasks.forEach((t) => {
    if (counts[t.status] !== undefined) counts[t.status]++;
  });

  statsEl.innerHTML = `
    <div class="stat-tile">
      <span class="stat-number">${tasks.length}</span>
      <span class="stat-label">Total</span>
    </div>
    <div class="stat-tile stat-completed">
      <span class="stat-number">${counts.completed}</span>
      <span class="stat-label">Completed</span>
    </div>
    <div class="stat-tile stat-progress">
      <span class="stat-number">${counts["in-progress"]}</span>
      <span class="stat-label">In Progress</span>
    </div>
    <div class="stat-tile stat-pending">
      <span class="stat-number">${counts["not-started"]}</span>
      <span class="stat-label">Not Started</span>
    </div>
  `;
}

// ---------- Search (Option 3) ----------
let searchDebounceTimer = null;

async function handleSearchInput(event) {
  const term = event.target.value.trim();
  clearTimeout(searchDebounceTimer);

  searchDebounceTimer = setTimeout(async () => {
    try {
      const url = term
        ? `${API_BASE_URL}/api/tasks?search=${encodeURIComponent(term)}`
        : `${API_BASE_URL}/api/tasks`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Search request failed");
      const results = await res.json();

      // Only narrow what the grid shows — allTasks stays the full list so
      // the progress widget, stats, add and delete aren't working off a
      // filtered subset.
      searchMatchIds = term ? new Set(results.map((t) => t.id)) : null;
      renderTasks();

      const emptyState = document.getElementById("search-empty-state");
      if (term && results.length === 0) {
        if (emptyState) emptyState.classList.remove("hidden");
      } else if (emptyState) {
        emptyState.classList.add("hidden");
      }
    } catch (err) {
      showToast("Couldn't search tasks — check your connection.", "error");
    }
  }, 300);
}

// ---------- Add Task (Option 1) ----------
function openAddTaskModal() {
  const modal = document.getElementById("add-task-modal");
  if (!modal) return;
  document.getElementById("new-task-title").value = "";
  document.getElementById("new-task-description").value = "";
  const errorEl = document.getElementById("add-task-error");
  if (errorEl) errorEl.classList.add("hidden");
  modal.classList.remove("hidden");
  modal.classList.add("active");
  document.getElementById("new-task-title").focus();
}

function closeAddTaskModal() {
  const modal = document.getElementById("add-task-modal");
  if (modal) {
    modal.classList.remove("active");
    modal.classList.add("hidden");
  }
}

async function handleAddTaskSubmit(event) {
  event.preventDefault();
  const title = document.getElementById("new-task-title").value.trim();
  const description = document.getElementById("new-task-description").value.trim();
  const errorEl = document.getElementById("add-task-error");
  const submitBtn = document.getElementById("add-task-submit");

  if (!title || !description) {
    if (errorEl) {
      errorEl.textContent = "Both a title and a description are required.";
      errorEl.classList.remove("hidden");
    }
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Adding…";

  try {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Could not add task.");
    }

    const newTask = await res.json();
    allTasks.push(newTask);
    // Keep the just-added task visible even if a search is active.
    if (searchMatchIds) searchMatchIds.add(newTask.id);
    document.getElementById("search-empty-state")?.classList.add("hidden");
    renderTasks();
    renderStats(allTasks);
    closeAddTaskModal();
    showToast(`"${newTask.title}" added.`, "success");
  } catch (err) {
    if (errorEl) {
      errorEl.textContent = err.message;
      errorEl.classList.remove("hidden");
    }
    showToast("Couldn't add the task — try again.", "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Add Task";
  }
}

// ---------- Delete Task (Option 2) ----------
async function handleDeleteTask(id, titleForConfirm) {
  const confirmed = window.confirm(`Delete "${titleForConfirm}"? This can't be undone.`);
  if (!confirmed) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
    });
    if (res.status !== 204) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || "Could not delete task.");
    }

    allTasks = allTasks.filter((t) => t.id !== id);
    renderTasks();
    renderStats(allTasks);
    showToast("Task deleted.", "success");
  } catch (err) {
    showToast(err.message || "Couldn't delete the task — try again.", "error");
  }
}

// Event delegation for the delete buttons rendered inside task cards.
// Cards are expected to carry data-task-id and a .btn-delete-task button
// with a data-task-title attribute — see the HTML snippet in the handoff
// notes for the exact markup to add to the card template in dashboard.js.
document.addEventListener("click", (event) => {
  const deleteBtn = event.target.closest(".btn-delete-task");
  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.taskId);
    const title = deleteBtn.dataset.taskTitle || "this task";
    handleDeleteTask(id, title);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("task-search");
  if (searchInput) searchInput.addEventListener("input", handleSearchInput);

  const addBtn = document.getElementById("btn-add-task");
  if (addBtn) addBtn.addEventListener("click", openAddTaskModal);

  const addForm = document.getElementById("add-task-form");
  if (addForm) addForm.addEventListener("submit", handleAddTaskSubmit);

  const addCloseBtn = document.getElementById("add-task-close");
  if (addCloseBtn) addCloseBtn.addEventListener("click", closeAddTaskModal);

  const addModal = document.getElementById("add-task-modal");
  if (addModal) {
    addModal.addEventListener("click", (e) => {
      if (e.target === addModal) closeAddTaskModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const modal = document.getElementById("add-task-modal");
      if (modal && modal.classList.contains("active")) closeAddTaskModal();
    }
  });

  // Render stats once on load, once the initial fetch in dashboard.js has
  // populated allTasks. dashboard.js's loadTasks() should call
  // renderStats(allTasks) itself once it fetches — this is just a fallback
  // in case it's not wired up yet.
  setTimeout(() => {
    if (typeof allTasks !== "undefined" && allTasks.length) {
      renderStats(allTasks);
    }
  }, 500);
});
