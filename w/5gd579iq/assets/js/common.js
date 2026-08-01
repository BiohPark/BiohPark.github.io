(function () {
  const data = window.INVITATION_DATA || {};
  const core = window.InvitationCore;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const concept = document.body.dataset.concept || 'regency';
  let countdownTimer = 0;
  // 글자 크게 토글이 바 높이를 바꾸므로 두 초기화가 서로를 부를 수 있게 모듈 스코프에 둔다.
  let quickNavRefresh = () => {};

  function get(path) {
    if (String(path).startsWith('copy.')) return core.getAtPath(data, `concepts.${concept}.${String(path).slice(5)}`);
    return core.getAtPath(data, path);
  }

  function hydrateFields() {
    document.querySelectorAll('[data-field]').forEach((node) => {
      const value = get(node.dataset.field);
      if (value !== undefined) node.textContent = value;
    });
    /*
     * 단계 안내(전철·KTX)는 배열이다. textContent 로 넣으면 쉼표로 이어 붙은 한 줄이 되어
     * 8차까지의 "몇 단계인지 셀 수 없는 문장"으로 되돌아간다. 목록의 li 로 펼친다.
     */
    /*
     * 12차: 단계 하나가 선택지를 들 수 있다({ text, options }). 승차 정류장이 둘이라 그렇다 —
     * 목록 밖 덧말로 빼 두면 "예외"로 읽히지 지, 고를 것이 있다고 읽히지 않는다.
     * 정류장 이름은 별도 span 에 담는다: 지명 뱃지가 이름만 감싸고 노선 번호는 남겨야 한다.
     */
    document.querySelectorAll('[data-field-list]').forEach((node) => {
      const value = get(node.dataset.fieldList);
      if (!Array.isArray(value)) return;
      node.replaceChildren(...value.map((line) => {
        const item = document.createElement('li');
        if (typeof line === 'string') {
          item.textContent = line;
          return item;
        }
        item.textContent = line.text;
        const options = document.createElement('ul');
        options.className = 'transit-options';
        options.append(...(line.options || []).map((option) => {
          const choice = document.createElement('li');
          const stop = document.createElement('span');
          stop.className = 'transit-options__stop';
          stop.textContent = option.stop;
          const buses = document.createElement('span');
          buses.className = 'transit-options__buses';
          buses.textContent = option.buses;
          choice.append(stop, buses);
          return choice;
        }));
        item.append(options);
        return item;
      }));
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
    // 헤더 안에 놓인 닫기는 흐름에 있어 축소·투명도 변화가 없다. 리스너를 걸어 봐야 헛돈다.
    if (backLink.closest?.('.mobile-header')) return;
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

  /*
   * 안드로이드에서 .ics 링크는 "다운로드 후 앱 선택"이라는 2단계를 강제한다. Chrome for Android가
   * 문서화한 intent: URI로 캘린더 앱의 일정 추가 화면을 직접 열어 그 단계를 없앤다.
   * 스킴 뒤에 host를 붙이면(즉 슬래시 두 개를 쓰면) data URI가 설정되고, 캘린더의 인텐트
   * 필터는 mimeType만 선언하므로 매칭에 실패한다. 반드시 host 없는 형태여야 한다.
   * 참고: developer.chrome.com/docs/android/intents · developer.android.com/guide/components/intents-common
   */
  function buildCalendarIntent() {
    const start = new Date(get('event.iso'));
    if (Number.isNaN(start.getTime())) return '';
    const end = new Date(start.getTime() + 90 * 60 * 1000);
    const fallback = new URL('event.ics', window.location.href).href;
    return `intent:#Intent;${[
      'action=android.intent.action.INSERT',
      'type=vnd.android.cursor.dir/event',
      `S.title=${encodeURIComponent(`${get('couple.korean')} 결혼식`)}`,
      `S.eventLocation=${encodeURIComponent(`${get('venue.name')} ${get('venue.hall')} ${get('venue.address')}`)}`,
      ...(get('event.url') ? [`S.description=${encodeURIComponent(get('event.url'))}`] : []),
      // CalendarContract.EXTRA_EVENT_BEGIN_TIME/END_TIME 의 실제 상수 값은 'beginTime'·'endTime' 이다.
      // 다른 이름을 쓰면 캘린더 편집기는 열리되 날짜·시간이 비어 있어 하객이 직접 입력해야 한다.
      `l.beginTime=${start.getTime()}`,
      `l.endTime=${end.getTime()}`,
      `S.browser_fallback_url=${encodeURIComponent(fallback)}`,
    ].join(';')};end`;
  }

  /*
   * 구글 캘린더는 메모를 details 파라미터로 받는다. 마크업에 박아 두지 않고 여기서 붙이는 이유는,
   * 주소가 배포 때만 채워지는 비공개 값이라 소스에 남으면 안 되기 때문이다(지도 키와 같은 취급).
   */
  function addGoogleCalendarNote() {
    const url = get('event.url');
    const link = document.querySelector('[data-calendar-google]');
    if (!url || !link?.href) return;
    const target = new URL(link.href);
    target.searchParams.set('details', url);
    link.href = target.href;
  }

  function initCalendar() {
    addGoogleCalendarNote();
    const ics = document.querySelector('[data-calendar-ics]');
    const intentUrl = ics && /Android/i.test(navigator.userAgent) ? buildCalendarIntent() : '';
    if (intentUrl) {
      ics.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        // 인텐트를 풀 수 없으면 Chrome이 browser_fallback_url로 보내고, 인앱 브라우저가 intent:를
        // 통째로 무시하면 이 타이머가 오늘과 같은 다운로드 경로로 되돌린다. 무반응은 발생하지 않는다.
        window.setTimeout(() => {
          if (!document.hidden) window.location.href = 'event.ics';
        }, 800);
        window.location.href = intentUrl;
      });
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
          // 메모에 청첩장 주소를 남긴다. 예식 당일 일정 알림에서 약도·셔틀 안내로 바로 돌아올 수 있다.
          // 주소는 배포 때만 채워지므로 빈 값이면 줄 자체를 넣지 않는다.
          ...(get('event.url') ? [`DESCRIPTION:${escapeIcsText(get('event.url'))}`] : []),
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

  // 버튼은 헤더에 상시 고정되므로 하나뿐이다. 라벨이 '다음에 일어날 일'을 말하고, 같은 상태를
  // aria-pressed 로 한 번 더 알리지 않는다 — 둘을 겹치면 스크린리더에 의미가 두 번 반전돼 들린다.
  function initTextScale() {
    const triggers = [...document.querySelectorAll('[data-text-scale]')];
    if (!triggers.length) return;
    const status = document.querySelector('[data-copy-status]');
    let isLarge = false;
    try {
      isLarge = localStorage.getItem('invitation-text-scale') === 'large';
    } catch {}
    const apply = (enabled, announce) => {
      document.documentElement.classList.toggle('is-large-text', enabled);
      triggers.forEach((trigger) => { trigger.textContent = enabled ? '글자 작게' : '글자 크게'; });
      // 라벨만 바뀌면 스크린리더에는 아무 일도 안 일어난 것처럼 들린다. 기존 live region을 재사용한다.
      if (announce && status) status.textContent = enabled ? '글자를 크게 했습니다' : '원래 크기로 되돌렸습니다';
      quickNavRefresh();
    };
    apply(isLarge, false);
    triggers.forEach((trigger) => trigger.addEventListener('click', () => {
      isLarge = !document.documentElement.classList.contains('is-large-text');
      apply(isLarge, true);
      try {
        localStorage.setItem('invitation-text-scale', isLarge ? 'large' : 'default');
      } catch {}
    }));
  }

  /*
   * 퀵 내비게이션. 히어로 뒤에 sticky로 앉으므로 오프닝·대표사진을 구조적으로 가릴 수 없고
   * 스크롤 리스너를 하나도 늘리지 않는다. href는 무JS·딥링크 폴백으로 남겨 두되 클릭 이동은
   * JS가 직접 한다(7차 — 기본 앵커가 히스토리를 쌓아 뒤로가기·닫기를 망가뜨렸다).
   * JS가 하는 일: (1) 헤더 높이를 CSS 변수로 알려 주기 (2) 하객이 찾아온 접기를 열어 주기
   * (3) 스크롤·포커스를 목적지로 옮기기 (4) 현재 위치 표시 하나만 켜기.
   */
  function initQuickNav() {
    const nav = document.querySelector('.quick-nav');
    if (!nav) return;
    // 헤더는 2행이다. 내비 한 행만 재면 오프셋이 절반이 되어 모든 착지가 두 번째 행에 가려진다.
    const header = nav.closest?.('.mobile-header') || nav.parentElement || nav;
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    if (!links.length) return;
    let observer = null;
    const intersecting = new Set();

    quickNavRefresh = () => {
      const barHeight = header.offsetHeight;
      document.documentElement.style.setProperty('--quick-nav-h', `${barHeight}px`);
      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        });
        // #shuttle 은 #venue 안에 들어 있어 둘이 동시에 걸린다. 표시는 하나여야 하므로
        // 문서 순서상 뒤(= 더 구체적인 목적지) 하나만 남긴다.
        let active = null;
        links.forEach((link) => {
          if (intersecting.has(link.getAttribute('href').slice(1))) active = link;
        });
        links.forEach((link) => link.classList.toggle('is-current', link === active));
      }, { threshold: 0, rootMargin: `-${barHeight}px 0px -70% 0px` });
      links.forEach((link) => {
        const section = document.getElementById(link.getAttribute('href').slice(1));
        if (section) observer.observe(section);
      });
    };
    quickNavRefresh();

    nav.addEventListener('click', (clickEvent) => {
      const link = clickEvent.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      // 순정 앵커는 탭할 때마다 히스토리를 쌓는다. 세 항목을 눌러 본 하객은 청첩장을 벗어나려면
      // 뒤로가기를 네 번 눌러야 하고, '닫기'(history.back)도 같은 이유로 제자리를 맴돈다.
      // 그래서 이동을 스크립트가 직접 하고 주소창은 건드리지 않는다 — pushState도 location.hash도 쓰지 않는다.
      clickEvent.preventDefault();
      // 목적지 자신이 접기일 수 있다(셔틀). 자손만 훑으면 접힌 채로 착지한다.
      // 계좌는 민감정보라 내비에서 뺐고, 어느 경로로도 프로그램이 열지 않는다.
      if (target.matches?.('.transit-fold')) target.setAttribute('open', '');
      else target.querySelector('.transit-fold')?.setAttribute('open', '');
      target.tabIndex = -1;
      target.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      window.setTimeout(() => target.focus({ preventScroll: true }), 0);
    });
  }

  /*
   * 지명 뱃지. hydrateFields()가 textContent를 통째로 갈아치우므로(위 hydrateFields 참고) 마크업을
   * 미리 심을 수 없다 — 하이드레이션이 끝난 뒤 텍스트 노드를 훑어 감싼다.
   * 반드시 긴 이름부터 훑는다. '천안역'을 먼저 걸면 'GS25 천안역점'이 'GS25 천[안역]점'으로 쪼개진다.
   */
  function initGeoBadges() {
    const places = get('places');
    const sheet = document.querySelector('[data-geo-sheet]');
    if (!Array.isArray(places) || !places.length || !sheet) return;
    const title = sheet.querySelector('[data-geo-sheet-title]');
    const naverLink = sheet.querySelector('[data-geo-naver]');
    const kakaoLink = sheet.querySelector('[data-geo-kakao]');
    const copyButton = sheet.querySelector('[data-geo-copy]');
    if (!title || !naverLink || !kakaoLink || !copyButton) return;

    let current = null;
    let lastTrigger = null;
    const openSheet = (place, trigger) => {
      current = place;
      lastTrigger = trigger;
      title.textContent = place.name;
      // 12차: 검색으로 잡히지 않는 곳(버스 정류장)은 데이터가 직접 가진 링크를 쓴다. 검색어를
      // 아무리 다듬어도 정류장은 장소 색인에 없다 — 없는 것을 계속 검색시키면 하객만 헤맨다.
      naverLink.href = place.naver || `https://map.naver.com/v5/search/${encodeURIComponent(place.query)}`;
      kakaoLink.href = place.kakao || `https://map.kakao.com/link/search/${encodeURIComponent(place.query)}`;
      copyButton.textContent = place.copyLabel;
      sheet.showModal?.();
    };
    sheet.querySelector('[data-geo-close]')?.addEventListener('click', () => sheet.close());
    // 배경 탭으로도 닫히게 하되, 65세 하객은 그 관습을 모르므로 명시 버튼이 정본이다.
    sheet.addEventListener('click', (event) => { if (event.target === sheet) sheet.close(); });
    // 시트를 닫은 하객이 읽던 문장으로 돌아와야 한다.
    sheet.addEventListener('close', () => lastTrigger?.focus());
    copyButton.addEventListener('click', () => {
      if (!current) return;
      const isAddress = current.copyLabel.includes('주소');
      copyText(
        current.query,
        copyButton,
        '복사했습니다',
        isAddress ? '주소가 복사되었습니다' : '장소 이름이 복사되었습니다',
        '복사하지 못했습니다. 화면의 글자를 길게 눌러 복사해 주세요.',
      );
    });

    const ordered = [...places].sort((a, b) => b.name.length - a.name.length);
    const findHit = (text, used) => {
      let best = null;
      ordered.forEach((place) => {
        if (used.has(place.name)) return;
        const index = text.indexOf(place.name);
        // 같은 위치에서는 먼저 걸린 쪽이 이긴다 — ordered가 길이 내림차순이라 긴 이름이 이긴다.
        if (index >= 0 && (!best || index < best.index)) best = { index, place };
      });
      return best;
    };

    /*
     * 지도 폴백 문구(.map-pane__note)는 제외한다. 바로 옆에 '카카오맵으로 열기' 버튼이 있어
     * 뱃지가 같은 일을 두 번 하고, 그 문단은 남색이 아니라 크림 카드 위에 놓여 있어
     * 크림색 뱃지가 그대로 배경에 묻혔다 — 실측 대비 1:1, 지명이 통째로 안 보였다.
     */
    /*
     * 11차: 단계 목록의 <li> 를 범위에 넣는다. 하객이 실제로 찾아 헤매는 이름(정류장)이 전부
     * 거기 있는데 <p> 만 훑고 있어 전철 안내에는 뱃지가 하나도 없었다. li 하나가 곧 한 단계라
     * 문단당 둘 제한도 단계별로 걸린다.
     */
    document.querySelectorAll('.venue-address, .directions-list p:not(.map-pane__note), .directions-list li').forEach((scope) => {
      const queue = [];
      const walker = document.createTreeWalker(scope, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) queue.push(walker.currentNode);
      const used = new Set();
      // 한 문단에 뱃지가 셋 이상 몰리면 문장이 링크 밭이 된다. 발견성은 둘이면 전달된다.
      let placed = 0;
      while (queue.length && placed < 2) {
        const node = queue.shift();
        // <strong> 라벨은 제외한다 — 짝이 되는 '천안터미널'은 뱃지 대상이 아니라 한쪽만 눌리는 비대칭이 생긴다.
        if (!node.parentElement || node.parentElement.closest('strong, .geo-badge')) continue;
        const hit = findHit(node.nodeValue, used);
        if (!hit) continue;
        const tail = node.splitText(hit.index);
        tail.nodeValue = tail.nodeValue.slice(hit.place.name.length);
        const badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'geo-badge';
        badge.setAttribute('aria-haspopup', 'dialog');
        badge.append(document.createTextNode(hit.place.name));
        // 보이는 텍스트가 접근 이름에 그대로 포함돼야 음성 제어에서 지명으로 호출된다(WCAG 2.5.3).
        const hint = document.createElement('span');
        hint.className = 'visually-hidden';
        hint.textContent = ' 지도에서 열기';
        badge.append(hint);
        badge.addEventListener('click', () => openSheet(hit.place, badge));
        tail.parentNode.insertBefore(badge, tail);
        used.add(hit.place.name);
        placed += 1;
        queue.unshift(tail);
      }
    });
  }

  /*
   * 지도 위젯. 탭을 열기 전에는 스크립트를 한 바이트도 받지 않는다 — 하객 대부분은 약도만 보고 떠난다.
   * 키는 소스 저장소에 두지 않는다(공개 저장소). 배포 스크립트가 데이터에 주입하며, 값이 없으면
   * 위젯을 시도하지 않고 '앱에서 열기' 폴백이 그대로 남는다 — 어느 경우에도 빈 화면이 되지 않는다.
   *
   * 11차: 네이버 SDK 를 걷었다. 같은 위치를 지도 둘로 두 번 보여 줄 이유가 없고, 인증이 배포
   * 도메인에서만 성립해 로컬에서는 끝내 판정할 수 없는 코드였다(7차 프로브). 네이버로 가는 길은
   * 딥링크 버튼으로 남아 있고, 하객이 실제로 원하는 것도 보기가 아니라 길찾기다.
   */
  function initMapWidgets() {
    const mounts = [...document.querySelectorAll('[data-map-widget]')];
    if (!mounts.length) return;

    /*
     * 폴백('앱에서 열기')은 어떤 경우에도 숨기지 않는다. 7차에 같은 실수를 두 번 했다 —
     * "요소는 존재하는데 보이지 않는다". 렌더에 성공했는지 확인하지도 않고 탈출구를 치우면,
     * 위젯이 실패한 하객에게는 빈 회색 박스만 남고 작동하던 링크는 사라진 뒤다.
     * 게다가 지도가 떠도 딥링크는 여전히 쓸모 있다 — 하객이 원하는 건 보는 게 아니라 길찾기다.
     * 그래서 실패했을 때 걷어내는 것은 폴백이 아니라 '빈 상자' 쪽이다.
     */
    const failWidget = (mount) => { mount.hidden = true; };
    // 'ok' 면 다시 손대지 않고, 'failed' 면 다음 방문에서 한 번 더 시도한다.
    // 상태를 'started' 한 종류로만 두면 일시적 실패가 영구 실패가 된다.
    const widgetState = new Map();
    const attempts = new Map();
    const judge = (name, mount, ok) => {
      widgetState.set(name, ok ? 'ok' : 'failed');
      if (!ok) failWidget(mount);
    };

    const startKakao = (mount, name) => {
      /*
       * 퍼가기 값은 장소마다 따로 발급된다(예식장·올리브영 천안타운·GS25 천안역점).
       * 마운트가 어느 장소인지는 data-map-widget 의 접미사가 말한다: kakao / kakao-olive / kakao-gs25.
       */
      const place = name.startsWith('kakao-') ? name.slice(6) : 'venue';
      const roughmap = get('venue.maps.kakaoRoughmaps')?.[place];
      // 퍼가기 코드는 카카오맵이 장소별로 발급한다. 검색어만으로는 초기화할 수 없고, 임의 값을 넣지 않는다.
      if (!roughmap?.timestamp || !roughmap?.key) return;
      // 값은 배포 설정에서 오지만 그대로 마크업에 박히므로 형식을 좁혀 둔다.
      if (!/^\d+$/.test(String(roughmap.timestamp)) || !/^[A-Za-z0-9]+$/.test(String(roughmap.key))) return;
      /*
       * 퍼가기 로더는 내부에서 document.write 로 lander 를 불러온다 — 동적 async 스크립트로는
       * 동작하지 않고, 컨테이너 id·class 도 발급 코드 그대로여야 한다. 그래서 파서가 읽는 형태
       * 그대로 iframe 안에 넣는다. 덤으로 카카오 전역·CSS 가 초대장 본문으로 새지 않는다.
       */
      const frame = document.createElement('iframe');
      frame.title = '카카오맵으로 보는 예식장 위치';
      /*
       * srcdoc 은 쓰지 않는다. 출처가 `about:srcdoc` 이라 카카오 로더가 지도를 그리지 못한다
       * (라이브 실측: 스크립트 오류는 없는데 컨테이너 높이 0, 타일 0). 배포 스크립트가 같은
       * 디렉터리에 실제 HTML 을 만들어 두고 그것을 연다 — 실제 URL·출처를 갖게 되고,
       * 파일이 없는 환경(소스 저장소)에서는 로드가 실패해 폴백이 그대로 남는다.
       */
      // loading="lazy" 는 srcdoc iframe 에 대해 명세가 없다. 처리되면 display:none 안에서 영영
      // 지연되고, 무시되면 아무 이득이 없다. 전송은 이미 '탭을 열기 전엔 시작 안 함'으로 막혀 있다.
      frame.width = '100%';
      frame.height = '100%';
      frame.style.border = '0';
      frame.src = `kakao-map-${place}.html`;
      mount.append(frame);
      // 붙였다고 그려진 것이 아니다. srcdoc 은 부모와 같은 출처라 안을 들여다볼 수 있으므로
      // 실제로 무언가 그려졌는지 확인하고, 아니면 빈 상자를 걷는다(폴백은 그대로 남아 있다).
      frame.addEventListener('load', () => {
        const check = (remaining) => {
          // 숨은 탭에서는 컨테이너 높이가 0이다. 여기서 판정하면 성공한 지도를 실패로 지운다 —
          // 실제로 "카카오까지 스와이프했다 돌아왔다 다시 가면 안 나온다"는 제보가 이 경로였다.
          if (!mount.offsetParent) { window.setTimeout(() => check(remaining), 600); return; }
          let rendered = false;
          try {
            const box = frame.contentDocument?.querySelector(`#daumRoughmapContainer${roughmap.timestamp}`);
            rendered = Boolean(box && box.clientHeight > 0 && box.querySelector('img, canvas, iframe'));
          } catch { rendered = false; }
          if (rendered) { judge(name, mount, true); return; }
          if (remaining > 0) { window.setTimeout(() => check(remaining - 1), 700); return; }
          judge(name, mount, false);
        };
        window.setTimeout(() => check(8), 1200);
      }, { once: true });
    };

    const start = (mount) => {
      const name = mount.dataset.mapWidget;
      const state = widgetState.get(name);
      if (state === 'ok' || state === 'loading') return;
      const tried = attempts.get(name) || 0;
      if (tried >= 2) return;
      attempts.set(name, tried + 1);
      widgetState.set(name, 'loading');
      mount.hidden = false;
      mount.replaceChildren();
      if (name.startsWith('kakao')) startKakao(mount, name);
    };

    /*
     * 탭 라디오는 지도 카드와 셔틀 접기 두 곳에 있다. 라벨은 자기 패널만 가리키므로,
     * 라디오가 속한 카드 안에서 짝 패널을 찾는다 — 문서 전체에서 찾으면 두 카드가 서로를 켠다.
     */
    document.querySelectorAll('input[data-map-view]').forEach((radio) => {
      radio.addEventListener('change', () => {
        if (!radio.checked) return;
        const scope = radio.closest('[data-map-card]') || document;
        const pane = scope.querySelector(`[data-map-pane="${radio.dataset.mapView}"]`);
        pane?.querySelectorAll('[data-map-widget]').forEach(start);
      });
    });
  }

  /*
   * 약도 ↔ 네이버맵 ↔ 카카오맵 좌우 스와이프. 탭을 못 찾은 하객도 밀어서 넘길 수 있게 한다.
   * 세로 스크롤을 뺏으면 안 되므로 가로 이동이 세로보다 확실히 클 때만 반응하고,
   * 리스너는 전부 passive 로 둔다(preventDefault 를 쓰지 않는다 = 스크롤을 막지 않는다).
   */
  /*
   * 구간 소목차. 헤더 아래에 걸려 「오시는 길」 안에 있는 동안만 교통수단 네 갈래를 보여 준다.
   * 헤더 내비에 다섯 칸을 넣는 안은 실측으로 기각됐다(320px 가용 52px < '전철·기차·KTX' 84px).
   * 본문에 칩으로 두는 안도 걷었다 — 바로 아래 접기 목록이 같은 네 항목이라 중복이었다.
   *
   * 두 가지를 조심한다.
   * 1) 등장·소멸이 헤더 총 높이를 45↔85 로 바꾼다. 그대로 두면 scroll-margin-top 이 함께 흔들려
   *    내비로 이동한 하객의 착지점이 밀린다. 그래서 높이를 --section-nav-h 로 따로 내보내고,
   *    이동 중에는 표시 전환을 미룬다.
   * 2) [hidden] 은 display 선언에 진다(HTML 표준). CSS 쪽에 [hidden] 복구 규칙이 함께 있어야 한다.
   */
  function initSectionNav() {
    const nav = document.querySelector('[data-section-nav]');
    if (!nav) return;
    const scope = document.getElementById(nav.dataset.sectionNav)
      || document.querySelector(`[data-section="${nav.dataset.sectionNav}"]`);
    const links = [...nav.querySelectorAll('a[href^="#"]')];
    if (!scope || !links.length) return;

    const setHeight = () => {
      const height = nav.hidden ? 0 : nav.offsetHeight;
      document.documentElement.style.setProperty('--section-nav-h', `${height}px`);
    };

    /*
     * 프로그램 이동이 끝나기 전에 바가 나타나면 착지점이 바 높이만큼 밀려 접기 제목이 가려진다.
     * 그렇다고 그동안 들어온 신호를 버리면 안 된다 — 구간에 들어서는 순간이 바로 그 신호이고,
     * 한 번 버리면 다시 올 일이 없어 바가 영영 안 뜬다(실측으로 그렇게 터졌다). 미루되 기억한다.
     */
    let settling = 0;
    let desired = false;
    let pending = 0;
    const apply = () => {
      if (nav.hidden !== desired) return;
      nav.hidden = !desired;
      setHeight();
      refreshMarker();
    };
    const show = (visible) => {
      desired = visible;
      const remaining = settling - window.performance.now();
      if (remaining > 0) {
        window.clearTimeout(pending);
        pending = window.setTimeout(apply, remaining + 50);
        return;
      }
      apply();
    };

    new IntersectionObserver((entries) => {
      entries.forEach((entry) => show(entry.isIntersecting));
    }, { threshold: 0 }).observe(scope);

    // 어느 갈래를 보고 있는지.
    const intersecting = new Set();
    let marker = null;
    function refreshMarker() {
      /*
       * 판정선은 고정 픽셀이 아니라 '가려지는 높이'다. 헤더 45 + 소목차 41 = 86px 인데 46px 로
       * 잡아 두었더니, 바 뒤에 숨은 접기가 여전히 '보이는 것'으로 세어져 강조가 한 칸씩 뒤처졌다.
       * 큰 글자 모드에서 바 높이가 달라지므로 값이 아니라 실측으로 다시 잡는다.
       */
      const covered = Math.round(
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--quick-nav-h')) || 45,
      ) + (nav.hidden ? 0 : nav.offsetHeight)
        // 착지 여백(scroll-margin 8px)보다 살짝 아래에서 센다. 판정선을 바 바로 아래에 두면
        // 눌러서 착지한 순간 바로 위 접기의 끝자락이 1~2px 걸려 이전 항목이 이긴다.
        + 12;
      marker?.disconnect();
      intersecting.clear();
      marker = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        });
        /*
         * 헤더 내비와 반대로 '문서 순서상 처음'을 쓴다. 거기는 #venue 안에 #shuttle 이 든 중첩이라
         * 더 구체적인 뒤쪽이 답이었지만, 여기 넷은 형제다. 접기가 다 닫히면 176px 안에 전부 들어와
         * 동시에 걸리는데, 뒤쪽을 고르면 자가용을 보고 있어도 늘 '버스'가 켜진다(실측 확인).
         * 화면 위쪽에 있는 것이 지금 보고 있는 것이다.
         */
        const active = links.find((link) => intersecting.has(link.getAttribute('href').slice(1))) || null;
        links.forEach((link) => link.classList.toggle('is-current', link === active));
      }, { threshold: 0, rootMargin: `-${covered}px 0px -70% 0px` });
      links.forEach((link) => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) marker.observe(target);
      });
    }
    refreshMarker();

    nav.addEventListener('click', (clickEvent) => {
      const link = clickEvent.target.closest('a[href^="#"]');
      if (!link) return;
      const target = document.getElementById(link.getAttribute('href').slice(1));
      if (!target) return;
      // 헤더 내비와 같은 규칙 — 주소창도 히스토리도 건드리지 않는다. 접기는 열어 준 뒤 이동한다.
      clickEvent.preventDefault();
      settling = window.performance.now() + 700;
      // 누른 항목을 즉시 켠다. 스크롤이 끝나면 바로 위 접기의 끝자락이 판정선에 1~2px 걸쳐
      // 이전 항목이 이겨 버리는 일이 있다 — 누른 사람에게는 그것이 그냥 오작동으로 보인다.
      links.forEach((other) => other.classList.toggle('is-current', other === link));
      if (target.matches?.('.transit-fold')) target.setAttribute('open', '');
      target.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      target.querySelector?.('summary')?.focus?.({ preventScroll: true });
    });

    window.addEventListener('resize', () => { setHeight(); refreshMarker(); });
    setHeight();
  }

  /*
   * 약도·셔틀 사진 크게 보기. 새 탭으로 원본을 여는 방식은 확대는 잘 되지만 청첩장을 떠난다
   * (카톡 인앱 브라우저에서 돌아오는 비용이 크다). 페이지 안에서 열되, 뷰포트가 확대를 막고
   * 있으므로 확대를 직접 구현한다 — 더블탭 2배와 드래그 이동까지만. 원본 해상도가
   * 약도 764×769 / 셔틀 1200×574 라 2배를 넘기면 어차피 뭉개져 무단계 줌은 실익이 없다.
   * 원본을 보고 싶은 하객을 위해 '원본 열기'는 라이트박스 안에 남긴다.
   */
  function initLightbox() {
    const sheet = document.querySelector('[data-lightbox]');
    const triggers = [...document.querySelectorAll('[data-lightbox-open]')];
    if (!sheet || !triggers.length || typeof sheet.showModal !== 'function') return;
    const image = sheet.querySelector('[data-lightbox-image]');
    const original = sheet.querySelector('[data-lightbox-original]');
    const ZOOM = 2;
    const TAP_GAP = 300;
    // 손끝은 같은 자리를 눌러도 몇 픽셀 흔들린다. 이 여유보다 작게 움직였으면 탭으로 센다.
    const TAP_SLOP = 10;
    let zoomed = false;
    let offsetX = 0;
    let offsetY = 0;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    let downX = 0;
    let downY = 0;
    let lastTap = 0;

    const apply = () => {
      image.style.transform = zoomed
        ? `translate(${offsetX}px, ${offsetY}px) scale(${ZOOM})`
        : 'translate(0px, 0px) scale(1)';
      image.classList.toggle('is-zoomed', zoomed);
    };

    /*
     * 확대한 그림을 끌어도 빈 배경이 들어오지 않게 이동 범위를 가둔다. 한계는 '화면 밖으로 넘친 만큼'의
     * 절반이다 — 넘치지 않는 축은 아예 움직이지 않는다.
     * 두 가지를 조심한다.
     * 1) getBoundingClientRect 는 확대가 이미 반영된 값을 준다. 그것으로 계산하면 한계가 정확히
     *    두 배로 잡혀 그림을 화면 밖으로 절반이나 밀 수 있다(실측: 한계 195 여야 할 자리에 390).
     *    변환이 섞이지 않는 배치 크기(offsetWidth)를 쓴다.
     * 2) 넘친 양은 그림 크기가 아니라 '그림 - 화면'이다. 그림끼리 비교하면 세로가 다 보이는데도
     *    위아래로 끌려 여백이 들어온다.
     */
    const clamp = () => {
      const limitX = Math.max(0, (image.offsetWidth * ZOOM - sheet.clientWidth) / 2);
      const limitY = Math.max(0, (image.offsetHeight * ZOOM - sheet.clientHeight) / 2);
      offsetX = Math.min(limitX, Math.max(-limitX, offsetX));
      offsetY = Math.min(limitY, Math.max(-limitY, offsetY));
    };

    const reset = () => { zoomed = false; offsetX = 0; offsetY = 0; lastTap = 0; apply(); };

    const toggleZoom = () => {
      zoomed = !zoomed;
      if (!zoomed) { offsetX = 0; offsetY = 0; }
      apply();
    };

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', (clickEvent) => {
        clickEvent.preventDefault();
        image.src = trigger.dataset.lightboxOpen;
        image.alt = trigger.dataset.lightboxAlt || '';
        if (original) original.href = trigger.dataset.lightboxOpen;
        reset();
        sheet.showModal();
      });
    });

    sheet.querySelector('[data-lightbox-close]')?.addEventListener('click', () => sheet.close());
    // 그림 바깥(배경)을 누르면 닫는다. 그림 자체는 확대·이동을 위해 남겨 둔다.
    sheet.addEventListener('click', (clickEvent) => {
      if (clickEvent.target === sheet) sheet.close();
    });
    sheet.addEventListener('close', reset);

    /*
     * 더블탭 판정은 반드시 한 곳에서만 한다. 10차까지는 dblclick 과 탭 간격 측정을 둘 다 걸어 두어,
     * 터치로 두 번 누르면 pointerup 이 켜고 뒤이어 합성된 dblclick 이 그대로 껐다 — 확대했다가
     * 즉시 원복되는 것처럼 보인 것이 이것이다. pointerup 하나만 남긴다(마우스 더블클릭도 여기로 온다).
     */
    image.addEventListener('pointerdown', (pointerEvent) => {
      downX = pointerEvent.clientX;
      downY = pointerEvent.clientY;
      if (!zoomed) return;
      dragging = true;
      lastX = pointerEvent.clientX;
      lastY = pointerEvent.clientY;
      image.setPointerCapture?.(pointerEvent.pointerId);
    });
    /*
     * <img> 는 기본적으로 끌어 옮길 수 있다. 확대한 그림을 밀면 브라우저가 그것을 이미지 드래그로
     * 채 가면서 pointercancel 을 쏘고, 그 순간 이동이 죽는다 — 실측하면 손을 떼기 전에 딱 한 번만
     * 움직이고 멈춘다. guard.js 가 draggable 을 꺼 주지만 이 그림은 data-allow-save 라 예외였다.
     * dragstart 만 막는다: 롱프레스 저장은 contextmenu 경로라 그대로 남는다.
     */
    image.addEventListener('dragstart', (dragEvent) => dragEvent.preventDefault());
    image.addEventListener('pointermove', (pointerEvent) => {
      if (!dragging) return;
      offsetX += pointerEvent.clientX - lastX;
      offsetY += pointerEvent.clientY - lastY;
      lastX = pointerEvent.clientX;
      lastY = pointerEvent.clientY;
      clamp();
      apply();
    });
    image.addEventListener('pointerup', (pointerEvent) => {
      dragging = false;
      // 끌어서 옮긴 손가락은 탭이 아니다. 이 검사가 없으면 확대 상태에서 두 번 끌 때마다 축소된다.
      const moved = Math.abs(pointerEvent.clientX - downX) > TAP_SLOP
        || Math.abs(pointerEvent.clientY - downY) > TAP_SLOP;
      if (moved) { lastTap = 0; return; }
      const now = Date.now();
      // 성립한 뒤에는 시각을 지운다 — 남겨 두면 세 번째 탭이 두 번째와 짝지어 또 뒤집힌다.
      if (now - lastTap < TAP_GAP) { toggleZoom(); lastTap = 0; return; }
      lastTap = now;
    });
    image.addEventListener('pointercancel', () => { dragging = false; lastTap = 0; });
  }

  function initMapSwipe() {
    document.querySelectorAll('[data-map-card]').forEach(bindMapSwipe);
  }

  function bindMapSwipe(card) {
    const radios = [...card.querySelectorAll('input[data-map-view]')];
    if (radios.length < 2) return;
    const MIN_DISTANCE = 48;
    const DOMINANCE = 1.6;
    let startX = 0;
    let startY = 0;
    let tracking = false;

    card.addEventListener('touchstart', (event) => {
      // 지도 위젯 안에서 시작한 제스처는 지도 것이다 — 가로로 끌어 지도를 움직이는 동작을 뺏지 않는다.
      if (event.touches.length !== 1 || event.target.closest?.('[data-map-widget]')) {
        tracking = false;
        return;
      }
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      tracking = true;
    }, { passive: true });

    card.addEventListener('touchend', (event) => {
      if (!tracking) return;
      tracking = false;
      const touch = event.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - startX;
      const deltaY = touch.clientY - startY;
      if (Math.abs(deltaX) < MIN_DISTANCE || Math.abs(deltaX) < Math.abs(deltaY) * DOMINANCE) return;
      const index = radios.findIndex((radio) => radio.checked);
      const next = radios[index + (deltaX < 0 ? 1 : -1)];
      if (!next) return;
      next.checked = true;
      // 위젯 지연 초기화가 change 를 듣는다. 라디오를 코드로 바꾸면 이벤트가 안 나므로 직접 쏜다.
      next.dispatchEvent(new Event('change', { bubbles: true }));
    }, { passive: true });
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

  let initialized = false;
  function init() {
    // 공개 API 로 내보낸 이상 멱등이어야 한다. 두 번 불리면 리스너와 SDK 요청이 쌓인다.
    if (initialized) return;
    initialized = true;
    try {
      hydrateFields();
      document.documentElement.classList.remove('js-loading');
      document.documentElement.classList.add('js-ready');
      initOpenings();
      initCountdown();
      initBackLink();
      initCopyAndShare();
      initCalendar();
      initQuickNav();
      initTextScale();
      initGeoBadges();
      initSectionNav();
      initLightbox();
      initMapWidgets();
      initMapSwipe();
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
