/**
 * Rainbow Preschool – Dynamic Content Loader
 * Loads programs, announcements, reviews & website content from the backend API.
 */
(function () {
  'use strict';

  const COLORS = ['bg-primary-container', 'bg-secondary-container', 'bg-tertiary-container', 'bg-surface-container-high'];

  function showLocalToast(message, type = 'error') {
    const container = document.getElementById("toast-container");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.innerHTML = '<span class="material-symbols-outlined" style="font-size:1.2rem">' + (type === "success" ? "check_circle" : "error") + "</span>" + message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  // ── Programs ───────────────────────────────────────────────────
  async function loadPrograms() {
    const grid = document.getElementById('programs-grid');
    if (!grid) return;
    try {
      const res = await fetchPrograms();
      const programs = res && res.success && res.data ? res.data : [];

      if (!programs.length) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-on-surface-variant opacity-60">No programs listed yet.</div>';
        return;
      }
      grid.innerHTML = programs.map((p, i) => `
        <div class="${COLORS[i % COLORS.length]} p-8 rounded-xl hover:scale-[1.02] transition-all duration-300 shadow-sm">
          ${p.image ? `<img src="${p.image}" alt="${p.title}" class="w-full h-40 object-cover rounded-lg mb-5" loading="lazy" />` : ''}
          <span class="text-xs font-bold uppercase tracking-widest opacity-60">${p.ageGroup}</span>
          <h3 class="text-xl font-bold mt-2 mb-3">${p.title}</h3>
          <p class="text-sm leading-relaxed opacity-80">${p.description}</p>
        </div>`).join('');
    } catch {
      grid.innerHTML = '<div class="col-span-3 text-center py-12 text-red-500">Could not load programs.</div>';
    }
  }


  // ── Announcements ──────────────────────────────────────────────
  async function loadAnnouncements() {
    const list = document.getElementById('announcements-list');
    if (!list) return;
    try {
      const res = await fetchAnnouncements();
      if (!res.success || !res.data.length) { list.innerHTML = ''; return; }
      list.innerHTML = `
        <h2 class="font-headline text-2xl font-bold mb-4">📢 Announcements</h2>` +
        res.data.map(a => `
        <div class="flex items-start gap-4 bg-secondary-container p-5 rounded-xl">
          <span class="material-symbols-outlined text-secondary mt-1">campaign</span>
          <div>
            <p class="font-bold">${a.title}</p>
            <p class="text-sm opacity-70">${a.description}</p>
            <p class="text-xs opacity-50 mt-1">${new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
          </div>
        </div>`).join('');
    } catch { list.innerHTML = ''; }
  }

  // ── Reviews carousel (dynamic) ─────────────────────────────────
  async function loadReviews() {
    const track = document.getElementById('reviews-track');
    if (!track) return;
    try {
      let res = null;
      try { res = await fetchApprovedReviews(); } catch (e) { console.warn('Failed fetching API reviews.'); }

      let reviews = [];
      if (res && res.success && res.data && res.data.length) {
        reviews = res.data;
      }

      // Store full texts in a global array so the toggle function can access them safely
      window._reviewTexts = reviews.map(r => r.reviewText);

      const LIMIT = 100;
      const colors = ['bg-orange-200', 'bg-blue-200', 'bg-pink-200', 'bg-green-200', 'bg-purple-200'];

      track.innerHTML = reviews.map((r, i) => {
        const isLong = r.reviewText.length > LIMIT;
        const shortText = isLong ? r.reviewText.substring(0, LIMIT) + '...' : r.reviewText;
        return `
        <div class="review-card">
          <div class="bg-surface-container-low p-8 rounded-xl relative flex flex-col min-h-[380px]">
            <div class="flex gap-1 mb-4 text-orange-500">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <div class="flex-1 flex flex-col">
              <p id="rv-text-${i}" class="text-lg italic mb-2 leading-relaxed">"${shortText}"</p>
              ${isLong
            ? `<button class="text-primary font-bold text-sm mb-4 mt-2 hover:underline self-start" onclick="toggleReviewText(this, ${i}, ${LIMIT})">Read more</button>`
            : '<div class="mb-4 mt-2"></div>'
          }
            </div>
            <div class="flex items-center gap-4 mt-auto">
              <div class="w-12 h-12 rounded-full ${colors[i % colors.length]} flex items-center justify-center font-bold text-lg">${r.parentName.charAt(0)}</div>
              <div><h4 class="font-bold">${r.parentName}</h4></div>
            </div>
          </div>
        </div>`;
      }).join('');

      // re-init carousel after DOM update
      if (typeof initReviewCarousel === 'function') initReviewCarousel();
    } catch (e) { console.error('Error loading reviews:', e); }
  }

  // Global toggle function for review "Read more / Show less"
  window.toggleReviewText = function (btn, index, limit) {
    const p = document.getElementById('rv-text-' + index);
    if (!p) return;
    const fullText = window._reviewTexts[index];
    if (btn.textContent === 'Read more') {
      p.textContent = '"' + fullText + '"';
      btn.textContent = 'Show less';
    } else {
      p.textContent = '"' + fullText.substring(0, limit) + '..."';
      btn.textContent = 'Read more';
    }
  };

  // ── Website Content ────────────────────────────────────────────
  async function loadContent() {
    try {
      const res = await fetchContent();
      if (!res.success) return;
      const c = res.data;
      const q = (sel) => document.querySelector(sel);

      // About text (2 paragraphs in about section)
      const aboutPs = document.querySelectorAll('#about p.text-lg');
      if (aboutPs.length && c.aboutText) aboutPs[0].textContent = c.aboutText;

      // Contact info
      const addrEl = q('#contact [data-field="address"]') || q('#contact .text-on-surface-variant');
      if (addrEl && c.address) addrEl.textContent = c.address;

      // Phone
      document.querySelectorAll('[data-field="phone"]').forEach(el => { el.textContent = c.phoneNumber; });
      // Email
      document.querySelectorAll('[data-field="email"]').forEach(el => { el.textContent = c.contactEmail; });
      // Timings footer
      const timingEl = q('[data-field="timings"]');
      if (timingEl && c.schoolTimings) timingEl.textContent = c.schoolTimings;
    } catch { /* non-critical */ }
  }

  // ── Registration form (API) ────────────────────────────────────
  function initRegistrationForm() {
    const form = document.getElementById('enquiry-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.querySelectorAll('.form-error-msg').forEach(el => el.classList.remove('visible'));

      const name = document.getElementById('reg-name');
      const age = document.getElementById('reg-age');
      const phone = document.getElementById('reg-phone');
      const email = document.getElementById('reg-email');
      const inquiry = document.getElementById('reg-inquiry');
      const message = document.getElementById('reg-message');
      const btn = document.getElementById('reg-submit');

      const captcha = document.getElementById('reg-captcha');

      let valid = true;
      const showErr = (inp) => { inp.parentElement.querySelector('.form-error-msg')?.classList.add('visible'); valid = false; };
      if (!name.value.trim()) showErr(name);
      if (!age.value.trim()) showErr(age);
      if (phone.value.replace(/\D/g, '').length < 10) showErr(phone);

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.value.trim())) showErr(email);

      if (!message.value.trim()) showErr(message);
      
      if (!captcha.checked) {
        showLocalToast('Please verify that you are not a robot.');
        valid = false;
      }

      if (!valid) { 
        if (captcha && !captcha.checked) {
          captcha.parentElement.classList.add('animate-pulse');
          setTimeout(() => captcha.parentElement.classList.remove('animate-pulse'), 1000);
        }
        return; 
      }

      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        // Step 1: Save to local database
        const dbRes = await submitRegistration({
          parentName: name.value.trim(),
          childAge: age.value.trim(),
          phone: phone.value.trim(),
          email: email.value.trim(),
          inquiryType: inquiry.value,
          message: message.value.trim()
        });

        if (dbRes.success) {
          showLocalToast('Registration submitted! A confirmation email has been sent to you.', 'success');
          form.reset();
        } else {
          showLocalToast(dbRes.message || dbRes.error || 'Registration failed.', 'error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        showLocalToast(err.message || 'An error occurred. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Send Message';
      }
    });
  }

  // ── Review form ────────────────────────────────────────────────
  function initReviewForm() {
    const form = document.getElementById('review-form');
    const stars = document.querySelectorAll('.star-btn');
    const ratingInput = document.getElementById('rv-rating');
    if (!form) return;

    // Handle star rating clicks
    stars.forEach(star => {
      star.addEventListener('mouseover', () => {
        const v = +star.dataset.v;
        stars.forEach(s => { s.textContent = +s.dataset.v <= v ? '★' : '☆'; });
      });
      star.addEventListener('mouseout', () => {
        const v = +ratingInput.value;
        stars.forEach(s => { s.textContent = +s.dataset.v <= v ? '★' : '☆'; });
      });
      star.addEventListener('click', () => {
        ratingInput.value = star.dataset.v;
      });
    });

    // Handle form submission
    form.addEventListener('submit', async function (event) {
      // 1. Prevent default submission
      event.preventDefault();

      // 2. Capture form data
      const formData = {
        parentName: document.getElementById('rv-name').value.trim(),
        email: document.getElementById('rv-email').value.trim(),
        rating: Number(ratingInput.value),
        reviewText: document.getElementById('rv-text').value.trim()
      };

      // Validation
      if (!formData.parentName || !formData.email || !formData.reviewText || formData.rating < 1) {
        showLocalToast('Please fill all fields and provide a star rating.');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      const originalBtnText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';

      try {
        // 3. Send captured data to the backend API using POST /api/reviews
        const response = await submitReview(formData);

        if (response.success) {
          // 4. On successful response: Show success message and reset form
          showLocalToast('Review submitted successfully!', 'success');
          form.reset();
          ratingInput.value = 0;
          stars.forEach(s => s.textContent = '☆');
          if (document.getElementById('rv-char-count')) {
            document.getElementById('rv-char-count').textContent = '100 characters left';
          }

          // 5. Immediately update the UI without page reload by re-fetching
          await loadReviews();
        } else {
          // 7. Handle errors from API
          showLocalToast(response.message || 'Submission failed. Please try again.', 'error');
        }
      } catch (error) {
        // 7. Handle network errors
        console.error('API Error:', error);
        showLocalToast('Could not connect to the server. Please try again later.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    });
  }

  // ── Contact form ───────────────────────────────────────────────
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      const name = form.querySelector('input[name="name"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();
      const message = form.querySelector('textarea[name="message"]').value.trim();

      if (!name || !email || !message) {
        showLocalToast('Please fill out all contact fields.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showLocalToast('Please enter a valid email address.');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Sending...';

      try {
        // Step 1: Save to local database
        const dbRes = await submitContact({ name, email, message });

        if (dbRes.success) {
          showLocalToast('Message sent successfully! Check your email for confirmation.', 'success');
          form.reset();
        } else {
          showLocalToast(dbRes.message || dbRes.error || 'Message failed.', 'error');
        }
      } catch (err) {
        console.error('Submission error:', err);
        showLocalToast(err.message || 'An error occurred. Please try again.', 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = 'Submit Form';
      }
    });
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    loadPrograms();
    loadAnnouncements();
    loadReviews();
    loadContent();
    initRegistrationForm();
    initReviewForm();
    initContactForm();
    initGallery();
  });

  async function initGallery() {
    const grid = document.getElementById('gallery-grid');
    if (!grid) return;

    try {
      const res = await fetchGallery();
      if (res.success && res.data.length > 0) {
        grid.innerHTML = '';
        res.data.forEach((img, index) => {
          const div = document.createElement('div');

          // Pattern logic: 
          // index % 4 == 0 -> col-span-2 row-span-2
          // index % 4 == 1 or 2 -> standard
          // index % 4 == 3 -> col-span-2

          let classes = 'rounded-xl overflow-hidden group shadow-md';
          if (index % 4 === 0) {
            classes += ' col-span-2 row-span-2 h-[400px] md:h-[528px]';
          } else if (index % 4 === 3) {
            classes += ' col-span-2 h-48 md:h-64';
          } else {
            classes += ' h-48 md:h-64';
          }

          const isLocal = img.imageUrl.startsWith('/uploads');
          const imageBase = (typeof RENDER_API !== 'undefined') ? RENDER_API.replace('/api', '') : API_BASE.replace('/api', '');
          const finalUrl = isLocal ? `${imageBase}${img.imageUrl}` : img.imageUrl;

          div.className = classes;
          div.innerHTML = `
            <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 block cursor-pointer"
              src="${finalUrl}"
              alt="${img.altText || 'Preschool Gallery'}"
              onclick="openGalleryModal('${finalUrl}')"
              onerror="this.src='https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800'; this.onerror=null;" />
          `;
          grid.appendChild(div);
        });
      }
    } catch (err) {
      console.error('Failed to load gallery:', err);
    }
  }

  // ── Modal Logic ──────────────────────────────────────────────
  window.openGalleryModal = function (url) {
    const modal = document.getElementById('gallery-modal');
    const img = document.getElementById('modal-img');
    if (!modal || !img) return;

    img.src = url;
    modal.classList.remove('hidden');
    setTimeout(() => { img.classList.remove('scale-95'); img.classList.add('scale-100'); }, 10);
    document.body.style.overflow = 'hidden'; // Prevent scroll
  };

  function closeGalleryModal() {
    const modal = document.getElementById('gallery-modal');
    const img = document.getElementById('modal-img');
    if (!modal || !img) return;

    img.classList.add('scale-95');
    img.classList.remove('scale-100');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 200);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('gallery-modal');
    const closeBtn = document.getElementById('modal-close');
    if (modal) {
      modal.addEventListener('click', (e) => { if (e.target === modal) closeGalleryModal(); });
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeGalleryModal);
    }
  });
})();
