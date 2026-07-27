(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const hero = document.querySelector('[data-section="hero"]');
  const profileName = document.body.dataset.motionProfile || 'regency';
  const settings = window.INVITATION_MOTION_PROFILES?.[profileName]?.particles;
  if (!hero || !settings) return;
  const canvas = document.createElement('canvas');
  canvas.className = 'particle-canvas';
  canvas.setAttribute('aria-hidden', 'true');
  hero.append(canvas);
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let frame = 0;
  let running = false;
  let last = 0;
  let particles = [];
  const random = (min, max) => min + Math.random() * (max - min);

  function reset(particle, initial = false) {
    particle.x = random(0, width);
    particle.y = initial ? random(0, height) : (settings.minY < 0 ? height + 12 : -12);
    particle.size = random(settings.minSize, settings.maxSize);
    particle.speed = random(settings.minY, settings.maxY);
    particle.phase = random(0, Math.PI * 2);
    particle.rotation = random(0, Math.PI * 2);
    particle.color = settings.colors[Math.floor(Math.random() * settings.colors.length)];
    particle.opacity = random(0.3, 0.9);
  }

  function resize() {
    const rect = hero.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = Array.from({ length: settings.count }, () => {
      const particle = {};
      reset(particle, true);
      return particle;
    });
  }

  function draw(particle, time) {
    context.save();
    context.globalAlpha = settings.type === 'dust' ? 0.2 + Math.abs(Math.sin(time / 900 + particle.phase)) * 0.7 : particle.opacity;
    context.fillStyle = particle.color;
    context.translate(particle.x, particle.y);
    context.beginPath();
    if (settings.type === 'petal') {
      context.rotate(particle.rotation);
      context.ellipse(0, 0, particle.size * 0.45, particle.size, 0, 0, Math.PI * 2);
    } else context.arc(0, 0, particle.size, 0, Math.PI * 2);
    context.fill();
    context.restore();
  }

  function tick(time) {
    if (!running) return;
    const delta = Math.min(0.04, (time - last) / 1000 || 0);
    last = time;
    context.clearRect(0, 0, width, height);
    context.globalCompositeOperation = settings.blend;
    particles.forEach((particle) => {
      particle.y += particle.speed * delta;
      if (settings.type === 'petal') {
        particle.x += Math.sin(time / (settings.period * 1000) * Math.PI * 2 + particle.phase) * settings.sway * delta;
        particle.rotation += 0.4 * delta;
      }
      if (particle.y > height + 16 || particle.y < -16) reset(particle);
      draw(particle, time);
    });
    frame = requestAnimationFrame(tick);
  }

  function start() {
    if (running || document.hidden) return;
    running = true;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  resize();
  new ResizeObserver(resize).observe(hero);
  new IntersectionObserver(([entry]) => { if (entry.isIntersecting) start(); else stop(); }, { threshold: 0.2 }).observe(hero);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
}());
