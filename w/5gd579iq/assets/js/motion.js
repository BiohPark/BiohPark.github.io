(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const profileName = document.body.dataset.motionProfile || 'regency';
  const profile = window.INVITATION_MOTION_PROFILES?.[profileName];

  function initProgress() {
    const bar = document.querySelector('[data-scroll-progress]');
    if (!bar) return;
    let queued = false;
    const update = () => {
      const range = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${range > 0 ? Math.min(1, window.scrollY / range) : 0})`;
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if (!queued) requestAnimationFrame(update);
      queued = true;
    }, { passive: true });
    update();
  }

  function initHeroMotion() {
    const hero = document.querySelector('[data-section="hero"]');
    const media = hero?.querySelector('[data-parallax]');
    if (!hero || !media || !profile) return;
    media.style.setProperty('--ken-burns-scale', profile.kenBurnsScale);
    media.style.setProperty('--ken-burns-origin', profile.kenBurnsOrigin);
    let active = false;
    let queued = false;
    const render = () => {
      const offset = Math.max(-40, Math.min(40, window.scrollY * profile.parallaxDepth));
      media.style.setProperty('--parallax-y', `${offset}px`);
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if (!active || queued) return;
      queued = true;
      requestAnimationFrame(render);
    }, { passive: true });
    new IntersectionObserver(([entry]) => {
      active = entry.isIntersecting;
      media.style.willChange = active ? 'transform' : '';
      if (active) {
        media.classList.add('is-ken-burns');
        render();
      }
    }, { threshold: 0.2 }).observe(hero);
  }

  function splitTitle(node) {
    const original = node.textContent.trim();
    const units = /[가-힣]/.test(original) ? original.split(/(\s+)/) : [...original];
    node.textContent = '';
    node.setAttribute('aria-label', original);
    const unitDelay = Math.min(34, 400 / Math.max(1, units.length - 1));
    units.forEach((unit, index) => {
      const span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.className = 'title-unit';
      span.style.setProperty('--unit-delay', `${unitDelay * index}ms`);
      span.textContent = unit;
      node.append(span);
    });
  }

  function initTitleReveals() {
    const titles = [...document.querySelectorAll('[data-letter-reveal]')];
    titles.forEach(splitTitle);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const title = entry.target.matches('[data-letter-reveal]')
          ? entry.target
          : entry.target.querySelector('[data-letter-reveal]');
        title?.classList.add('is-title-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0 });
    titles.forEach((title) => {
      const trigger = title.closest('[data-mask]') || title;
      observer.observe(trigger);
    });
  }

  function initMasks() {
    if (!profile) return;
    const sections = [...document.querySelectorAll('[data-mask]')];
    sections.forEach((section) => {
      const mask = section.querySelector('.mask-inner');
      mask.style.setProperty('--mask-from', profile.maskFrom);
      mask.style.setProperty('--mask-to', profile.maskTo);
    });
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.querySelector('.mask-inner')?.classList.add('is-mask-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.15 });
    sections.forEach((section) => observer.observe(section));
  }

  function initLightbox() {
    const dialog = document.querySelector('[data-lightbox]');
    const image = dialog?.querySelector('img');
    if (!dialog || !image) return;
    const close = () => {
      if (reduced) { dialog.close(); return; }
      dialog.classList.add('is-closing');
      window.setTimeout(() => {
        dialog.close();
        dialog.classList.remove('is-closing');
      }, 160);
    };
    document.querySelectorAll('[data-lightbox-src]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        image.src = trigger.dataset.lightboxSrc;
        image.alt = trigger.querySelector('img')?.alt || '신랑 신부의 웨딩 사진';
        dialog.showModal();
        if (!reduced) requestAnimationFrame(() => dialog.classList.add('is-open'));
      });
    });
    dialog.querySelector('[data-lightbox-close]')?.addEventListener('click', close);
    dialog.addEventListener('cancel', (event) => { event.preventDefault(); close(); });
    dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
    dialog.addEventListener('close', () => dialog.classList.remove('is-open'));
  }

  initProgress();
  initLightbox();
  if (reduced) return;
  try {
    initHeroMotion();
    initTitleReveals();
    initMasks();
    document.documentElement.classList.add('motion-ready');
  } catch (error) {
    document.documentElement.classList.remove('motion-ready');
    console.error('Invitation motion initialization failed.', error);
  }
}());
