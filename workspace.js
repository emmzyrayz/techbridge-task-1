document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const challengeId = parseInt(urlParams.get("id"));

  const challenge = challengeData.find((c) => c.id === challengeId);

  const titleEl = document.getElementById("workspace-title");
  const submitBtn = document.getElementById("btn-submit");
  const feedbackEl = document.getElementById("submit-feedback");

  if (!challenge) {
    titleEl.innerText = "Challenge not found.";
    document.getElementById("workspace-context").classList.add("hidden");
    submitBtn.classList.add("hidden");
    return;
  }

  markChallengeAttempted(challenge.id);

  titleEl.innerText = challenge.title;

  let diffClass = "";
  if (challenge.diffValue === 1) diffClass = "beginner";
  else if (challenge.diffValue === 2) diffClass = "intermediate";
  else diffClass = "advanced";

  document
    .getElementById("workspace-context")
    .classList.add(challenge.trackClass);
  const trackEl = document.getElementById("workspace-track");
  trackEl.innerText = challenge.track;
  trackEl.className = "status-tag";

  const diffEl = document.getElementById("workspace-diff");
  diffEl.innerText = challenge.difficulty;
  diffEl.className = `difficulty ${diffClass}`;

  document.getElementById("workspace-desc").innerText = challenge.shortDesc;

  const environment = document.getElementById("workspace-environment");

  const showFeedback = (message, isSuccess) => {
    feedbackEl.textContent = message;
    feedbackEl.classList.remove("hidden", "success", "error");
    feedbackEl.classList.add(isSuccess ? "success" : "error");
  };

  if (challenge.track === "Web Development") {
    environment.innerHTML = `
            <div class="editor-pane">
                <div class="editor-tabs" role="tablist">
                    <button type="button" class="btn btn-accent editor-tab-btn" data-editor="html" role="tab" aria-selected="true">HTML</button>
                    <button type="button" class="btn btn-glass editor-tab-btn" data-editor="css" role="tab" aria-selected="false">CSS</button>
                    <button type="button" class="btn btn-glass editor-tab-btn" data-editor="js" role="tab" aria-selected="false">JS</button>
                </div>
                <textarea id="editor-html" class="code-editor-pane" spellcheck="false" placeholder="&lt;!-- Write your HTML here --&gt;"></textarea>
                <textarea id="editor-css" class="code-editor-pane hidden" spellcheck="false" placeholder="/* Write your CSS here */"></textarea>
                <textarea id="editor-js" class="code-editor-pane hidden" spellcheck="false" placeholder="// Write your JavaScript here"></textarea>
            </div>
            <iframe id="live-preview" title="Live preview" sandbox="allow-scripts"></iframe>
        `;

    const editors = {
      html: document.getElementById("editor-html"),
      css: document.getElementById("editor-css"),
      js: document.getElementById("editor-js"),
    };
    const preview = document.getElementById("live-preview");
    const tabButtons = environment.querySelectorAll(".editor-tab-btn");

    const updatePreview = () => {
      preview.srcdoc = `<!DOCTYPE html>
<html>
<head><style>${editors.css.value}</style></head>
<body>
${editors.html.value}
<script>${editors.js.value}<\/script>
</body>
</html>`;
    };

    tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        tabButtons.forEach((b) => {
          b.classList.remove("btn-accent");
          b.classList.add("btn-glass");
          b.setAttribute("aria-selected", "false");
        });
        btn.classList.remove("btn-glass");
        btn.classList.add("btn-accent");
        btn.setAttribute("aria-selected", "true");

        Object.entries(editors).forEach(([key, el]) => {
          el.classList.toggle("hidden", key !== btn.dataset.editor);
        });
      });
    });

    Object.values(editors).forEach((el) => {
      el.addEventListener("input", updatePreview);
    });

    updatePreview();

    submitBtn.addEventListener("click", () => {
      const hasContent = Object.values(editors).some(
        (el) => el.value.trim() !== "",
      );
      if (!hasContent) {
        showFeedback(
          "Write some HTML, CSS, or JavaScript before submitting.",
          false,
        );
        editors.html.focus();
        return;
      }
      showFeedback(
        "Solution submitted! Nice work — head back to the Challenge Hub to try another.",
        true,
      );
    });
  } else if (challenge.track === "Data Analytics") {
    environment.innerHTML = `
            <div class="glass-card data-upload-zone text-center">
                <h3>Upload your analysis</h3>
                <p>Download the <a href="assets/data/data-${challenge.id}.csv" download>raw dataset</a>, perform your analysis, and upload the resulting CSV.</p>
                <input type="file" id="csv-upload" accept=".csv" class="form-control">
                <p id="upload-filename" class="upload-filename"></p>
            </div>
        `;
    const fileInput = document.getElementById("csv-upload");
    const filenameEl = document.getElementById("upload-filename");

    fileInput.addEventListener("change", () => {
      filenameEl.textContent = fileInput.files.length
        ? `Selected: ${fileInput.files[0].name}`
        : "";
    });

    submitBtn.addEventListener("click", () => {
      if (!fileInput.files.length) {
        showFeedback("Choose a CSV file to upload before submitting.", false);
        return;
      }
      showFeedback(
        "Solution submitted! Nice work — head back to the Challenge Hub to try another.",
        true,
      );
    });
  }
});
