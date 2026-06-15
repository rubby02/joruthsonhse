/* ============================================================
   JORUTHSON HSE TRAINING & CONSULTANCY
   main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll behaviour ─────────────────────────── */
  const nav = document.getElementById('mainNav');
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 60);
    // Back-to-top
    document.getElementById('backToTop').classList.toggle('show', window.scrollY > 400);
    // Active nav links
    highlightNav();
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── Active nav link on scroll ───────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  const highlightNav = () => {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 120) current = s.id;
    });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  };

  /* ── Smooth anchor scroll ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 8;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      // Close mobile nav
      const collapse = document.getElementById('navbarMain');
      if (collapse?.classList.contains('show')) {
        document.querySelector('.navbar-toggler')?.click();
      }
    });
  });

  /* ── Scroll Reveal (IntersectionObserver) ────────────── */
  const revealEls = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealObs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -36px 0px' });
  revealEls.forEach(el => revealObs.observe(el));

  /* ── Animated counters ───────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el     = e.target;
      const end    = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const dur    = 1800;
      const step   = Math.max(1, Math.ceil(end / (dur / 16)));
      let cur = 0;
      const tick = setInterval(() => {
        cur = Math.min(cur + step, end);
        el.textContent = cur + suffix;
        if (cur >= end) clearInterval(tick);
      }, 16);
      counterObs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(el => counterObs.observe(el));

  /* ── Back-to-top ─────────────────────────────────────── */
  document.getElementById('backToTop')
    ?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ── Enroll form ─────────────────────────────────────── */
  const form = document.getElementById('enrollForm');
  const submitBtn = form?.querySelector('.btn-form-submit');
  const originalBtnHtml = submitBtn?.innerHTML;

  const showToast = (message, type = 'success') => {
    const isSuccess = type === 'success';

    if (window.Toastify) {
      Toastify({
        text: message,
        duration: 3000,
        close: false,
        gravity: 'top',
        position: 'right',
        stopOnFocus: true,
        style: {
          background: isSuccess ? 'var(--green-800)' : '#b42318',
          color: '#fff',
          borderRadius: '6px',
          boxShadow: 'var(--shadow-md)',
          fontFamily: 'var(--font-body)'
        }
      }).showToast();
      return;
    }

    const fallbackToast = document.createElement('div');
    fallbackToast.textContent = message;
    fallbackToast.setAttribute('role', 'status');
    fallbackToast.style.cssText = `
      position: fixed;
      top: 18px;
      right: 18px;
      z-index: 9999;
      max-width: min(360px, calc(100vw - 36px));
      border-radius: 6px;
      background: ${isSuccess ? '#155730' : '#b42318'};
      color: #fff;
      box-shadow: 0 8px 32px rgba(7, 31, 14, 0.14);
      font-family: var(--font-body);
    `;
    document.body.appendChild(fallbackToast);
    setTimeout(() => fallbackToast.remove(), 3000);
  };

  const syncSubmitState = () => {
    if (!form || !submitBtn) return;
    submitBtn.disabled = !form.checkValidity();
  };

  const setSubmitLoading = isLoading => {
    if (!form || !submitBtn) return;
    submitBtn.disabled = isLoading || !form.checkValidity();
    submitBtn.classList.toggle('is-loading', isLoading);
    submitBtn.innerHTML = isLoading
      ? '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span><span>Sending Request...</span>'
      : originalBtnHtml;
  };

  if (form && submitBtn) {
    syncSubmitState();

    form.querySelectorAll('input, select, textarea').forEach(field => {
      field.addEventListener('input', syncSubmitState);
      field.addEventListener('change', syncSubmitState);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        syncSubmitState();
        showToast('Please complete all required fields before submitting.', 'error');
        return;
      }

      const firstName = document.getElementById('firstName')?.value.trim() || '';
      const lastName = document.getElementById('lastName')?.value.trim() || '';
      const fullName = document.getElementById('fullName');
      if (fullName) fullName.value = `${firstName} ${lastName}`.trim();

      if (!window.emailjs?.sendForm) {
        showToast('Unable to send right now. Please refresh and try again.', 'error');
        return;
      }

      setSubmitLoading(true);

      emailjs.sendForm('service_0co7a4f', 'template_t6q81bn', form)
        .then(() => {
          showToast(`Enrollment submitted successfully. We'll contact you shortly.`, 'success' );
          form.reset();
          form.classList.remove('was-validated');
          setSubmitLoading(false);
          syncSubmitState();
        })
        .catch(error => {
          console.error('EmailJS enrollment error:', error);
          showToast('Failed to send your enrollment request. Please try again.', 'error');
          setSubmitLoading(false);
        });
    });
  }

});
