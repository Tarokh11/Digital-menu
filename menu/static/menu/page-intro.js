/* Run in the head so the sheets are present on the first content paint. */
(() => {
  'use strict';
  const root = document.documentElement;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !Element.prototype.animate) return;
  // Back/forward restoration should keep the visitor's position immediately visible.
  const navigation = performance.getEntriesByType('navigation')[0];
  if (navigation && navigation.type === 'back_forward') return;
  let overlay;
  let finished = false;
  let animations = [];
  let watchdog;
  const interruptEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focusin'];
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(watchdog);
    root.classList.remove('intro-ready');
    animations.forEach(animation => animation.cancel());
    overlay?.remove();
    document.removeEventListener('DOMContentLoaded', start);
    interruptEvents.forEach(event => document.removeEventListener(event, finish, true));
    window.removeEventListener('pagehide', finish);
    motion.removeEventListener?.('change', onMotionChange);
  };
  const onMotionChange = event => { if (event.matches) finish(); };
  const start = () => {
    if (finished) return;
    overlay = document.querySelector('.page-intro');
    if (!overlay) { finish(); return; }
    // CSS must be available: never introduce an unstyled overlay on a failed load.
    if (getComputedStyle(overlay).position !== 'fixed') { finish(); return; }
    const directions = [
      [-88, -78, -7], [88, -78, 8], [-88, 78, 7], [88, 78, -8],
      [-12, -112, -14], [122, -10, 14], [12, 112, 12], [-122, 10, -14]
    ];
    try {
      animations = Array.from(overlay.querySelectorAll('.intro-sheet'), (sheet, index) => {
        const [x, y, angle] = directions[index];
        return sheet.animate([
          { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          { transform: 'translate3d(' + x + 'vw, ' + y + 'vh, 0) rotate(' + angle + 'deg)' }
        ], {
          duration: index < 4 ? 1100 : 1180,
          delay: 120 + (index < 4 ? index * 35 : (index - 4) * 45),
          easing: 'cubic-bezier(.65, 0, .2, 1)',
          fill: 'forwards'
        });
      });
      const signature = overlay.querySelector('.intro-signature');
      if (signature) animations.push(signature.animate([
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(.94)' }
      ], { duration: 300, delay: 100, fill: 'forwards', easing: 'ease-out' }));
      Promise.all(animations.map(animation => animation.finished)).then(finish, finish);
    } catch (_) { finish(); }
  };
  root.classList.add('intro-ready');
  // Absolute fail-open limit, including slow parsing or an unexpected animation error.
  watchdog = setTimeout(finish, 2200);
  interruptEvents.forEach(event => document.addEventListener(event, finish, { capture: true, passive: true }));
  window.addEventListener('pagehide', finish, { once: true });
  motion.addEventListener?.('change', onMotionChange);
  document.addEventListener('DOMContentLoaded', start, { once: true });
})();
