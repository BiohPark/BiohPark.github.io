window.INVITATION_MOTION_PROFILES = Object.freeze({
  regency: {
    parallaxDepth: 0.14, kenBurnsScale: 1.06, kenBurnsOrigin: '50% 40%',
    maskFrom: 'inset(0 0 100% 0)', maskTo: 'inset(0)',
    particles: { type: 'petal', count: 18, minSize: 6, maxSize: 11, minY: 22, maxY: 38, sway: 18, period: 4.2, colors: ['rgba(155,111,114,.55)', 'rgba(183,154,98,.35)'], blend: 'normal' },
  },
  midnight: {
    parallaxDepth: 0.22, kenBurnsScale: 1.10, kenBurnsOrigin: '50% 30%',
    maskFrom: 'inset(0 100% 0 0)', maskTo: 'inset(0)',
    particles: { type: 'petal', count: 18, minSize: 6, maxSize: 11, minY: 22, maxY: 38, sway: 18, period: 4.2, colors: ['rgba(214,158,166,.5)', 'rgba(240,228,207,.32)'], blend: 'normal' },
  },
  garden: {
    parallaxDepth: 0.18, kenBurnsScale: 1.08, kenBurnsOrigin: '55% 45%',
    maskFrom: 'circle(0% at 50% 100%)', maskTo: 'circle(140% at 50% 100%)',
    particles: { type: 'spark', count: 22, minSize: 2, maxSize: 4, minY: -30, maxY: -14, colors: ['#e7ad51', '#bda66a'], blend: 'screen' },
  },
});
