/* ===================================================
   Under Construction — Rainbow Preschool
   JavaScript: Countdown · Reveal · Notify · Stars
   =================================================== */

(function () {
  'use strict';

  /* ---- Helpers ---- */
  function $(id) { return document.getElementById(id); }
  function pad(n) { return String(n).padStart(2, '0'); }

  /* ---- Calculate next Saturday at 00:00:00 local time ---- */
  function getNextSaturday() {
    const now  = new Date();
    const day  = now.getDay(); // 0=Sun … 6=Sat
    // Days until next Saturday (if today IS Saturday, go +7)
    const daysUntil = day === 6 ? 7 : (6 - day);
    const target = new Date(now);
    target.setDate(now.getDate() + daysUntil);
    target.setHours(0, 0, 0, 0);   // midnight local time
    return target;
  }

  /* ---- DOM refs ---- */
  const overlay    = $('uc-overlay');
  const mainContent = $('main-content');
  const daysEl     = $('uc-days');
  const hoursEl    = $('uc-hours');
  const minsEl     = $('uc-mins');
  const secsEl     = $('uc-secs');


  if (!overlay || !mainContent) return; // Safety guard

  /* ---- Countdown ---- */
  let target = getNextSaturday();

  function updateCountdown() {
    const now  = Date.now();
    let diff   = target.getTime() - now;

    if (diff <= 0) {
      // Time's up — reveal the site
      revealSite();
      return;
    }

    const totalSecs = Math.floor(diff / 1000);
    const days  = Math.floor(totalSecs / 86400);
    const hours = Math.floor((totalSecs % 86400) / 3600);
    const mins  = Math.floor((totalSecs % 3600)  / 60);
    const secs  = totalSecs % 60;

    // Update DOM
    if (daysEl)  daysEl.textContent  = pad(days);
    if (hoursEl) hoursEl.textContent = pad(hours);
    if (minsEl)  minsEl.textContent  = pad(mins);

    // Tick animation for seconds
    if (secsEl) {
      secsEl.textContent = pad(secs);
      secsEl.classList.remove('tick');
      // Force reflow so animation replays
      void secsEl.offsetWidth;
      secsEl.classList.add('tick');
      setTimeout(() => secsEl.classList.remove('tick'), 150);
    }
  }

  // Run immediately then every second
  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);

  /* ---- Reveal the actual homepage ---- */
  function revealSite() {
    clearInterval(countdownInterval);
    overlay.classList.add('hidden');
    mainContent.classList.add('revealed');

    // Re-enable scrolling & interaction
    document.body.style.overflow = '';

    // Clean up decorative elements after transition
    setTimeout(() => {
      overlay.style.display = 'none';
      // Remove clouds container too
      const clouds = document.getElementById('uc-clouds');
      if (clouds) clouds.style.display = 'none';
    }, 900);
  }

  /* ---- Disable background scroll while overlay is shown ---- */
  document.body.style.overflow = 'hidden';



  /* ---- Spawn Twinkling Stars ---- */
  function spawnStars(count) {
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'uc-star';
      star.style.top    = Math.random() * 100 + 'vh';
      star.style.left   = Math.random() * 100 + 'vw';
      star.style.width  = (Math.random() * 4 + 2) + 'px';
      star.style.height = star.style.width;
      star.style.animationDuration  = (Math.random() * 3 + 1.5) + 's';
      star.style.animationDelay     = (Math.random() * 4) + 's';
      star.style.animationIterationCount = 'infinite';
      document.body.appendChild(star);
    }
  }

  spawnStars(35);

})();
