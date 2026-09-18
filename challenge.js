const challengeData = [
  {
    id: 1,
    title: "Customer Churn Analysis",
    track: "Data Analytics",
    trackClass: "track-data",
    difficulty: "Intermediate",
    diffValue: 2,
    category: "Data Mining",
    shortDesc:
      "Analyze a dataset of telecom customers to identify patterns in why users cancel their subscriptions.",
    outcome: "A presentation highlighting top churn indicators.",
    objective:
      "Clean the data, identify correlations, and propose retention strategies.",
    skills: "SQL, Excel Pivot Tables, Critical Thinking",
    tools: "MySQL, MS Excel / Google Sheets",
  },
  {
    id: 2,
    title: "Responsive Landing Page",
    track: "Web Development",
    trackClass: "track-web",
    difficulty: "Beginner",
    diffValue: 1,
    category: "UI/UX Development",
    shortDesc:
      "Build a single-page marketing website for a fictional coffee shop using modern HTML and CSS.",
    outcome:
      "A fully responsive webpage that looks great on mobile and desktop.",
    objective: "Practice semantic HTML and CSS Grid/Flexbox layouts.",
    skills: "HTML5, CSS3, Responsive Design",
    tools: "VS Code, Git",
  },
  {
    id: 3,
    title: "Sales Dashboard Build",
    track: "Data Analytics",
    trackClass: "track-data",
    difficulty: "Beginner",
    diffValue: 1,
    category: "Data Visualization",
    shortDesc:
      "Transform raw monthly sales data into an easy-to-read interactive dashboard.",
    outcome: "A dashboard presenting the company's monthly sales performance.",
    objective:
      "Use formulas to summarize data and create basic visualization charts.",
    skills: "Excel Formulas, Data Cleaning, Basic Charts",
    tools: "MS Excel / Google Sheets",
  },
  {
    id: 4,
    title: "Interactive Contact Form",
    track: "Web Development",
    trackClass: "track-web",
    difficulty: "Intermediate",
    diffValue: 2,
    category: "DOM Manipulation",
    shortDesc:
      "Create a contact form that validates user input in real-time using JavaScript before submission.",
    outcome:
      "A working form with error messages for invalid emails and empty fields.",
    objective:
      "Understand JavaScript event listeners and basic regex validation.",
    skills: "JavaScript, HTML Forms, CSS Styling",
    tools: "VS Code, Browser DevTools",
  },
  {
    id: 5,
    title: "E-Commerce Product API Integration",
    track: "Web Development",
    trackClass: "track-web",
    difficulty: "Advanced",
    diffValue: 3,
    category: "Asynchronous JS",
    shortDesc:
      "Fetch product data from a public API and display it in a dynamic, filterable product grid.",
    outcome: "A webpage that populates its content from an external database.",
    objective:
      "Master the JavaScript Fetch API, Promises, and dynamic DOM rendering.",
    skills: "JavaScript (ES6+), REST APIs, JSON",
    tools: "VS Code, Postman (Optional)",
  },
  {
    id: 6,
    title: "Predictive Inventory Modeling",
    track: "Data Analytics",
    trackClass: "track-data",
    difficulty: "Advanced",
    diffValue: 3,
    category: "Statistical Analysis",
    shortDesc:
      "Use historical sales data to forecast required inventory levels for the upcoming holiday season.",
    outcome: "A statistical model and report recommending order quantities.",
    objective:
      "Apply advanced analytical techniques to solve a real-world supply chain problem.",
    skills: "Advanced SQL, Statistical Modeling, Data Visualization",
    tools: "PostgreSQL, Tableau / PowerBI",
  },
];

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

let attemptedChallenges = 0;

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
  if (attemptedChallenges < 6) {
    const segments = progressBar.querySelectorAll(".progress-segment");
    segments[attemptedChallenges].classList.add("done");
    attemptedChallenges++;
    progressText.innerText = `${attemptedChallenges} / 6`;
  }
  closeModal();
  alert("Challenge started! Good luck.");
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

document.addEventListener("DOMContentLoaded", renderChallenges);
