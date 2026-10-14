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

const carousel = document.querySelector(".project-carousel");

if (carousel) {
  const slides = Array.from(carousel.querySelectorAll(".carousel-slide"));
  const autoplayToggle = carousel.querySelector(".carousel-toggle");
  const previousButton = carousel.querySelector(".carousel-previous");
  const nextButton = carousel.querySelector(".carousel-next");
  const lightbox = document.querySelector(".project-lightbox");
  const lightboxImage = lightbox?.querySelector(".lightbox-image");
  const lightboxClose = lightbox?.querySelector(".lightbox-close");
  const lightboxStage = lightbox?.querySelector(".lightbox-stage");
  const lightboxCounter = lightbox?.querySelector(".lightbox-counter");
  const lightboxPrevious = lightbox?.querySelector(".lightbox-previous");
  const lightboxNext = lightbox?.querySelector(".lightbox-next");
  const zoomOutButton = lightbox?.querySelector(".lightbox-zoom-out");
  const zoomResetButton = lightbox?.querySelector(".lightbox-zoom-reset");
  const zoomInButton = lightbox?.querySelector(".lightbox-zoom-in");
  let activeSlide = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let autoplayTimer;
  let autoplayPaused = false;
  let zoomScale = 1;
  let zoomX = 0;
  let zoomY = 0;
  let dragStart;

  const renderZoom = () => {
    if (!lightboxImage || !lightboxStage) return;
    lightboxImage.style.setProperty("--zoom-scale", zoomScale);
    lightboxImage.style.setProperty("--zoom-x", `${zoomX}px`);
    lightboxImage.style.setProperty("--zoom-y", `${zoomY}px`);
    lightboxStage.dataset.zoomed = String(zoomScale > 1);
    if (zoomResetButton) zoomResetButton.textContent = `${Math.round(zoomScale * 100)}%`;
  };

  const resetZoom = () => {
    zoomScale = 1;
    zoomX = 0;
    zoomY = 0;
    renderZoom();
  };

  const clampPan = () => {
    const maxX = (lightboxImage.clientWidth * (zoomScale - 1)) / 2;
    const maxY = (lightboxImage.clientHeight * (zoomScale - 1)) / 2;
    zoomX = Math.min(maxX, Math.max(-maxX, zoomX));
    zoomY = Math.min(maxY, Math.max(-maxY, zoomY));
  };

  const setZoom = (nextScale, clientX, clientY) => {
    if (!lightboxImage || !lightboxStage) return;
    const boundedScale = Math.min(4, Math.max(1, nextScale));
    if (boundedScale === zoomScale) return;

    const bounds = lightboxStage.getBoundingClientRect();
    const anchorX = (clientX ?? bounds.left + bounds.width / 2) - bounds.left - bounds.width / 2;
    const anchorY = (clientY ?? bounds.top + bounds.height / 2) - bounds.top - bounds.height / 2;
    zoomX += anchorX * (zoomScale - boundedScale);
    zoomY += anchorY * (zoomScale - boundedScale);
    zoomScale = boundedScale;
    clampPan();
    renderZoom();
  };

  const updateLightboxSlide = () => {
    if (!lightboxImage || !lightboxCounter) return;
    const image = slides[activeSlide].querySelector("img");
    lightboxImage.src = image.getAttribute("src");
    lightboxImage.alt = image.alt;
    lightboxCounter.textContent = `${String(activeSlide + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    resetZoom();
  };

  const showSlide = (index) => {
    activeSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeSlide;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.tabIndex = isActive ? 0 : -1;
    });

    if (lightbox?.open) updateLightboxSlide();
  };

  if (lightbox && lightboxImage && lightboxClose && typeof lightbox.showModal === "function") {
    slides.forEach((slide, index) => {
      slide.addEventListener("click", () => {
        showSlide(index);
        updateLightboxSlide();
        lightbox.showModal();
      });
    });

    lightboxClose.addEventListener("click", () => lightbox.close());
    lightboxPrevious.addEventListener("click", () => showSlide(activeSlide - 1));
    lightboxNext.addEventListener("click", () => showSlide(activeSlide + 1));
    zoomOutButton.addEventListener("click", () => setZoom(zoomScale / 1.25));
    zoomInButton.addEventListener("click", () => setZoom(zoomScale * 1.25));
    zoomResetButton.addEventListener("click", resetZoom);

    lightbox.addEventListener("wheel", (event) => {
      event.preventDefault();
      setZoom(zoomScale * (event.deltaY < 0 ? 1.15 : 1 / 1.15), event.clientX, event.clientY);
    }, { passive: false });

    lightboxStage.addEventListener("pointerdown", (event) => {
      if (zoomScale <= 1) return;
      dragStart = { x: event.clientX, y: event.clientY, zoomX, zoomY, pointerId: event.pointerId };
      lightboxStage.setPointerCapture(event.pointerId);
      lightboxStage.classList.add("is-dragging");
    });

    lightboxStage.addEventListener("pointermove", (event) => {
      if (!dragStart || event.pointerId !== dragStart.pointerId) return;
      zoomX = dragStart.zoomX + event.clientX - dragStart.x;
      zoomY = dragStart.zoomY + event.clientY - dragStart.y;
      clampPan();
      renderZoom();
    });

    const stopDragging = (event) => {
      if (!dragStart || event.pointerId !== dragStart.pointerId) return;
      dragStart = undefined;
      lightboxStage.classList.remove("is-dragging");
    };

    lightboxStage.addEventListener("pointerup", stopDragging);
    lightboxStage.addEventListener("pointercancel", stopDragging);

    lightbox.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(activeSlide - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(activeSlide + 1);
      } else if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        setZoom(zoomScale * 1.25);
      } else if (event.key === "-") {
        event.preventDefault();
        setZoom(zoomScale / 1.25);
      } else if (event.key === "0") {
        event.preventDefault();
        resetZoom();
      }
    });

    lightboxImage.addEventListener("load", resetZoom);
  }

  const stopAutoplay = () => {
    window.clearInterval(autoplayTimer);
    autoplayTimer = undefined;
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (
      !autoplayPaused &&
      !reducedMotion.matches &&
      !document.hidden &&
      !carousel.matches(":hover") &&
      !carousel.contains(document.activeElement) &&
      !lightbox?.open &&
      slides.length > 1
    ) {
      autoplayTimer = window.setInterval(() => showSlide(activeSlide + 1), 5000);
    }
  };

  autoplayToggle.addEventListener("click", () => {
    autoplayPaused = !autoplayPaused;
    autoplayToggle.setAttribute("aria-pressed", String(autoplayPaused));
    autoplayToggle.setAttribute(
      "aria-label",
      autoplayPaused ? "Resume automatic image rotation" : "Pause automatic image rotation"
    );
    autoplayToggle.textContent = autoplayPaused ? "▶" : "Ⅱ";
    startAutoplay();
  });

  previousButton.addEventListener("click", () => {
    showSlide(activeSlide - 1);
    startAutoplay();
  });

  nextButton.addEventListener("click", () => {
    showSlide(activeSlide + 1);
    startAutoplay();
  });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showSlide(activeSlide - 1);
      startAutoplay();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showSlide(activeSlide + 1);
      startAutoplay();
    }
  });

  carousel.addEventListener("pointerenter", stopAutoplay);
  carousel.addEventListener("pointerleave", () => {
    if (!carousel.contains(document.activeElement)) startAutoplay();
  });
  carousel.addEventListener("focusin", stopAutoplay);
  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) startAutoplay();
  });
  document.addEventListener("visibilitychange", startAutoplay);
  reducedMotion.addEventListener("change", startAutoplay);

  showSlide(activeSlide);
  startAutoplay();
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
