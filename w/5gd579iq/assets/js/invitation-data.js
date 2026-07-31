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
      naverClientId: 'egdf0t98dc',
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
    { name: '세광엔리치빌 정류장', query: '세광엔리치빌 정류장', copyLabel: '장소 이름 복사' },
    { name: 'KTX 천안아산역', query: 'KTX 천안아산역', copyLabel: '장소 이름 복사' },
    { name: '천안역', query: '천안역', copyLabel: '장소 이름 복사' },
  ],
  directions: {
    car: '내비게이션에 티웨딩 천안 또는 충청남도 천안시 동남구 목천읍 응원3길 27을 입력해 주세요.',
    summary: '세 경로 모두 세광엔리치빌 정류장에서 하차하시면 됩니다. (약 40분 소요)',
    terminalPrint: '24 · 400 · 500 외',
    stationPrint: '동부역 출구 승차 · 24 · 383 · 400 · 500',
    ktxPrint: '전철로 천안역 이동 후 동부역 출구 승차',
    terminal: '24 · 310 · 381 · 382 · 383 · 400 · 402 · 500 · 512 · 530 · 531 · 540',
    station: '24 · 383 · 400 · 401 · 500 (기차·전철 하차 후 동부역 출구에서 승차)',
    ktx: '천안아산역 → 아산역(전철) → 천안역(전철) 하차 후 동부역 출구에서 승차 · 24 · 383 · 400 · 401 · 500',
    // 정본: tasks/invitation-round6-refinement/sources/map-facts-v6.md (예식장 최종 약도 전사).
    // 주차 문장만 이전 카드(map-facts-v4)에서 가져와 병기한다 — 최종본이 반복하지 않을 뿐 모순이 아니다.
    official: {
      car: '내비게이션 "티웨딩 천안" 또는 주소 "응원3길 27" 검색 · 주차 1,500대 무료 (도착 후 주차요원의 안내를 받으세요)',
      icGuidance: '천안IC보다 독립기념관IC, 남천안IC를 이용하시면 더욱 편리합니다',
      icDistance: '독립기념관IC 6km · 7분 / 남천안IC 3.5km · 5분',
      shuttleTerminal: '신세계백화점 옆 올리브영 앞 탑승 (스타벅스·애슐리 사이) · "올리브영 천안타운" 검색',
      shuttleStation: '1번 출구 동부광장 건너편 GS25편의점 앞 탑승 · "GS25 천안역점" 검색',
      shuttleInterval: '첫 예식 1시간 전부터 20~30분 간격',
      shuttleNote: '25인승 버스로 예식에 한해 운행하며, 행사 일정과 비수기 시즌에는 운행이 변동될 수 있습니다.',
      bus: '세광엔리치빌 정류장 하차 · 24, 310, 381, 382, 383, 400, 402, 500, 512, 530, 531, 540',
      rail: '천안역에서 기차·전철 하차 후 1번 출구 동부역에서 24, 383, 400, 401, 500번 승차 · KTX 천안아산역은 아산역에서 전철을 타고 천안역에서 갈아탑니다',
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
