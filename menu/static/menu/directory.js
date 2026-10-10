(() => {
  'use strict';
  const grid = document.querySelector('#destination-cards');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.destination-card'));
  const toolbar = document.querySelector('.destination-toolbar');
  const toggle = document.querySelector('.view-toggle');
  const label = toggle.querySelector('.view-toggle-label');
  const controls = document.querySelector('.deck-controls');
  const hint = document.querySelector('.deck-hint');
  const counter = document.querySelector('.deck-counter');
  const number = new Intl.NumberFormat('fa-IR');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let deck = false;
  let index = 0;
  let busy = false;
  let drag = null;
  let suppressClickUntil = 0;
  let previewStep = 1;
  let frame = 0;
  let animations = [];
  let animationVersion = 0;
  const render = () => {
    grid.classList.toggle('is-deck', deck);
    toggle.setAttribute('aria-pressed', String(deck));
    label.textContent = deck ? 'نمایش همهٔ کارت‌ها' : 'نمایش دسته‌کارت';
    controls.hidden = hint.hidden = !deck;
    if (deck) grid.setAttribute('aria-describedby', 'deck-hint');
    else grid.removeAttribute('aria-describedby');
    cards.forEach((card, position) => {
      const depth = ((position - index) * previewStep + cards.length) % cards.length;
      card.dataset.depth = String(depth);
      card.classList.remove('is-dragging', 'is-outgoing');
      card.style.removeProperty('--drag-x');
      card.style.removeProperty('--drag-angle');
      card.inert = deck && depth !== 0;
      card.tabIndex = deck && depth !== 0 ? -1 : 0;
      if (deck && depth !== 0) card.setAttribute('aria-hidden', 'true');
      else card.removeAttribute('aria-hidden');
    });
    counter.textContent = number.format(index + 1) + ' از ' + number.format(cards.length);
  };
  const stage = step => {
    previewStep = step;
    cards.forEach((card, position) => {
      card.dataset.depth = String(((position - index) * step + cards.length) % cards.length);
    });
  };
  const paintDrag = () => {
    frame = 0;
    if (!drag || !drag.horizontal) return;
    drag.card.style.setProperty('--drag-x', drag.dx + 'px');
    drag.card.style.setProperty('--drag-angle', Math.max(-12, Math.min(12, drag.dx / 28)) + 'deg');
  };
  const advance = async (step, offset = 0) => {
    if (!deck || busy || cards.length < 2) return;
    busy = true;
    const version = ++animationVersion;
    stage(step);
    const outgoing = cards[index];
    const incoming = cards[(index + step + cards.length) % cards.length];
    const incomingStyle = window.getComputedStyle(incoming);
    const incomingStart = { transform: incomingStyle.transform, opacity: incomingStyle.opacity };
    const distance = outgoing.clientWidth + 100;
    const exit = step > 0 ? -distance : distance;
    const angle = Math.max(-12, Math.min(12, offset / 28));
    const duration = reducedMotion.matches ? 0 : 380;
    index = (index + step + cards.length) % cards.length;
    render();
    outgoing.classList.add('is-outgoing');
    const timing = { duration, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'both' };
    animations = [
      outgoing.animate([
        { transform: 'translate3d(' + offset + 'px, 0, 0) rotate(' + angle + 'deg)', opacity: 1 },
        { transform: 'translate3d(' + exit + 'px, 12px, 0) rotate(' + (step > 0 ? -18 : 18) + 'deg)', opacity: 0 }
      ], timing),
      incoming.animate([
        incomingStart,
        { transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)', opacity: 1 }
      ], timing)
    ];
    await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    if (version !== animationVersion) return;
    outgoing.classList.remove('is-outgoing');
    animations.forEach(animation => animation.cancel());
    animations = [];
    busy = false;
  };
  toggle.addEventListener('click', () => {
    ++animationVersion;
    animations.forEach(animation => animation.cancel());
    animations = [];
    window.cancelAnimationFrame(frame);
    frame = 0;
    busy = false;
    drag = null;
    deck = !deck;
    render();
  });
  document.querySelector('.deck-next').addEventListener('click', () => advance(1));
  document.querySelector('.deck-prev').addEventListener('click', () => advance(-1));
  grid.addEventListener('keydown', event => {
    if (!deck || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    // Keep focus on an available control when the focused card leaves the deck.
    document.querySelector(event.key === 'ArrowLeft' ? '.deck-next' : '.deck-prev').focus();
    advance(event.key === 'ArrowLeft' ? 1 : -1);
  });
  grid.addEventListener('pointerdown', event => {
    if (!deck || busy || !event.isPrimary || event.button !== 0) return;
    const card = event.target.closest('.destination-card');
    if (card !== cards[index]) return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, card, dx: 0, velocity: 0, lastX: event.clientX, lastTime: event.timeStamp, horizontal: false };
  });
  grid.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    if (!drag.horizontal) {
      if (Math.abs(dy) > 10 && Math.abs(dy) > Math.abs(dx)) { drag = null; return; }
      if (Math.abs(dx) < 8) return;
      drag.horizontal = true;
      drag.card.setPointerCapture(event.pointerId);
      drag.card.classList.add('is-dragging');
    }
    const elapsed = event.timeStamp - drag.lastTime;
    if (elapsed > 0) drag.velocity = (event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastTime = event.timeStamp;
    drag.dx = dx;
    stage(dx < 0 ? 1 : -1);
    if (!frame) frame = window.requestAnimationFrame(paintDrag);
  });
  const finishDrag = (event, cancelled = false) => {
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag;
    window.cancelAnimationFrame(frame);
    frame = 0;
    paintDrag();
    drag = null;
    if (current.card.hasPointerCapture(event.pointerId)) current.card.releasePointerCapture(event.pointerId);
    if (current.horizontal) suppressClickUntil = Date.now() + 400;
    const flick = Math.abs(current.dx) > 20 && Math.abs(current.velocity) > .45 &&
      event.timeStamp - current.lastTime < 100;
    if (!cancelled && (Math.abs(current.dx) > Math.min(64, current.card.clientWidth * .18) || flick)) {
      advance(current.dx < 0 ? 1 : -1, current.dx);
    } else render();
  };
  grid.addEventListener('pointerup', event => finishDrag(event));
  grid.addEventListener('pointercancel', event => finishDrag(event, true));
  grid.addEventListener('lostpointercapture', event => finishDrag(event, true));
  grid.addEventListener('click', event => {
    if (deck && (busy || Date.now() < suppressClickUntil)) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
  grid.addEventListener('dragstart', event => { if (deck) event.preventDefault(); });
  toolbar.hidden = false;
  render();
})();
