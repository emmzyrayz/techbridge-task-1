
const grid = document.getElementById("challenge-grid");
const searchInput = document.getElementById("search-input");
const trackFilter = document.getElementById("track-filter");
const diffFilter = document.getElementById("diff-filter");
const sortFilter = document.getElementById("sort-filter");
const btnReset = document.getElementById("btn-reset");
const resultsCount = document.getElementById("results-count");
const noResults = document.getElementById("no-results");
const btnClearSearch = document.getElementById("btn-clear-search");

const modal = document.getElementById("challenge-modal");
const modalClose = document.getElementById("modal-close");
const btnStart = document.getElementById("btn-simulate-start");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

let currentChallengeId = null;

function renderProgress() {
  const attempted = getAttemptedChallengeIds();
  const segments = progressBar.querySelectorAll(".progress-segment");
  segments.forEach((seg, i) => {
    seg.classList.toggle("done", i < attempted.length);
  });
  progressText.innerText = `${attempted.length} / 6`;
}

function renderChallenges() {
  const searchTerm = searchInput.value.toLowerCase();
  const trackVal = trackFilter.value;
  const diffVal = diffFilter.value;
  const sortVal = sortFilter.value;

  let filtered = challengeData.filter((challenge) => {
    const matchesSearch =
      challenge.title.toLowerCase().includes(searchTerm) ||
      challenge.shortDesc.toLowerCase().includes(searchTerm);
    const matchesTrack = trackVal === "All" || challenge.track === trackVal;
    const matchesDiff = diffVal === "All" || challenge.difficulty === diffVal;
    return matchesSearch && matchesTrack && matchesDiff;
  });

  filtered.sort((a, b) => {
    if (sortVal === "asc") return a.diffValue - b.diffValue;
    if (sortVal === "desc") return b.diffValue - a.diffValue;
    return 0;
  });

  grid.innerHTML = "";

  if (filtered.length === 0) {
    grid.classList.add("hidden");
    noResults.classList.remove("hidden");
    resultsCount.innerText = "Showing 0 challenges";
  } else {
    grid.classList.remove("hidden");
    noResults.classList.add("hidden");
    resultsCount.innerText = `Showing ${filtered.length} challenge${filtered.length > 1 ? "s" : ""}`;

    filtered.forEach((challenge, index) => {
      let diffClass = "";
      if (challenge.diffValue === 1) diffClass = "beginner";
      else if (challenge.diffValue === 2) diffClass = "intermediate";
      else diffClass = "advanced";

      const cardHtml = `
                <div class="glass-card challenge-card tilt-card hover-card ${challenge.trackClass}" style="animation-delay: ${index * 0.1}s">
                    <span class="challenge-category">${challenge.category}</span>
                    <div class="challenge-header">
                        <span class="status-tag">${challenge.track}</span>
                        <span class="difficulty ${diffClass}">${challenge.difficulty}</span>
                    </div>
                    <h3>${challenge.title}</h3>
                    <p>${challenge.shortDesc}</p>
                    <button class="btn btn-glass" onclick="openModal(${challenge.id})">View Challenge</button>
                </div>
            `;
      grid.insertAdjacentHTML("beforeend", cardHtml);
    });
  }
}

searchInput.addEventListener("input", renderChallenges);
trackFilter.addEventListener("change", renderChallenges);
diffFilter.addEventListener("change", renderChallenges);
sortFilter.addEventListener("change", renderChallenges);

btnReset.addEventListener("click", () => {
  searchInput.value = "";
  trackFilter.value = "All";
  diffFilter.value = "All";
  sortFilter.value = "asc";
  renderChallenges();
});

btnClearSearch.addEventListener("click", () => {
  searchInput.value = "";
  renderChallenges();
});

let lastFocusedElement = null;

function openModal(id) {
  const challenge = challengeData.find((c) => c.id === id);
  if (!challenge) return;

  currentChallengeId = id;

  let diffClass = "";
  if (challenge.diffValue === 1) diffClass = "beginner";
  else if (challenge.diffValue === 2) diffClass = "intermediate";
  else diffClass = "advanced";

  document.querySelector(".modal-header").className =
    `modal-header ${challenge.trackClass}`;
  document.getElementById("modal-track").innerText = challenge.track;
  document.getElementById("modal-track").className = "status-tag";

  document.getElementById("modal-diff").innerText = challenge.difficulty;
  document.getElementById("modal-diff").className = `difficulty ${diffClass}`;

  document.getElementById("modal-title").innerText = challenge.title;
  document.getElementById("modal-desc").innerText = challenge.shortDesc;
  document.getElementById("modal-objective").innerText = challenge.objective;
  document.getElementById("modal-outcome").innerText = challenge.outcome;
  document.getElementById("modal-skills").innerText = challenge.skills;
  document.getElementById("modal-tools").innerText = challenge.tools;

  modal.classList.remove("hidden");
  modal.classList.add("active");

  lastFocusedElement = document.activeElement;
  modalClose.focus();
}

function closeModal() {
  modal.classList.remove("active");
  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

modalClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    closeModal();
  }
});

btnStart.addEventListener("click", () => {
  if (currentChallengeId === null) return;
  markChallengeAttempted(currentChallengeId);
  window.location.href = `workspace.html?id=${currentChallengeId}`;
});


const themeToggle = document.getElementById("theme-toggle");
const htmlEl = document.documentElement;

const savedTheme = localStorage.getItem("techbridge-theme") || "dark";
htmlEl.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const currentTheme = htmlEl.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  htmlEl.setAttribute("data-theme", newTheme);
  localStorage.setItem("techbridge-theme", newTheme);
});

document.addEventListener("DOMContentLoaded", () => {
  renderChallenges();
  renderProgress();
});
