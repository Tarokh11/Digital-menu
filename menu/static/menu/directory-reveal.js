(() => {
  'use strict';
  const grid = document.querySelector('#destination-cards');
  if (!grid || !('IntersectionObserver' in window) || !('animate' in Element.prototype)) return;
  const cards = Array.from(grid.querySelectorAll('.destination-card'));
  const positions = new Map(cards.map((card, position) => [card, position]));
  const revealed = new WeakSet();
  const running = new Map();
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const inDeck = () => grid.classList.contains('is-deck');

  const stop = card => {
    const animation = running.get(card);
    if (animation) {
      running.delete(card);
      animation.cancel();
    }
    card.classList.remove('reveal-pending');
  };
  const enter = (card, delay) => {
    if (card.hidden || inDeck() || motion.matches || revealed.has(card)) return;
    revealed.add(card);
    observer.unobserve(card);
    const direction = positions.get(card) % 2 === 0 ? 1 : -1;
    const distance = Math.min(160, card.clientWidth * .45);
    const finalCard = cards.filter(candidate => !candidate.hidden).at(-1);
    const hardBrake = card === finalCard;
    const origin = direction > 0 ? '0% 100%' : '100% 100%';
    const frame = (x, y, angle, offset, easing) => ({
      transform: 'translate3d(' + x + 'px,' + y + 'px,0) rotate(' + angle + 'deg)',
      transformOrigin: origin,
      opacity: offset === 0 ? 0 : 1,
      offset,
      easing: easing || 'ease-out'
    });
    // The last visible card pivots on its leading bottom corner:
    // its trailing edge lifts under braking, lands, then settles.
    const keyframes = hardBrake ? [
      frame(direction * distance, 0, 0, 0, 'cubic-bezier(.22,.7,.22,1)'),
      frame(-direction * 14, 0, 0, .54, 'ease-out'),
      frame(-direction * 18, 0, -direction * 14, .7, 'cubic-bezier(.45,0,.85,.55)'),
      frame(-direction * 8, 3, direction * 2, .86, 'ease-out'),
      frame(direction * 2, -1, -direction * .8, .95, 'ease-in-out'),
      frame(0, 0, 0, 1)
    ] : [
      frame(direction * distance, 0, 0, 0, 'cubic-bezier(.22,.7,.22,1)'),
      frame(-direction * 9, 0, 0, .72, 'ease-in-out'),
      frame(direction * 2, 0, 0, .9, 'ease-out'),
      frame(0, 0, 0, 1)
    ];
    const animation = card.animate(keyframes, {
      duration: hardBrake ? 1320 : 980,
      delay,
      fill: 'both'
    });
    running.set(card, animation);
    card.classList.remove('reveal-pending');
    animation.finished.then(() => {
      if (running.get(card) !== animation) return;
      running.delete(card);
      animation.cancel();
    }).catch(() => {});
  };
  const triggerThreshold = .25;
  const triggerInset = Math.min(120, Math.round(window.innerHeight * .18));
  const observer = new IntersectionObserver(entries => {
    let sequence = 0;
    entries.filter(entry => entry.isIntersecting && entry.intersectionRatio >= triggerThreshold).sort((a, b) => positions.get(a.target) - positions.get(b.target)).forEach(entry => {
      enter(entry.target, Math.min(sequence++ * 70, 140));
    });
  }, { rootMargin: '0px 0px -' + triggerInset + 'px 0px', threshold: triggerThreshold });

  const sync = () => {
    observer.disconnect();
    for (const card of cards) {
      if (card.hidden || inDeck() || motion.matches) {
        stop(card);
        continue;
      }
      if (revealed.has(card)) continue;
      if (card.contains(document.activeElement)) {
        revealed.add(card);
        stop(card);
        continue;
      }
      card.classList.add('reveal-pending');
      observer.observe(card);
    }
  };
  grid.addEventListener('directory:viewchange', sync);
  grid.addEventListener('focusin', event => {
    const card = event.target.closest('.destination-card');
    if (!card) return;
    revealed.add(card);
    observer.unobserve(card);
    stop(card);
  });
  motion.addEventListener('change', sync);
  sync();
})();
