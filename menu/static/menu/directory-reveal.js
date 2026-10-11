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
    // Arrive quickly, brake past the resting point, then settle back.
    const animation = card.animate([
      { transform: 'translate3d(' + direction * distance + 'px,0,0)', opacity: 0, offset: 0, easing: 'cubic-bezier(.16,1,.3,1)' },
      { transform: 'translate3d(' + -direction * 9 + 'px,0,0)', opacity: 1, offset: .72, easing: 'ease-in-out' },
      { transform: 'translate3d(' + direction * 2 + 'px,0,0)', opacity: 1, offset: .9, easing: 'ease-out' },
      { transform: 'translate3d(0,0,0)', opacity: 1, offset: 1 }
    ], { duration: 720, delay, fill: 'both' });
    running.set(card, animation);
    card.classList.remove('reveal-pending');
    animation.finished.then(() => {
      if (running.get(card) !== animation) return;
      running.delete(card);
      animation.cancel();
    }).catch(() => {});
  };
  const observer = new IntersectionObserver(entries => {
    let sequence = 0;
    entries.filter(entry => entry.isIntersecting).sort((a, b) => positions.get(a.target) - positions.get(b.target)).forEach(entry => {
      enter(entry.target, Math.min(sequence++ * 70, 140));
    });
  }, { rootMargin: '0px 0px -24px 0px', threshold: .12 });

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
