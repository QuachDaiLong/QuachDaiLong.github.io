const glow = document.querySelector(".cursor-glow");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (glow) {
  window.addEventListener("pointermove", (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
  });
}

const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (nav && navToggle && navLinks) {
  document.body.classList.add("nav-menu-enhanced");

  const setMenuOpen = (isOpen) => {
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navLinks.classList.toggle("is-open", isOpen);
    navToggle.querySelector(".nav-toggle-label").textContent = isOpen ? "Close" : "Menu";
    navToggle.querySelector(".nav-toggle-icon").textContent = isOpen ? "×" : "＋";
  };

  navToggle.addEventListener("click", () => {
    setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
      setMenuOpen(false);
      navToggle.focus();
    }
  });

  window.matchMedia("(min-width: 851px)").addEventListener("change", (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

const revealElements = document.querySelectorAll(".section, .project-card, .skill-row, .process-step");

if (reducedMotion.matches || !("IntersectionObserver" in window)) {
  revealElements.forEach((element) => element.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    observer.observe(element);
  });
}

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {
  window.addEventListener("scroll", () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10;

    backToTop.classList.toggle("show", atBottom);
  }, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  });
}
