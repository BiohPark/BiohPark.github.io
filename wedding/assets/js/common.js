(function () {
  const data = window.INVITATION_DATA || {};
  const core = window.InvitationCore;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const concept = document.body.dataset.concept || 'regency';
  let countdownTimer = 0;

  function get(path) {
    if (String(path).startsWith('copy.')) return core.getAtPath(data, `concepts.${concept}.${String(path).slice(5)}`);
    return core.getAtPath(data, path);
  }

  function hydrateFields() {
    document.querySelectorAll('[data-field]').forEach((node) => {
      const value = get(node.dataset.field);
      if (value !== undefined) node.textContent = value;
    });
    document.querySelectorAll('[data-tel-field]').forEach((node) => {
      const value = get(node.dataset.telField);
      if (value !== undefined) node.setAttribute('href', `tel:${String(value).replace(/[^0-9+]/g, '')}`);
    });
    document.querySelectorAll('[data-href-field]').forEach((node) => {
      const value = get(node.dataset.hrefField);
      if (value) node.setAttribute('href', value);
    });
  }

  function initOpenings() {
    const opening = document.querySelector('[data-opening]');
    if (!opening) return;
    const main = document.querySelector('main');
    const backLink = document.querySelector('.back-link');
    if (concept !== 'midnight') {
      const trigger = opening.querySelector('[data-open-trigger]');
      main.inert = true;
      if (backLink) backLink.inert = true;
      document.body.classList.add('opening-active');
      requestAnimationFrame(() => opening.classList.add('is-ready'));
      trigger?.focus({ preventScroll: true });

      const finishManualOpening = () => {
        opening.classList.add('is-dismissed');
        document.body.classList.remove('opening-active');
        main.inert = false;
        if (backLink) backLink.inert = false;
        main.focus({ preventScroll: true });
      };

      trigger?.addEventListener('click', () => {
        document.body.classList.add('invitation-opened');
        if (reduced) {
          finishManualOpening();
          return;
        }
        opening.classList.add('is-opening');
        window.setTimeout(() => opening.classList.add('is-fading'), 600);
        window.setTimeout(finishManualOpening, 1100);
      }, { once: true });
      return;
    }

    const escapeEvents = ['pointerdown', 'touchstart', 'wheel', 'keydown'];
    const timelineTimers = [];
    let watchdogTimer = 0;
    let done = false;
    let escaping = false;
    const openingPhoto = opening.querySelector?.('.ball-opening__photo');
    main.inert = true;
    if (backLink) backLink.inert = true;
    document.body.classList.add('opening-active');

    const finish = () => {
      if (done) return;
      done = true;
      timelineTimers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(watchdogTimer);
      escapeEvents.forEach((eventName) => window.removeEventListener(eventName, escapeOpening));
      openingPhoto?.style.setProperty('will-change', 'auto');
      opening.classList.add('is-dismissed');
      document.body.classList.add('invitation-opened');
      document.body.classList.remove('opening-active');
      main.inert = false;
      if (backLink) backLink.inert = false;
      main.focus({ preventScroll: true });
    };

    function escapeOpening() {
      if (done || escaping) return;
      escaping = true;
      timelineTimers.forEach((timer) => window.clearTimeout(timer));
      opening.classList.add('is-opening');
      opening.classList.add('is-fading');
      timelineTimers.push(window.setTimeout(finish, 250));
    }

    if (reduced) {
      finish();
      return;
    }

    watchdogTimer = window.setTimeout(finish, 3000);
    escapeEvents.forEach((eventName) => {
      window.addEventListener(eventName, escapeOpening, { once: true, passive: true });
    });
    Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => window.setTimeout(resolve, 800)),
    ]).then(() => {
      if (done) return;
      requestAnimationFrame(() => opening.classList.add('is-ready'));
      timelineTimers.push(window.setTimeout(() => opening.classList.add('is-opening'), 450));
      timelineTimers.push(window.setTimeout(() => opening.classList.add('is-copy-out'), 1150));
      timelineTimers.push(window.setTimeout(() => opening.classList.add('is-fading'), 1400));
      timelineTimers.push(window.setTimeout(finish, 1800));
    }).catch(failOpen);
  }

  function setCountdownValue(node, value) {
    if (node.textContent === value) return;
    if (reduced) {
      node.textContent = value;
      return;
    }
    node.classList.add('is-flipping-out');
    window.setTimeout(() => {
      node.textContent = value;
      node.classList.remove('is-flipping-out');
      node.classList.add('is-flipping-in');
      requestAnimationFrame(() => node.classList.remove('is-flipping-in'));
    }, 180);
  }

  function renderCountdown() {
    const target = new Date(get('event.iso'));
    if (Number.isNaN(target.getTime())) return;
    const remaining = Math.max(0, target.getTime() - Date.now());
    const values = {
      days: String(Math.floor(remaining / 86_400_000)),
      hours: String(Math.floor((remaining % 86_400_000) / 3_600_000)).padStart(2, '0'),
      minutes: String(Math.floor((remaining % 3_600_000) / 60_000)).padStart(2, '0'),
      seconds: String(Math.floor((remaining % 60_000) / 1000)).padStart(2, '0'),
    };
    Object.entries(values).forEach(([unit, value]) => {
      document.querySelectorAll(`[data-countdown="${unit}"]`).forEach((node) => setCountdownValue(node, value));
    });
  }

  function startCountdown() {
    window.clearInterval(countdownTimer);
    renderCountdown();
    countdownTimer = window.setInterval(renderCountdown, 1000);
  }

  function initCountdown() {
    startCountdown();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) window.clearInterval(countdownTimer);
      else startCountdown();
    });
  }

  function initBackLink() {
    const backLink = document.querySelector('.back-link');
    if (!backLink) return;
    let queued = false;
    const update = () => {
      backLink.classList.toggle('is-compact', window.scrollY > 96);
      queued = false;
    };
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  async function copyText(text, trigger, successText = '복사했습니다') {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text);
      else {
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      const original = trigger.textContent;
      trigger.textContent = successText;
      window.setTimeout(() => { trigger.textContent = original; }, 1500);
    } catch {
      window.prompt('아래 내용을 복사해 주세요.', text);
    }
  }

  function initCopyAndShare() {
    document.querySelectorAll('[data-copy-field]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const value = get(trigger.dataset.copyField);
        if (value === undefined) return;
        const success = trigger.dataset.copyField === 'venue.address' ? '주소를 복사했습니다' : '복사했습니다';
        copyText(String(value), trigger, success);
      });
    });
    document.querySelectorAll('[data-share]').forEach((trigger) => {
      trigger.addEventListener('click', async () => {
        const activeData = { ...data, copy: data.concepts?.[concept] || {} };
        const shareData = core.buildShareData(activeData, get('site.url') || window.location.href);
        if (navigator.share) {
          try { await navigator.share(shareData); } catch { return; }
        } else copyText(shareData.url, trigger, '링크를 복사했습니다');
      });
    });
  }

  function formatUtc(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  }

  function escapeIcsText(value) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\r?\n/g, '\\n')
      .replace(/([,;])/g, '\\$1');
  }

  function foldIcsLine(line) {
    const folded = [];
    let segment = '';
    for (const character of line) {
      const prefix = folded.length ? ' ' : '';
      if (new TextEncoder().encode(`${prefix}${segment}${character}`).length > 75) {
        folded.push(`${prefix}${segment}`);
        segment = character;
      } else segment += character;
    }
    folded.push(`${folded.length ? ' ' : ''}${segment}`);
    return folded;
  }

  function initCalendar() {
    document.querySelectorAll('[data-calendar]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const start = new Date(get('event.iso'));
        if (Number.isNaN(start.getTime())) return;
        const end = new Date(start.getTime() + 90 * 60 * 1000);
        const lines = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'CALSCALE:GREGORIAN',
          'PRODID:-//Wedding Invitation//KO',
          'BEGIN:VEVENT',
          `UID:${formatUtc(start)}-${concept}@wedding-invitation.local`,
          `DTSTAMP:${formatUtc(new Date())}`,
          `DTSTART:${formatUtc(start)}`,
          `DTEND:${formatUtc(end)}`,
          `SUMMARY:${escapeIcsText(`${get('couple.korean')} 결혼식`)}`,
          `LOCATION:${escapeIcsText(`${get('venue.name')} ${get('venue.hall')} ${get('venue.address')}`)}`,
          'END:VEVENT',
          'END:VCALENDAR',
        ].flatMap(foldIcsLine);
        const link = document.createElement('a');
        link.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
        link.download = 'wedding-invitation.ics';
        link.click();
      });
    });
  }

  function initOptionalFeatures() {
    document.querySelectorAll('[data-feature="rsvp"]').forEach((region) => {
      if (concept === 'midnight' && get('rsvp.endpoint')) region.closest('section')?.removeAttribute('hidden');
      else if (concept !== 'midnight' && !get('rsvp.endpoint')) region.innerHTML = '<p>참석 여부 회신은 준비 중입니다. 아래 연락처로 말씀해 주셔도 좋습니다.</p>';
    });
    document.querySelectorAll('[data-feature="guestbook"]').forEach((region) => {
      if (concept === 'midnight' && get('guestbook.endpoint')) region.closest('section')?.removeAttribute('hidden');
      else if (concept !== 'midnight' && !get('guestbook.endpoint')) region.innerHTML = '<p>축하 메시지 공간은 곧 열립니다. 그때까지는 신랑·신부에게 직접 전해 주세요.</p>';
    });
  }

  function initMaskWatchdog() {
    if (concept !== 'midnight') return;
    window.setTimeout(() => {
      document.querySelectorAll('.mask-inner:not(.is-mask-visible)')
        .forEach((node) => node.classList.add('is-mask-visible'));
    }, 4000);
  }

  function failOpen() {
    const opening = document.querySelector('[data-opening]');
    const main = document.querySelector('main');
    const backLink = document.querySelector('.back-link');
    document.documentElement.classList.remove('js-loading', 'js-ready');
    document.body.classList.remove('opening-active');
    if (opening) opening.hidden = true;
    if (main) main.inert = false;
    if (backLink) backLink.inert = false;
  }

  function init() {
    try {
      hydrateFields();
      document.documentElement.classList.remove('js-loading');
      document.documentElement.classList.add('js-ready');
      initOpenings();
      initCountdown();
      initBackLink();
      initCopyAndShare();
      initCalendar();
      initOptionalFeatures();
      initMaskWatchdog();
    } catch (error) {
      failOpen();
      console.error('Invitation initialization failed.', error);
    }
  }

  window.InvitationUI = { init, get };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
}());
