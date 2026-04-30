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

  // --- Enquiry Form ---
  function initEnquiryForm() {
    var form = document.getElementById("enquiry-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormErrors(form);

      var nameInput = form.querySelector('[placeholder="Enter your full name"]');
      var ageInput = form.querySelector('[placeholder="e.g. 3 years"]');
      var phoneInput = form.querySelector('[type="tel"]');
      var messageInput = form.querySelector("textarea");

      var isValid = true;

      // Name validation
      if (!nameInput.value.trim()) {
        showFieldError(
          nameInput,
          nameInput.parentElement.querySelector(".form-error-msg"),
          false
        );
        isValid = false;
      }

      // Age validation
      if (!ageInput.value.trim()) {
        showFieldError(
          ageInput,
          ageInput.parentElement.querySelector(".form-error-msg"),
          false
        );
        isValid = false;
      }

      // Phone validation (10 digits)
      var phoneDigits = phoneInput.value.replace(/\D/g, "");
      if (phoneDigits.length < 10) {
        showFieldError(
          phoneInput,
          phoneInput.parentElement.querySelector(".form-error-msg"),
          false
        );
        isValid = false;
      }

      // Message validation
      if (!messageInput.value.trim()) {
        showFieldError(
          messageInput,
          messageInput.parentElement.querySelector(".form-error-msg"),
          false
        );
        isValid = false;
      }

      if (!isValid) {
        showToast("Please fix the errors in the form.", "error");
        return;
      }

      // Store in localStorage as backup
      storeFormData("enquiry_submissions", {
        name: nameInput.value.trim(),
        childAge: ageInput.value.trim(),
        phone: phoneInput.value.trim(),
        inquiry: form.querySelector("select").value,
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString(),
      });

      // Allow the form to submit to FormSubmit.co
      form.submit();
    });
  }

  // --- Contact Form ---
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearFormErrors(form);

      var nameInput = form.querySelector('[placeholder="Name"]');
      var emailInput = form.querySelector('[placeholder="Email Address"]');
      var messageInput = form.querySelector('[placeholder="Your Message"]');

      var isValid = true;

      // Name validation
      if (!nameInput.value.trim()) {
        showFieldError(
          nameInput,
          nameInput.parentElement.querySelector(".contact-error-msg"),
          true
        );
        isValid = false;
      }

      // Email validation
      var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailInput.value.trim())) {
        showFieldError(
          emailInput,
          emailInput.parentElement.querySelector(".contact-error-msg"),
          true
        );
        isValid = false;
      }

      // Message validation
      if (!messageInput.value.trim()) {
        showFieldError(
          messageInput,
          messageInput.parentElement.querySelector(".contact-error-msg"),
          true
        );
        isValid = false;
      }

      if (!isValid) {
        showToast("Please fill in all fields correctly.", "error");
        return;
      }

      // Store in localStorage as backup
      storeFormData("contact_submissions", {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: messageInput.value.trim(),
        timestamp: new Date().toISOString(),
      });

      // Allow the form to submit to FormSubmit.co
      form.submit();
    });
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
  function initReviewCarousel() {
    var track = document.querySelector(".reviews-track");
    var prevBtn = document.getElementById("review-prev");
    var nextBtn = document.getElementById("review-next");

    if (!track || !prevBtn || !nextBtn) return;

    var cards = track.querySelectorAll(".review-card");
    var currentIndex = 0;
    var autoPlayTimer = null;

    function getVisibleCount() {
      return window.innerWidth >= 768 ? 3 : 1;
    }

    function getMaxIndex() {
      var visible = getVisibleCount();
      return Math.max(0, cards.length - visible);
    }

    function updateCarousel() {
      var visible = getVisibleCount();
      var percentage = (currentIndex * 100) / visible;
      track.style.transform = "translateX(-" + percentage + "%)";
    }

    prevBtn.addEventListener("click", function () {
      currentIndex = currentIndex > 0 ? currentIndex - 1 : getMaxIndex();
      updateCarousel();
      resetAutoPlay();
    });

    nextBtn.addEventListener("click", function () {
      currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
      updateCarousel();
      resetAutoPlay();
    });

    function autoPlay() {
      autoPlayTimer = setInterval(function () {
        currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
        updateCarousel();
      }, 5000);
    }

    function resetAutoPlay() {
      clearInterval(autoPlayTimer);
      autoPlay();
    }

    // Touch/Swipe support
    var touchStartX = 0;
    var touchEndX = 0;

    track.addEventListener("touchstart", function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener("touchend", function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swipe left → next
          currentIndex = currentIndex < getMaxIndex() ? currentIndex + 1 : 0;
        } else {
          // Swipe right → prev
          currentIndex = currentIndex > 0 ? currentIndex - 1 : getMaxIndex();
        }
        updateCarousel();
        resetAutoPlay();
      }
    }, { passive: true });

    // Handle window resize
    window.addEventListener("resize", function () {
      if (currentIndex > getMaxIndex()) currentIndex = getMaxIndex();
      updateCarousel();
    });

    updateCarousel();
    autoPlay();
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
    initEnquiryForm();
    initContactForm();
    initLightbox();
    initReviewCarousel();
    initScrollReveal();
    initLazyLoading();
    initMobileMenu();
    initImageErrorHandling();
    initActiveNavHighlight();
  });
})();
