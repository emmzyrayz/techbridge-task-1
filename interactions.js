document.addEventListener(
  "animationend",
  (event) => {
    if (event.target.classList.contains("tilt-card")) {
      event.target.style.opacity = "1";
      event.target.style.animation = "none";
    }
  },
  true,
);

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

  document.addEventListener("pointermove", (event) => {
    const card = event.target.closest(".tilt-card");

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

  document.addEventListener("pointerleave", () => {
    if (activeCard) {
      resetTilt(activeCard);
      activeCard = null;
      activeRect = null;
    }
  });
}
