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
  let timer;
  const render = () => {
    grid.classList.toggle('is-deck', deck);
    toggle.setAttribute('aria-pressed', String(deck));
    label.textContent = deck ? 'نمایش همهٔ کارت‌ها' : 'نمایش دسته‌کارت';
    controls.hidden = hint.hidden = !deck;
    if (deck) grid.setAttribute('aria-describedby', 'deck-hint');
    else grid.removeAttribute('aria-describedby');
    cards.forEach((card, position) => {
      const depth = (position - index + cards.length) % cards.length;
      card.dataset.depth = String(depth);
      card.classList.remove('is-dragging', 'is-leaving');
      card.style.removeProperty('--drag-x');
      card.style.removeProperty('--drag-angle');
      card.inert = deck && depth !== 0;
      card.tabIndex = deck && depth !== 0 ? -1 : 0;
      if (deck && depth !== 0) card.setAttribute('aria-hidden', 'true');
      else card.removeAttribute('aria-hidden');
    });
    counter.textContent = number.format(index + 1) + ' از ' + number.format(cards.length);
  };
  const advance = (step, direction = step) => {
    if (!deck || busy || cards.length < 2) return;
    busy = true;
    const active = cards[index];
    active.classList.remove('is-dragging');
    active.classList.add('is-leaving');
    active.style.setProperty('--drag-x', (direction > 0 ? -1 : 1) * (grid.clientWidth + 80) + 'px');
    active.style.setProperty('--drag-angle', (direction > 0 ? -16 : 16) + 'deg');
    timer = window.setTimeout(() => {
      index = (index + step + cards.length) % cards.length;
      busy = false;
      render();
    }, reducedMotion.matches ? 0 : 240);
  };
  toggle.addEventListener('click', () => {
    window.clearTimeout(timer);
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
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, card, dx: 0, horizontal: false };
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
    drag.dx = dx;
    drag.card.style.setProperty('--drag-x', dx + 'px');
    drag.card.style.setProperty('--drag-angle', Math.max(-14, Math.min(14, dx / 22)) + 'deg');
  });
  const finishDrag = (event, cancelled = false) => {
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag;
    drag = null;
    if (current.card.hasPointerCapture(event.pointerId)) current.card.releasePointerCapture(event.pointerId);
    if (current.horizontal) suppressClickUntil = Date.now() + 400;
    if (!cancelled && Math.abs(current.dx) > Math.min(75, current.card.clientWidth * .2)) {
      advance(current.dx < 0 ? 1 : -1);
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
