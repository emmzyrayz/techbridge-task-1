const internshipData = {
  web: [
    {
      day: 1,
      title: "Build the TechBridge Homepage",
      desc: "Create the first version of the TechBridge website using HTML and CSS.",
      diff: "Beginner",
      status: "completed",
    },
    {
      day: 4,
      title: "Build the TechBridge Programs Experience",
      desc: "Create a Programs experience presenting TechBridge's available learning programs.",
      diff: "Beginner",
      status: "completed",
    },
    {
      day: 8,
      title: "Build the Internship Tasks Experience",
      desc: "Create an interface that presents the TechBridge internship tasks and helps users understand the internship journey.",
      diff: "Beginner → Intermediate",
      status: "completed",
    },
    {
      day: 11,
      title: "Build an Interactive Internship Roadmap",
      desc: "Use JavaScript to allow visitors to switch between the Data Analytics and Web Development internship tracks.",
      diff: "Beginner → Intermediate",
      status: "current",
    },
    {
      day: 15,
      title: "Build the Intern Registration Experience",
      desc: "Create a professional registration and onboarding interface for TechBridge interns.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 19,
      title: "Build the Task Submission System",
      desc: "Create an interface through which interns can prepare and submit their task work.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 22,
      title: "Build the Intern Dashboard",
      desc: "Create a dashboard where an intern can view their profile, progress, tasks and submissions.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 26,
      title: "Build the Complete TechBridge Internship Platform",
      desc: "Combine the different components created during the internship into a complete TechBridge platform.",
      diff: "Intermediate",
      status: "upcoming",
    },
  ],
  data: [
    {
      day: 1,
      title: "Data Cleaning Basics",
      desc: "Clean a messy dataset using Google Sheets or Excel. Identify and fix duplicate rows, blank cells, inconsistent formatting, and incorrect data types.",
      diff: "Beginner",
      status: "completed",
    },
    {
      day: 4,
      title: "Formulas & Pivot Tables",
      desc: "Use spreadsheet formulas and Pivot Tables to answer questions and extract useful insights from a dataset.",
      diff: "Beginner",
      status: "completed",
    },
    {
      day: 8,
      title: "Data Visualization",
      desc: "Create charts and a simple dashboard that communicate useful insights from a dataset.",
      diff: "Beginner → Intermediate",
      status: "completed",
    },
    {
      day: 11,
      title: "Introduction to SQL",
      desc: "Practice basic SQL queries and use them to answer real-world questions about data.",
      diff: "Beginner → Intermediate",
      status: "current",
    },
    {
      day: 15,
      title: "SQL Joins & Aggregations",
      desc: "Use JOIN, GROUP BY and aggregate functions such as COUNT, SUM and AVG to analyze information across multiple tables.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 19,
      title: "Lookup Functions & Data Wrangling",
      desc: "Use VLOOKUP or XLOOKUP to combine related datasets and handle data mismatches.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 22,
      title: "Mini Analysis Project",
      desc: "Complete a small end-to-end analysis involving data cleaning, formulas, Pivot Tables, charts and recommendations.",
      diff: "Intermediate",
      status: "upcoming",
    },
    {
      day: 26,
      title: "Capstone Project",
      desc: "Complete a larger project combining spreadsheet analysis and SQL using at least two related tables.",
      diff: "Intermediate",
      status: "upcoming",
    },
  ],
};

const timelineContainer = document.getElementById("timeline-container");
const currentTrackLabel = document.getElementById("current-track-name");
const btnWeb = document.getElementById("btn-web");
const btnData = document.getElementById("btn-data");

function renderTasks(trackKey) {
  timelineContainer.innerHTML = "";

  const tasks = internshipData[trackKey];

  tasks.forEach((task, index) => {
    const taskNumber = index + 1;

    let diffClass = "";
    if (task.diff === "Beginner") diffClass = "beginner";
    else if (task.diff === "Beginner → Intermediate")
      diffClass = "beginner-int";
    else if (task.diff === "Intermediate") diffClass = "intermediate";
    else diffClass = "advanced";

    let statusHtml = "";
    if (task.status === "completed") {
      statusHtml = `<span class="status-tag status-completed">&check; Completed</span>`;
    } else if (task.status === "current") {
      statusHtml = `<span class="status-tag status-current">In progress</span>`;
    } else {
      statusHtml = `<span class="status-tag status-upcoming">Upcoming</span>`;
    }

    const taskHtml = `
            <div class="timeline-item" id="task-${taskNumber}" data-status="${task.status}">
                <div class="timeline-dot"></div>
                <div class="glass-card timeline-card">
                    <div class="task-header">
                        <span class="task-day">Day ${task.day}</span>
                        <span class="difficulty ${diffClass}">${task.diff}</span>
                    </div>
                    ${statusHtml}
                    <h2>Task ${taskNumber}: ${task.title}</h2>
                    <p>${task.desc}</p>
                    <details class="task-details">
                        <summary>View task details</summary>
                        <div class="task-details-body">
                            <p>Practical application of ${task.diff.toLowerCase()} skills for this stage of the internship.</p>
                        </div>
                    </details>
                </div>
            </div>
        `;
    timelineContainer.insertAdjacentHTML("beforeend", taskHtml);
  });
}

function switchTrack(track) {
  if (track === "web") {
    currentTrackLabel.innerText = "Web Development";
    btnWeb.classList.replace("btn-glass", "btn-accent");
    btnData.classList.replace("btn-accent", "btn-glass");
    renderTasks("web");
  } else {
    currentTrackLabel.innerText = "Data Analytics";
    btnData.classList.replace("btn-glass", "btn-accent");
    btnWeb.classList.replace("btn-accent", "btn-glass");
    renderTasks("data");
  }
}

btnWeb.addEventListener("click", () => switchTrack("web"));
btnData.addEventListener("click", () => switchTrack("data"));

document.addEventListener("DOMContentLoaded", () => {
  switchTrack("web");
});

timelineContainer.addEventListener("animationend", (event) => {
  if (event.target.classList.contains("glass-card")) {
    event.target.style.opacity = "1";
    event.target.style.animation = "none";
  }
});

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;
const supportsFineHover = window.matchMedia(
  "(hover: hover) and (pointer: fine)",
).matches;

if (supportsFineHover && !prefersReducedMotion) {
  const MAX_TILT_DEG = 8;

  let activeCard = null;
  let activeRect = null;

  const resetTilt = (card) => {
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    card.classList.remove("is-tilting");
  };

  timelineContainer.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".timeline-card");

    if (card !== activeCard) {
      if (activeCard) resetTilt(activeCard);
      activeCard = card;
      activeRect = card ? card.getBoundingClientRect() : null;
    }

    if (!activeCard) return;

    const px = (event.clientX - activeRect.left) / activeRect.width;
    const py = (event.clientY - activeRect.top) / activeRect.height;

    if (px < 0 || px > 1 || py < 0 || py > 1) {
      resetTilt(activeCard);
      activeCard = null;
      activeRect = null;
      return;
    }

    const tiltY = (px - 0.5) * MAX_TILT_DEG * 2;
    const tiltX = (0.5 - py) * MAX_TILT_DEG * 2;

    activeCard.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
    activeCard.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
    activeCard.style.setProperty("--glow-x", `${(px * 100).toFixed(1)}%`);
    activeCard.style.setProperty("--glow-y", `${(py * 100).toFixed(1)}%`);
    activeCard.classList.add("is-tilting");
  });

  timelineContainer.addEventListener("pointerleave", () => {
    if (activeCard) {
      resetTilt(activeCard);
      activeCard = null;
      activeRect = null;
    }
  });
}
