  // 아래 계좌 문자열은 Base64로 담겨 있다. GitHub 코드 검색과 크롤러에 번호가 평문으로
  // 걸리는 것을 피하려는 조치일 뿐, 소스를 열면 누구나 되돌릴 수 있어 실질 보호가 아니다.
  const revealAccount = (encoded) => new TextDecoder().decode(Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0)));
window.INVITATION_DATA = Object.freeze({
  couple: {
    korean: '박비오 · 조예나',
    english: 'GROOM & BRIDE',
    monogram: 'G · B',
  },
  groom: {
    name: '박비오',
    english: 'GROOM',
    father: '아버지 성함',
    mother: '어머니 성함',
  },
  bride: {
    name: '조예나',
    english: 'BRIDE',
    father: '아버지 성함',
    mother: '어머니 성함',
  },
  event: {
    iso: '2026-12-05T13:30:00+09:00',
    dateKorean: '2026년 12월 5일 토요일 오후 1시 30분',
    dateEnglish: 'SATURDAY, THE FIFTH OF DECEMBER · 1:30 PM',
    shortDate: '2026. 12. 5. 토요일 오후 1시 30분',
    monthEnglish: 'DECEMBER',
    day: '05',
    dayDisplay: '12 . 05',
    // 캘린더 일정의 메모로 들어갈 청첩장 주소. 비공개 URL 이라 소스 저장소에는 비워 두고
    // 배포 스크립트가 채운다 — 지도 키와 같은 취급이다. 빈 값이면 메모 줄을 아예 넣지 않는다.
    url: 'https://biohpark.github.io/w/5gd579iq/',
  },
  venue: {
    name: '티웨딩 천안',
    hall: '투데이홀',
    address: '충청남도 천안시 동남구 목천읍 응원3길 27',
    lotAddress: '충남 천안시 동남구 목천읍 응원리 67-1',
    phone: '041-555-7900',
    parking: '대형 주차장 완비',
    officialParking: '1,500대 · 무료주차',
    maps: {
      kakao: `https://map.kakao.com/link/search/${encodeURIComponent('티웨딩 천안')}`,
      naver: `https://map.naver.com/v5/search/${encodeURIComponent('티웨딩 천안')}`,
      kakaoRoughmaps: { venue: { timestamp: '1785559333480', key: 's6s5azatujg' }, olive: { timestamp: '1785504410724', key: 's5m2eskwnqk' }, gs25: { timestamp: '1785504449156', key: 's5m3bjpfrf9' } },
    },
  },
  /*
   * 셔틀 승차장 두 곳의 딥링크. 11차에 네이버 지도 SDK를 걷어 내면서 두 지도 앱으로 나가는 길이
   * 예식장에만 있고 승차장에는 카카오뿐이던 비대칭이 남았다 — 같은 어휘로 둘 다 준다.
   */
  shuttleStops: {
    olive: {
      kakao: `https://map.kakao.com/link/search/${encodeURIComponent('올리브영 천안타운')}`,
      naver: `https://map.naver.com/v5/search/${encodeURIComponent('올리브영 천안타운')}`,
    },
    gs25: {
      kakao: `https://map.kakao.com/link/search/${encodeURIComponent('GS25 천안역점')}`,
      naver: `https://map.naver.com/v5/search/${encodeURIComponent('GS25 천안역점')}`,
    },
  },
  /*
   * 본문 안에서 눌리는 지명. 화면에 이미 적혀 있는 문구만 넣는다 — 여기 없는 지명을 만들면
   * 하객을 검증되지 않은 좌표로 보내게 된다. 긴 이름이 먼저 와야 한다: '천안역'을 먼저 걸면
   * 'GS25 천안역점'이 'GS25 천[안역]점'으로 쪼개진다.
   */
  places: [
    { name: '충청남도 천안시 동남구 목천읍 응원3길 27', query: '충청남도 천안시 동남구 목천읍 응원3길 27', copyLabel: '주소 복사' },
    { name: 'GS25 천안역점', query: 'GS25 천안역점', copyLabel: '장소 이름 복사' },
    { name: '올리브영 천안타운', query: '올리브영 천안타운', copyLabel: '장소 이름 복사' },
    /*
     * 11차: 하객이 실제로 서야 하는 곳은 '천안역'이 아니라 그 앞 정류장이다. 방면까지 적힌
     * 정류장 이름을 그대로 검색어로 쓴다 — 같은 광장에 반대 방면 정류장이 따로 있다.
     *
     * 12차: 그런데 그 이름으로는 두 지도 앱 모두 정류장을 찾아 주지 못했다(사용자 실측). 검색어를
     * 더 다듬어 봐야 소용없다 — 정류장은 장소 검색 색인에 이름으로 잡히지 않는다. 사용자가 각 앱에서
     * 직접 잡아 온 정류장 항목 링크로 대체한다(naver.me/kko.to = 각 사 공식 단축 주소).
     * 확인: 네이버 bus-station/368215·368213, 카카오 BS282984·BS282983 — 서로 다른 두 정류장이다.
     * copy 버튼은 그대로 query(정류장 이름)를 복사한다. 붙여 넣을 곳은 지도 앱이 아니라 대화창이다.
     */
    {
      name: '동부광장(온양나드리방면)', query: '동부광장(온양나드리방면)', copyLabel: '정류장 이름 복사',
      naver: 'https://naver.me/F1aNgbyS', kakao: 'https://kko.to/8MxVGSMyRH',
    },
    {
      name: '삼도상가(동부광장방면)', query: '삼도상가(동부광장방면)', copyLabel: '정류장 이름 복사',
      naver: 'https://naver.me/xaTIBX0I', kakao: 'https://kko.to/pzdf2gu1Jw',
    },
    { name: '세광엔리치빌 정류장', query: '세광엔리치빌 정류장', copyLabel: '장소 이름 복사' },
    { name: 'KTX 천안아산역', query: 'KTX 천안아산역', copyLabel: '장소 이름 복사' },
    // 자가용 안내의 검색어는 공식 카드 표기대로 붙여 쓴 '티웨딩천안'이다. 화면 글자와 이름이 한 글자라도
    // 다르면 뱃지가 붙지 않으므로 name 은 붙여 쓴 쪽, 지도 검색어는 띄어 쓴 쪽(venue.maps 와 같은 값)이다.
    { name: '티웨딩천안', query: '티웨딩 천안', copyLabel: '장소 이름 복사' },
    { name: '천안역', query: '천안역', copyLabel: '장소 이름 복사' },
    { name: '아산역', query: '아산역', copyLabel: '장소 이름 복사' },
  ],
  directions: {
    car: '내비게이션에 티웨딩 천안 또는 충청남도 천안시 동남구 목천읍 응원3길 27을 입력해 주세요.',
    summary: '세 경로 모두 세광엔리치빌 정류장에서 하차하시면 됩니다. (약 40분 소요)',
    terminalPrint: '24 · 400 · 500 외',
    // 인쇄 지면에는 단계를 나열할 자리가 없다. 축약하되 하차 지점(세광엔리치빌)만은 반드시 남긴다 —
    // 화면본에서 그것이 빠져 있던 것이 9차 수정의 발단이었다.
    stationPrint: '1번 출구 동부광장 정류장에서 24 · 383 · 400 승차 → 세광엔리치빌 하차',
    ktxPrint: '아산역에서 전철 승차 → 천안역 하차 후 위와 같이 이동',
    terminal: '24 · 310 · 381 · 382 · 383 · 400 · 402 · 500 · 512 · 530 · 531 · 540',
    station: '24 · 383 · 400 (기차·전철 하차 후 1번 출구 동부광장 정류장에서 승차)',
    ktx: '천안아산역 → 아산역(전철) → 천안역(전철) 하차 후 1번 출구 동부광장 정류장에서 승차 · 24 · 383 · 400',
    // 정본: tasks/invitation-round6-refinement/sources/map-facts-v6.md (예식장 최종 약도 전사).
    // 주차 문장만 이전 카드(map-facts-v4)에서 가져와 병기한다 — 최종본이 반복하지 않을 뿐 모순이 아니다.
    official: {
      // 자가용은 세 줄로 나눈다. 한 문장에 검색어·주소·주차를 다 넣으면 어디까지가 한 항목인지
      // 읽어 내야 한다. 검색어 "티웨딩천안"은 공식 카드 표기 그대로 붙여 쓴다 — 띄우면 검색 결과가 달라진다.
      carNavi: '내비게이션에 티웨딩천안 을 검색하세요.',
      carAddress: '주소로 찾으실 때는 응원3길 27 또는 응원리 67-1 을 입력하세요.',
      carParking: '주차장은 1,500대 규모이며 무료입니다. 도착하시면 주차요원의 안내를 받으시면 됩니다.',
      icGuidance: '천안IC보다 독립기념관IC, 남천안IC를 이용하시면 더욱 편리합니다',
      icDistance: '독립기념관IC 6km · 7분 / 남천안IC 3.5km · 5분',
      // 7차: 검색어를 감싸던 따옴표를 걷었다. 지명 뱃지의 밑줄·핀과 겹쳐 지저분했다(사용자 지시).
      // 공식 카드 전사와 이 두 줄만 다르다 — 사실은 그대로고 인용부호만 뺐다.
      shuttleTerminal: '신세계백화점 옆 올리브영 앞 탑승 (스타벅스·애슐리 사이) · 올리브영 천안타운 검색',
      shuttleStation: '1번 출구 동부광장 건너편 GS25편의점 앞 탑승 · GS25 천안역점 검색',
      shuttleInterval: '첫 예식 1시간 전부터 20~30분 간격',
      shuttleNote: '25인승 버스로 예식에 한해 운행하며, 행사 일정과 비수기 시즌에는 운행이 변동될 수 있습니다.',
      busStop: '세광엔리치빌 정류장에서 내리십니다.',
      bus: '24, 310, 381, 382, 383, 400, 402, 500, 512, 530, 531, 540',
      /*
       * 전철·KTX 는 한 문장으로 쓰면 안 된다. 8차까지의 단일 문자열은 접속사로 이어 붙어 있어
       * 몇 단계인지 셀 수 없었고, 그 탓에 '세광엔리치빌 하차'(하차 지점)와 KTX 환승 이후가 통째로
       * 빠져 있었다 — 하객이 버스를 타고도 어디서 내릴지 모르는 상태였다. 단계 배열로 바꾼다.
       * 두 경로를 각각 끝까지 적는다. "위 ②부터 같습니다" 식 상호참조는 되짚어 읽는 부담이 크다.
       *
       * 11차: 여기 세 가지가 공식 카드와 다르다. 카드가 아니라 **현지 확인(사용자)**이 정본이다.
       *   1) '동부역' → '동부광장(온양나드리방면) 정류장'. 나가는 출구가 아니라 서야 할 정류장 이름이다.
       *   2) 401 삭제 — 실재하지 않는 노선이다.
       *   3) 500 은 동부광장이 아니라 삼도상가(동부광장방면)에서 탄다 → 11차에는 목록 밖 덧말로 분리했다.
       * 9차에 "원본 그대로, 병합 금지"로 잠갔던 401/402 불일치는 이 확인으로 해소됐다:
       * 버스 블록(402 있음)이 맞고 전철 블록의 401 이 오기였다. 402 는 그대로 둔다.
       *
       * 12차: railBus500 을 지우고 그 사실을 단계 안으로 넣는다. 목록 바깥의 덧말은 "다른 정류장도
       * 있다"가 아니라 "예외가 있다"로 읽혔다 — 두 정류장은 우열이 아니라 선택지다(사용자 지적).
       * 승차 단계 하나가 정류장 둘을 나란히 들고 있으면 고를 것이 있다는 사실이 한눈에 보인다.
       * 402 를 삼도상가 쪽에 함께 적는 것도 사용자 현지 확인이다 — 버스 목록에 이미 있던 노선이다.
       * 단계 항목이 문자열이 아니라 { text, options } 이면 hydrateFields 가 중첩 목록으로 편다.
       */
      railStation: [
        '천안역에서 기차 또는 전철에서 내립니다.',
        '1번 출구로 나갑니다.',
        {
          text: '아래 두 정류장 중 편하신 곳에서 버스를 탑니다.',
          options: [
            { stop: '동부광장(온양나드리방면)', buses: '24, 383, 400번' },
            { stop: '삼도상가(동부광장방면)', buses: '402, 500번' },
          ],
        },
        '세광엔리치빌 정류장에서 내립니다.',
      ],
      railKtx: [
        '아산역에서 전철을 탑니다.',
        '천안역에서 전철에서 내립니다.',
        '1번 출구로 나갑니다.',
        {
          text: '아래 두 정류장 중 편하신 곳에서 버스를 탑니다.',
          options: [
            { stop: '동부광장(온양나드리방면)', buses: '24, 383, 400번' },
            { stop: '삼도상가(동부광장방면)', buses: '402, 500번' },
          ],
        },
        '세광엔리치빌 정류장에서 내립니다.',
      ],
      // 버스는 동부광장 정류장, 셔틀은 동부광장 건너편으로 서는 자리가 다르다. '1번 출구'까지만 공통으로 묶는다.
      railToShuttle: '천안역 1번 출구에서는 셔틀버스도 타실 수 있습니다. 승차 위치는 아래 셔틀버스 안내를 봐 주세요.',
    },
  },
  family: {
    groomLine: '박주연 강순호의 삼남 박비오',
    brideLine: '조현식 이경화의 장녀 조예나',
  },
  concepts: {
    regency: {
      invitation: '겨울볕이 가장 따뜻한 시각에, 두 사람이 서로의 이름을 나란히 적기로 했습니다. 오래 이어 온 마음에 매듭을 짓는 자리입니다. 귀한 걸음으로 함께해 주시면 그 하루가 오래도록 따뜻하게 남겠습니다.',
      formal: '서로를 향해 걸어온 두 길이 이제 하나가 됩니다. 저희의 첫걸음에 함께하시어 따뜻한 축복으로 자리를 채워 주세요.',
      closing: '따뜻한 차 한 잔의 온기로, 그날 뵙겠습니다.',
    },
    midnight: {
      invitation: '겨울의 한가운데에서, 두 사람이 평생 함께 걸을 한 곡의 첫 박자를 맞춥니다. 오래 기다려 온 이 하루에 귀한 걸음으로 함께해 주시면 더없는 기쁨이겠습니다.',
      formal: '두 사람이 서로에게 평생의 예를 갖추어 약속을 나눕니다. 오셔서 저희의 첫 약속을 지켜봐 주세요.',
      formalLine1: '두 사람이 서로에게 평생의 예를 갖추어 약속을 나눕니다.',
      formalLine2: '오셔서 저희의 첫 약속을 지켜봐 주세요.',
      closingLine1: '첫 걸음을 함께 세어 주신 분들께,',
      closingLine2: '오래 감사하겠습니다.',
    },
    garden: {
      invitation: '겨울에도 푸른 온실처럼, 계절이 바뀌어도 변하지 않는 마음으로 두 사람이 함께 서기로 했습니다. 저희가 가꾸어 갈 첫 계절에 귀한 걸음으로 함께해 주세요.',
      formal: '여러 계절을 지나며 서로를 지켜 온 두 사람이 이제 한 집을 이룹니다. 오셔서 저희의 첫 계절을 축복해 주세요.',
      closing: '저희가 가꾸어 갈 계절마다, 오늘의 축복을 기억하겠습니다.',
    },
  },
  // 신랑측 → 신부측 순. 실계좌는 배포 오버레이에서만 채워지며 이 저장소에는 자리표시자만 둔다.
  accounts: {
    groomMother: revealAccount('6rSR7KO87J2A7ZaJIDc0MS0xMjEtMDE0NzQ4IOuwleyjvOyXsA=='),
    groom: revealAccount('7Iug7ZWc7J2A7ZaJIDExMC0zOTMtOTUzMjM4IOuwleu5hOyYpA=='),
    brideFather: revealAccount('7Jqw66as7J2A7ZaJIDI0MC0xMDc4NTctMTItMDAxIOyhsO2YhOyLnQ=='),
    bride: revealAccount('7Lm07Lm07Jik67GF7YGsIDMzMzMtMjYtMTk1NDE5MSDsobDsmIjrgpg='),
  },
  site: { url: '' },
  rsvp: { endpoint: '' },
  guestbook: { endpoint: '' },
});
