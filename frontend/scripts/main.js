/**
 * Rainbow Preschool – Main Interactive Script
 * Under Bunnyland Preschool
 *
 * Handles: smooth scrolling, form validation, gallery lightbox,
 * review carousel, scroll-reveal animations, lazy loading,
 * mobile menu, and error handling.
 */

(function () {
  "use strict";

  // =========================================================
  // 1. Smooth Scroll for Navigation Links
  // =========================================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        const targetId = this.getAttribute("href");
        if (targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (!targetEl) return;

        e.preventDefault();

        // Close mobile menu if open
        closeMobileMenu();

        const headerOffset = 120;
        const elementPosition = targetEl.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      });
    });
  }

  // =========================================================
  // 2. Form Validation & Submission
  // =========================================================

  // --- Toast Notification System ---
  function showToast(message, type) {
    var container = document.getElementById("toast-container");
    if (!container) return;

    var toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML =
      '<span class="material-symbols-outlined" style="font-size:1.2rem">' +
      (type === "success" ? "check_circle" : "error") +
      "</span>" +
      message;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(function () {
      toast.classList.add("show");
    });

    // Auto-dismiss after 4s
    setTimeout(function () {
      toast.classList.remove("show");
      setTimeout(function () {
        toast.remove();
      }, 400);
    }, 4000);
  }

  // --- Utility: Clear errors on a form ---
  function clearFormErrors(form) {
    form.querySelectorAll(".form-error-msg, .contact-error-msg").forEach(function (el) {
      el.classList.remove("visible");
    });
    form.querySelectorAll(".input-error, .contact-input-error").forEach(function (el) {
      el.classList.remove("input-error", "contact-input-error");
    });
  }

  // --- Utility: Show error on a specific field ---
  function showFieldError(input, errorEl, isContactForm) {
    var errorClass = isContactForm ? "contact-input-error" : "input-error";
    input.classList.add(errorClass);
    if (errorEl) errorEl.classList.add("visible");
  }

  // --- Utility: Store form data in localStorage ---
  function storeFormData(key, data) {
    try {
      var existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(data);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn("Could not store form data:", e);
    }
  }



  // =========================================================
  // 3. Gallery Lightbox
  // =========================================================
  function initLightbox() {
    var overlay = document.getElementById("lightbox-overlay");
    var lightboxImg = document.getElementById("lightbox-img");
    var closeBtn = document.getElementById("lightbox-close");

    if (!overlay || !lightboxImg) return;

    // Attach click to gallery images
    var gallerySection = document.getElementById("gallery");
    if (!gallerySection) return;

    gallerySection.querySelectorAll("img").forEach(function (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", function () {
        lightboxImg.src = this.src;
        lightboxImg.alt = this.getAttribute("data-alt") || "Gallery image";
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
      });
    });

    function closeLightbox() {
      overlay.classList.remove("active");
      document.body.style.overflow = "";
    }

    closeBtn.addEventListener("click", closeLightbox);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeLightbox();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("active")) {
        closeLightbox();
      }
    });
  }

  // =========================================================
  // 4. Review Carousel
  // =========================================================
  window.initReviewCarousel = function() {
    const track = document.querySelector(".reviews-track");
    const prevBtn = document.getElementById("review-prev");
    const nextBtn = document.getElementById("review-next");
    const dotsContainer = document.getElementById("reviews-dots");

    if (!track || !prevBtn || !nextBtn) return;

    // Clear any existing autoplay timer
    if (window._reviewCarouselTimer) {
      clearInterval(window._reviewCarouselTimer);
      window._reviewCarouselTimer = null;
    }

    // Reset listeners by cloning
    const newPrev = prevBtn.cloneNode(true);
    const newNext = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrev, prevBtn);
    nextBtn.parentNode.replaceChild(newNext, nextBtn);

    const cards = track.querySelectorAll(".review-card");
    if (cards.length === 0) return;

    let currentIndex = 0;
    let visibleCount = 1;

    function getVisibleCount() {
      if (window.innerWidth >= 1200) return 3;
      if (window.innerWidth >= 992) return 2.5;
      if (window.innerWidth >= 768) return 2;
      if (window.innerWidth >= 480) return 1.2;
      return 1;
    }

    function getMaxIndex() {
      // Allow partial scrolling if visibleCount is not integer
      return Math.max(0, cards.length - Math.floor(getVisibleCount()));
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const maxIdx = getMaxIndex();
      
      for (let i = 0; i <= maxIdx; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot' + (i === currentIndex ? ' active' : '');
        dot.addEventListener('click', () => {
          currentIndex = i;
          updateCarousel();
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateCarousel() {
      visibleCount = getVisibleCount();
      const maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) currentIndex = maxIdx;

      const gap = 8; // Must match CSS
      const containerWidth = track.parentElement.offsetWidth;
      
      // Calculate card width accounting for gaps
      // Formula: (TotalWidth - (GapsInViewport)) / visibleCount
      // If visibleCount is 3, there are 2 gaps.
      const cardWidth = (containerWidth - (Math.ceil(visibleCount) - 1) * gap) / visibleCount;
      
      cards.forEach(card => {
        card.style.width = cardWidth + 'px';
      });

      // Calculate translation: (cardWidth + gap) * currentIndex
      const offset = currentIndex * (cardWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function startAutoPlay() {
      window._reviewCarouselTimer = setInterval(function () {
        const maxIdx = getMaxIndex();
        if (currentIndex < maxIdx) {
          currentIndex++;
        } else {
          currentIndex = 0;
        }
        updateCarousel();
      }, 5000);
    }

    function resetAutoPlay() {
      if (window._reviewCarouselTimer) clearInterval(window._reviewCarouselTimer);
      startAutoPlay();
    }

    newPrev.addEventListener("click", function () {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : getMaxIndex();
      updateCarousel();
      resetAutoPlay();
    });

    newNext.addEventListener("click", function () {
      currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
      updateCarousel();
      resetAutoPlay();
    });

    // Touch/Swipe support
    let touchStartX = 0;
    let touchMoveX = 0;
    
    track.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchMoveX = touchStartX; // Prevent movement on simple tap
      if (window._reviewCarouselTimer) clearInterval(window._reviewCarouselTimer);
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      touchMoveX = e.touches[0].clientX;
    }, { passive: true });

    track.addEventListener("touchend", () => {
      const diff = touchStartX - touchMoveX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
        } else {
          currentIndex = currentIndex > 0 ? currentIndex - 1 : getMaxIndex();
        }
        updateCarousel();
      }
      startAutoPlay();
    });

    window.addEventListener("resize", updateCarousel);

    createDots();
    updateCarousel();
    startAutoPlay();
  }

  // =========================================================
  // 5. Scroll-Reveal Animations
  // =========================================================
  function initScrollReveal() {
    var revealElements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    if (!revealElements.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  // =========================================================
  // 6. Lazy Loading Images
  // =========================================================
  function initLazyLoading() {
    // For browsers with native lazy loading, add loaded class on load
    document.querySelectorAll('img[loading="lazy"]').forEach(function (img) {
      if (img.complete) {
        img.classList.add("loaded");
      } else {
        img.addEventListener("load", function () {
          img.classList.add("loaded");
        });
      }
    });

    // All other images — add loaded class immediately
    document.querySelectorAll("img:not([loading])").forEach(function (img) {
      img.classList.add("loaded");
    });
  }

  // =========================================================
  // 7. Mobile Navigation Menu
  // =========================================================
  var mobileMenuOpen = false;

  function openMobileMenu() {
    var overlay = document.getElementById("mobile-menu-overlay");
    var panel = document.getElementById("mobile-menu-panel");
    if (overlay && panel) {
      overlay.classList.add("active");
      panel.classList.add("active");
      document.body.style.overflow = "hidden";
      mobileMenuOpen = true;
    }
  }

  function closeMobileMenu() {
    var overlay = document.getElementById("mobile-menu-overlay");
    var panel = document.getElementById("mobile-menu-panel");
    if (overlay && panel) {
      overlay.classList.remove("active");
      panel.classList.remove("active");
      document.body.style.overflow = "";
      mobileMenuOpen = false;
    }
  }

  function initMobileMenu() {
    var toggleBtn = document.getElementById("mobile-menu-toggle");
    var overlay = document.getElementById("mobile-menu-overlay");

    if (toggleBtn) {
      toggleBtn.addEventListener("click", function () {
        if (mobileMenuOpen) {
          closeMobileMenu();
        } else {
          openMobileMenu();
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", closeMobileMenu);
    }

    // Close on ESC
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  // =========================================================
  // 8. Broken Image Fallback
  // =========================================================
  function initImageErrorHandling() {
    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        this.style.backgroundColor = "#f0eab6";
        this.style.display = "flex";
        this.style.alignItems = "center";
        this.style.justifyContent = "center";
        this.alt = this.getAttribute("data-alt") || "Image unavailable";
        // Hide the broken icon by setting min-height
        this.style.minHeight = "120px";
      });
    });
  }

  // =========================================================
  // 9. Active Nav Link Highlighting on Scroll
  // =========================================================
  function initActiveNavHighlight() {
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll('nav a[href^="#"]');

    if (!sections.length || !navLinks.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var id = entry.target.getAttribute("id");
            navLinks.forEach(function (link) {
              var isRegister = link.textContent.trim() === "Register Now";
              if (isRegister) return; // Don't change Register button style

              if (link.getAttribute("href") === "#" + id) {
                link.className = link.className
                  .replace(/text-stone-600/g, "text-orange-700")
                  .replace(/dark:text-stone-400/g, "dark:text-orange-300");
                if (!link.classList.contains("border-b-4")) {
                  link.classList.add("border-b-4", "border-orange-500");
                }
              } else {
                link.className = link.className
                  .replace(/text-orange-700/g, "text-stone-600")
                  .replace(/dark:text-orange-300/g, "dark:text-stone-400");
                link.classList.remove("border-b-4", "border-orange-500");
              }
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: "-120px 0px -40% 0px",
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  // =========================================================
  // INIT — Run everything on DOM ready
  // =========================================================
  document.addEventListener("DOMContentLoaded", function () {
    initSmoothScroll();

    initLightbox();
    initReviewCarousel();
    initScrollReveal();
    initLazyLoading();
    initMobileMenu();
    initImageErrorHandling();
    initActiveNavHighlight();
  });
})();
