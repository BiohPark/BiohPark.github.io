(function (global) {
  function getAtPath(object, path) {
    return String(path).split('.').reduce((value, key) => value?.[key], object);
  }

  function formatCountdown(now, target) {
    const remaining = Math.max(0, target.getTime() - now.getTime());
    return {
      days: Math.floor(remaining / 86_400_000),
      hours: Math.floor((remaining % 86_400_000) / 3_600_000),
      minutes: Math.floor((remaining % 3_600_000) / 60_000),
    };
  }

  function buildShareData(data, url) {
    return {
      title: `${getAtPath(data, 'couple.korean')} 결혼식에 초대합니다`,
      text: getAtPath(data, 'copy.formal'),
      url,
    };
  }

  global.InvitationCore = Object.freeze({ getAtPath, formatCountdown, buildShareData });
}(globalThis));

