/**
 * Rainbow Preschool – Dynamic Content Loader
 * Loads programs, announcements, reviews & website content from the backend API.
 */
(function () {
  'use strict';

  const COLORS = ['bg-primary-container','bg-secondary-container','bg-tertiary-container','bg-surface-container-high'];

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
      if (!res.success || !res.data.length) {
        grid.innerHTML = '<div class="col-span-3 text-center py-12 text-on-surface-variant opacity-60">No programs listed yet.</div>';
        return;
      }
      grid.innerHTML = res.data.map((p, i) => `
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
            <p class="text-xs opacity-50 mt-1">${new Date(a.date).toLocaleDateString('en-IN', {day:'numeric',month:'short',year:'numeric'})}</p>
          </div>
        </div>`).join('');
    } catch { list.innerHTML = ''; }
  }

  // ── Reviews carousel (dynamic) ─────────────────────────────────
  async function loadReviews() {
    const track = document.getElementById('reviews-track');
    if (!track) return;
    try {
      const res = await fetchApprovedReviews();
      if (!res.success || !res.data.length) {
        track.innerHTML = '<div class="review-card"><div class="bg-surface-container-low p-10 rounded-xl h-full flex items-center justify-center opacity-60">No approved reviews yet. Be the first!</div></div>';
        return;
      }
      const colors = ['bg-orange-200','bg-blue-200','bg-pink-200','bg-green-200','bg-purple-200'];
      track.innerHTML = res.data.map((r, i) => `
        <div class="review-card">
          <div class="bg-surface-container-low p-10 rounded-xl relative h-full">
            <div class="flex gap-1 mb-6 text-orange-500">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
            <p class="text-lg italic mb-8 leading-relaxed">"${r.reviewText}"</p>
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-full ${colors[i % colors.length]} flex items-center justify-center font-bold text-lg">${r.parentName.charAt(0)}</div>
              <div><h4 class="font-bold">${r.parentName}</h4></div>
            </div>
          </div>
        </div>`).join('');
      // re-init carousel after DOM update
      if (typeof initReviewCarousel === 'function') initReviewCarousel();
    } catch { /* keep placeholder */ }
  }

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

      const name    = document.getElementById('reg-name');
      const age     = document.getElementById('reg-age');
      const phone   = document.getElementById('reg-phone');
      const inquiry = document.getElementById('reg-inquiry');
      const message = document.getElementById('reg-message');
      const btn     = document.getElementById('reg-submit');

      let valid = true;
      const showErr = (inp) => { inp.parentElement.querySelector('.form-error-msg')?.classList.add('visible'); valid = false; };
      if (!name.value.trim())                    showErr(name);
      if (!age.value.trim())                     showErr(age);
      if (phone.value.replace(/\D/g,'').length < 10) showErr(phone);
      if (!message.value.trim())                 showErr(message);
      if (!valid) { showLocalToast('Please fix the errors in the form.'); return; }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      try {
        const res = await submitRegistration({
          parentName: name.value.trim(), childAge: age.value.trim(),
          phone: phone.value.trim(), inquiryType: inquiry.value, message: message.value.trim()
        });
        if (res.success) {
          showLocalToast('Registration submitted! We will contact you soon.', 'success');
          form.reset();
        } else {
          showLocalToast(res.message || 'Submission failed.');
        }
      } catch {
        showLocalToast('Network error. Please try again.');
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

    stars.forEach(star => {
      star.addEventListener('mouseover', () => { const v = +star.dataset.v; stars.forEach(s => { s.textContent = +s.dataset.v <= v ? '★' : '☆'; }); });
      star.addEventListener('mouseout',  () => { const v = +ratingInput.value; stars.forEach(s => { s.textContent = +s.dataset.v <= v ? '★' : '☆'; }); });
      star.addEventListener('click',     () => { ratingInput.value = star.dataset.v; });
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = document.getElementById('rv-name').value.trim();
      const rating = +ratingInput.value;
      const text = document.getElementById('rv-text').value.trim();
      if (!name || !text || rating < 1) { showLocalToast('Please fill all fields and select a rating.'); return; }
      try {
        const res = await submitReview({ parentName: name, rating, reviewText: text });
        if (res.success) {
          showLocalToast('Review submitted successfully!', 'success');
          form.reset(); ratingInput.value = 0; stars.forEach(s => s.textContent = '☆');
        } else {
          showLocalToast(res.message || 'Could not submit review.');
        }
      } catch {
        showLocalToast('Network error. Please try again.');
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

      btn.disabled = true;
      btn.textContent = 'Sending...';
      try {
        const res = await submitContact({ name, email, message });
        if (res.success) {
          if (res.emailStatus && res.emailStatus !== 'Sent successfully') {
            alert('Data saved, but email failed to send: ' + res.emailStatus);
          } else {
            showLocalToast('Message sent successfully!', 'success');
          }
          form.reset();
        } else {
          showLocalToast(res.message || 'Failed to send message.');
        }
      } catch {
        showLocalToast('Network error. Please try again.');
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
  });
})();
