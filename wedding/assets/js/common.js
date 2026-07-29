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
    const countdown = document.querySelector('.countdown');
    if (!countdown) return;
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
      window.clearInterval(countdownTimer);
      countdown.classList.add('is-countdown-over');
      const sameDay = new Date().toDateString() === target.toDateString();
      let message = countdown.querySelector('.countdown-message');
      if (!message) {
        message = document.createElement('p');
        message.className = 'countdown-message';
        countdown.append(message);
      }
      message.textContent = sameDay ? '오늘은 저희의 결혼식 날입니다' : '함께해 주셔서 감사했습니다';
      return;
    }
    if (countdown.classList.contains('is-countdown-over')) {
      countdown.classList.remove('is-countdown-over');
      countdown.querySelector('.countdown-message')?.remove();
    }
    const remaining = diff;
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
    if (!document.querySelector('[data-countdown]')) return;
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

  async function writeToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* 권한 거절 — 아래 폴백으로 재시도 */ }
    }
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    try {
      return document.execCommand('copy');
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }

  function flashTriggerLabel(trigger, message) {
    const label = Array.from(trigger.childNodes).find((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
    if (!label) return;
    const original = label.textContent;
    label.textContent = message;
    window.setTimeout(() => { label.textContent = original; }, 1500);
  }

  async function copyText(text, trigger, successText = '복사했습니다', statusText = '계좌번호가 복사되었습니다', failText = '복사하지 못했습니다. 화면의 내용을 길게 눌러 복사해 주세요.') {
    const status = document.querySelector('[data-copy-status]');
    const copied = await writeToClipboard(text);
    flashTriggerLabel(trigger, copied ? successText : '복사 실패');
    if (status) status.textContent = copied ? statusText : failText;
  }

  function initCopyAndShare() {
    document.querySelectorAll('[data-copy-field]').forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const value = get(trigger.dataset.copyField);
        if (value === undefined) return;
        const isAddress = trigger.dataset.copyField === 'venue.address';
        const success = isAddress ? '주소를 복사했습니다' : '복사했습니다';
        const status = isAddress ? '주소가 복사되었습니다' : '계좌번호가 복사되었습니다';
        const fail = isAddress
          ? '주소를 복사하지 못했습니다. 주소를 길게 눌러 복사해 주세요.'
          : '계좌번호를 복사하지 못했습니다. 번호를 길게 눌러 복사해 주세요.';
        copyText(String(value), trigger, success, status, fail);
      });
    });
    document.querySelectorAll('[data-share]').forEach((trigger) => {
      trigger.addEventListener('click', async () => {
        const activeData = { ...data, copy: data.concepts?.[concept] || {} };
        const shareData = core.buildShareData(activeData, get('site.url') || window.location.href);
        if (navigator.share) {
          try { await navigator.share(shareData); } catch { return; }
        } else copyText(shareData.url, trigger, '링크를 복사했습니다', '링크가 복사되었습니다', '링크를 복사하지 못했습니다. 주소창의 주소를 직접 복사해 주세요.');
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
    const ics = document.querySelector('[data-calendar-ics]');
    const google = document.querySelector('[data-calendar-google]');
    if (ics && google && /Android/i.test(navigator.userAgent)) {
      ics.setAttribute('href', google.getAttribute('href'));
      google.setAttribute('href', 'event.ics');
      google.textContent = '.ics 파일 다운로드';
    }
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

  function initTextScale() {
    const trigger = document.querySelector('[data-text-scale]');
    if (!trigger) return;
    let isLarge = false;
    try {
      isLarge = localStorage.getItem('invitation-text-scale') === 'large';
    } catch {}
    const apply = (enabled) => {
      document.documentElement.classList.toggle('is-large-text', enabled);
      trigger.setAttribute('aria-pressed', String(enabled));
    };
    apply(isLarge);
    trigger.addEventListener('click', () => {
      isLarge = !document.documentElement.classList.contains('is-large-text');
      apply(isLarge);
      try {
        localStorage.setItem('invitation-text-scale', isLarge ? 'large' : 'default');
      } catch {}
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
      initTextScale();
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
