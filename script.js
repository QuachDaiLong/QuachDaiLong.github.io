const glow = document.querySelector(".cursor-glow");

window.addEventListener("pointermove", (e) => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add("visible");
  });
}, { threshold: 0.08 });

document.querySelectorAll(".section, .project-card, .skill-row, .process-step").forEach((el) => {
  el.classList.add("reveal");
  observer.observe(el);
});
