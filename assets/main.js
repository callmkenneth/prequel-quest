/* Prequel Quest — prequel.quest */
(() => {
  /* ---------------------------------------------------------------
     Email sign-up endpoint.
     Paste your provider's form URL here (Buttondown, ConvertKit,
     Mailchimp, Formspree, etc.). While it's empty, the form validates
     the address but tells the visitor sign-ups aren't open yet.
     --------------------------------------------------------------- */
  const SIGNUP_ENDPOINT = '';

  /* ---------- hero word: uncover → discover → share (plays once, rests on "share") ---------- */
  const cycle = document.querySelector('.word-cycle');
  if (cycle) {
    const words = cycle.dataset.words.split(' ');
    const els = words.map((w, n) => {
      const el = document.createElement('span');
      el.className = 'word';
      [...w].forEach((c, i) => {
        const ch = document.createElement('span');
        ch.className = 'ch';
        ch.style.setProperty('--i', i);
        ch.textContent = c;
        el.append(ch);
      });
      return el;
    });
    cycle.replaceChildren(...els);

    /* Loops forever: each word smokes in, rests, then smokes out while the next forms. */
    const HOLD = 1800;      // how long each word rests before turning to smoke
    const OVERLAP = 350;    // next word starts forming while the last one drifts away
    const inDur  = el => 1150 + 75 * (el.childElementCount - 1);
    const outDur = el => 900 + 55 * (el.childElementCount - 1);

    let cur = 0, timers = [], running = false;
    const later = (fn, ms) => timers.push(setTimeout(fn, ms));
    const clearTimers = () => { timers.forEach(clearTimeout); timers = []; };

    function step() {
      const prev = els[cur];
      const nextIndex = (cur + 1) % els.length;
      const next = els[nextIndex];
      prev.classList.remove('is-in', 'is-shown');
      prev.classList.add('is-out');
      later(() => { next.classList.remove('is-out', 'is-shown'); next.classList.add('is-in'); cur = nextIndex; }, OVERLAP);
      later(() => prev.classList.remove('is-out'), outDur(prev));
      later(step, OVERLAP + inDur(next) + HOLD);
    }

    function run(firstTime) {
      if (running) return;
      running = true;
      if (firstTime) { els[0].classList.add('is-in'); later(step, inDur(els[0]) + HOLD); }
      else later(step, 900);
    }

    // Freeze on a fully formed word (no half-blurred letters).
    function halt() {
      running = false;
      clearTimers();
      cycle.getAnimations({ subtree: true }).forEach(a => a.cancel());
      els.forEach((el, i) => { el.className = i === cur ? 'word is-shown' : 'word'; });
    }


    // Don't animate in a background tab; pick up again when the visitor returns.
    let started = false;
    function onVisibility() {
      if (document.visibilityState !== 'visible') { if (running) halt(); return; }
      if (!started) { started = true; setTimeout(() => run(true), 300); }
      else run(false);
    }
    document.addEventListener('visibilitychange', onVisibility);
    onVisibility();
  }

  /* ---------- mobile / tablet menu ---------- */
  const menu = document.getElementById('menu');
  const openBtn = document.querySelector('.menu-toggle');
  const closeBtn = menu?.querySelector('.menu-close');
  let lastFocus = null;

  const focusables = () =>
    [...menu.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.offsetParent !== null);

  function openMenu() {
    lastFocus = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('menu-open');
    openBtn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.hidden) return;
    menu.hidden = true;
    document.body.classList.remove('menu-open');
    openBtn.setAttribute('aria-expanded', 'false');
    if (restoreFocus) (lastFocus && lastFocus !== document.body ? lastFocus : openBtn).focus();
  }

  if (menu && openBtn && closeBtn) {
    openBtn.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', () => closeMenu());

    menu.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    menu.querySelectorAll('a[href^="#"]').forEach(a =>
      a.addEventListener('click', () => closeMenu({ restoreFocus: false }))
    );

    // Desktop layout has no menu — close it if the window grows past the breakpoint.
    window.matchMedia('(min-width: 1200px)').addEventListener('change', e => {
      if (e.matches) closeMenu({ restoreFocus: false });
    });
  }

  /* ---------- every "Get Updates"-style CTA lands on the email field ---------- */
  const email = document.getElementById('email');
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href="#updates"]');
    if (!link || !email) return;
    // Let the browser scroll, then move keyboard focus to the input.
    setTimeout(() => email.focus({ preventScroll: true }), 450);
  });

  /* ---------- postcard sign-up ---------- */
  const form = document.getElementById('signup-form');
  const status = document.getElementById('signup-status');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(msg, kind) {
    status.textContent = msg;
    status.className = 'postcard__status' + (kind ? ` is-${kind}` : '');
  }

  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const value = email.value.trim();

    if (!EMAIL_RE.test(value)) {
      email.setAttribute('aria-invalid', 'true');
      say('Please enter a valid email address.', 'error');
      email.focus();
      return;
    }
    email.removeAttribute('aria-invalid');

    if (!SIGNUP_ENDPOINT) {
      say('Thanks! Sign-ups open very soon.', 'ok');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    say('Sending…');
    try {
      const res = await fetch(SIGNUP_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      say('You’re on the list. Watch your inbox!', 'ok');
    } catch {
      say('That didn’t send. Please try again.', 'error');
    } finally {
      btn.disabled = false;
    }
  });

  email?.addEventListener('input', () => {
    if (email.getAttribute('aria-invalid') === 'true' && EMAIL_RE.test(email.value.trim())) {
      email.removeAttribute('aria-invalid');
      say('');
    }
  });
})();
