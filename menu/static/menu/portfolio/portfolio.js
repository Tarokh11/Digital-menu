(() => {
  "use strict";
  const data = document.getElementById("project-data");
  const grid = document.getElementById("destination-cards");
  if (!data || !grid) return;
  const projects = new Map(
    JSON.parse(data.textContent).map((project) => [project.slug, project]),
  );
  const cards = [...grid.querySelectorAll("[data-project]")];
  const filters = [...document.querySelectorAll("[data-filter]")];
  const pager = document.querySelector(".gallery-pagination");
  const prev = document.querySelector(".page-prev");
  const next = document.querySelector(".page-next");
  const status = document.getElementById("page-status");
  const dialog = document.getElementById("project-reveal");
  const overlay = document.querySelector(".portal-transition");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
  const gsap = window.gsap;
  const Draggable = window.Draggable;
  const number = new Intl.NumberFormat("fa-IR");
  const pageSize = 6;
  document.querySelector(".gallery-toolbar").hidden = false;
  document.querySelector(".touch-hint").hidden = false;
  document.querySelectorAll(".project-open").forEach((button) => {
    button.hidden = false;
  });
  const drags = new Map();
  let filtered = cards.slice();
  let pageIndex = 0;
  let active = null;
  let dragging = null;
  let busy = false;
  let opener = null;
  let returnHash = "";
  let suppressClickUntil = 0;
  let openingTimeline = null;

  const activate = (card) => {
    if (busy || dialog.open || (dragging && dragging !== card)) return;
    if (active && active !== card) active.classList.remove("is-active");
    active = card;
    card.classList.add("is-active");
    const project = projects.get(card.dataset.project);
    if (!card.dataset.prefetched) {
      new Image().src = project.mobile_url;
      card.dataset.prefetched = "true";
    }
  };

  const deactivate = (card) => {
    if (busy || dragging === card || card.contains(document.activeElement))
      return;
    card.classList.remove("is-active");
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
    if (active === card) active = null;
  };

  const resetDrag = (card, immediate = false) => {
    card.classList.remove("is-dragging", "is-portal-ready");
    card.querySelector(".portal-label").textContent = "ورود";
    const drag = drags.get(card);
    if (gsap) {
      const layer = card.querySelector(".project-drag");
      gsap.killTweensOf(layer);
      gsap.to(layer, {
        x: 0,
        y: 0,
        rotationY: 0,
        rotationZ: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        duration: immediate || reduced.matches ? 0 : 0.45,
        ease: "power3.out",
        onComplete: () => gsap.set(layer, { clearProps: "transform,opacity" }),
      });
      if (drag) {
        gsap.set(drag.target, { x: 0 });
        drag.update();
      }
    }
    if (dragging === card) dragging = null;
  };

  const render = (scroll = false) => {
    if (active) {
      resetDrag(active, true);
      active.classList.remove("is-active");
      active = null;
    }
    const start = pageIndex * pageSize;
    const visible = new Set(filtered.slice(start, start + pageSize));
    cards.forEach((card) => {
      card.hidden = !visible.has(card);
    });
    pager.hidden = filtered.length <= pageSize;
    prev.disabled = pageIndex === 0;
    next.disabled = start + pageSize >= filtered.length;
    status.textContent = `${number.format(start + 1)} تا ${number.format(Math.min(start + pageSize, filtered.length))} از ${number.format(filtered.length)} پروژه`;
    document.querySelector(".project-count b").textContent = number.format(
      filtered.length,
    );
    if (
      scroll &&
      document.getElementById("work").getBoundingClientRect().top < 0
    ) {
      document
        .getElementById("work")
        .scrollIntoView({
          behavior: reduced.matches ? "instant" : "smooth",
          block: "start",
        });
    }
    drags.forEach((drag, card) => {
      if (!card.hidden)
        drag.applyBounds({ minX: -40, maxX: card.clientWidth * 0.7 });
    });
  };

  filters.forEach((button) =>
    button.addEventListener("click", () => {
      if (busy) return;
      filters.forEach((filter) =>
        filter.setAttribute("aria-pressed", String(filter === button)),
      );
      filtered = cards.filter(
        (card) =>
          button.dataset.filter === "all" ||
          card.dataset.group === button.dataset.filter,
      );
      pageIndex = 0;
      render();
    }),
  );
  prev.addEventListener("click", () => {
    if (!busy && pageIndex > 0) {
      pageIndex--;
      render(true);
    }
  });
  next.addEventListener("click", () => {
    if (!busy && (pageIndex + 1) * pageSize < filtered.length) {
      pageIndex++;
      render(true);
    }
  });

  const populate = (project) => {
    dialog.style.setProperty("--project-color", project.color);
    document.getElementById("reveal-category").textContent = project.category;
    document.getElementById("reveal-title").textContent = project.name;
    document.getElementById("reveal-description").textContent =
      project.description;
    document.getElementById("reveal-live").href = project.url;
    document.getElementById("reveal-commission").href =
      `https://wa.me/989194131050?text=${encodeURIComponent(`سلام، نمونهٔ «${project.name}» را دیدم و دوست دارم دربارهٔ پروژهٔ خودم صحبت کنیم.`)}`;
    const desktop = document.getElementById("reveal-desktop-image");
    const mobile = document.getElementById("reveal-mobile-image");
    desktop.src = project.desktop_url;
    desktop.alt = `نمای دسکتاپ ${project.name}`;
    mobile.src = project.mobile_url;
    mobile.alt = `نمای موبایل ${project.name}`;
    const url = new URL(project.url, location.origin);
    document.getElementById("reveal-domain").textContent = url.host;
    const featureList = document.getElementById("reveal-features");
    featureList.replaceChildren(
      ...project.features.map((text) => {
        const item = document.createElement("li");
        const icon = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg",
        );
        icon.classList.add("icon");
        icon.setAttribute("aria-hidden", "true");
        const use = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "use",
        );
        use.setAttribute("href", "#i-check");
        icon.append(use);
        item.append(icon, document.createTextNode(text));
        return item;
      }),
    );
  };

  const reveal = (card, animate = true) => {
    if (busy || dialog.open) return;
    const project = projects.get(card.dataset.project);
    if (!project) return;
    activate(card);
    busy = true;
    opener = card.contains(document.activeElement)
      ? document.activeElement
      : card.querySelector(".project-preview");
    returnHash = location.hash.startsWith("#project-") ? "" : location.hash;
    populate(project);
    card.setAttribute("aria-busy", "true");

    const show = () => {
      document.body.classList.add("reveal-is-open");
      dialog.showModal();
      dialog.scrollTop = 0;
      history.replaceState(
        null,
        "",
        `${location.pathname}${location.search}#project-${project.slug}`,
      );
      card.removeAttribute("aria-busy");
      resetDrag(card, true);
      card.classList.remove("is-active");
      active = null;
      busy = false;
      if (gsap && !reduced.matches && animate) {
        gsap.fromTo(
          dialog.querySelector(".reveal-layout"),
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            clearProps: "transform,opacity",
          },
        );
      }
    };

    if (!gsap || reduced.matches || !animate) {
      show();
      return;
    }
    const portal = card.querySelector(".portal");
    const layer = card.querySelector(".project-drag");
    const p = portal.getBoundingClientRect();
    const image = layer.getBoundingClientRect();
    const cx = p.left + p.width / 2;
    const cy = p.top + p.height / 2;
    const x = Number(gsap.getProperty(layer, "x")) || 0;
    const y = Number(gsap.getProperty(layer, "y")) || 0;
    const dx = cx - image.left - image.width / 2;
    const dy = cy - image.top - image.height / 2;
    overlay.style.setProperty("--origin-x", `${cx}px`);
    overlay.style.setProperty("--origin-y", `${cy}px`);
    overlay.style.setProperty("--transition-color", project.color);
    gsap.set(overlay, {
      visibility: "visible",
      opacity: 1,
      clipPath: `circle(0px at ${cx}px ${cy}px)`,
    });
    gsap.killTweensOf(layer);
    openingTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, {
          visibility: "hidden",
          clearProps: "opacity,clipPath",
        });
        gsap.set(portal, { clearProps: "transform" });
        openingTimeline = null;
      },
    });
    openingTimeline
      .to(layer, {
        x: x + dx * 0.58,
        y: y + dy * 0.5,
        scaleX: 1.15,
        scaleY: 0.83,
        rotationY: 23,
        duration: 0.22,
        ease: "power2.in",
      })
      .to(layer, {
        x: x + dx,
        y: y + dy,
        scaleX: 0.025,
        scaleY: 1.18,
        rotationY: 80,
        rotationZ: -7,
        opacity: 0,
        duration: 0.3,
        ease: "power3.in",
      })
      .to(portal, { scale: 1.22, duration: 0.3, ease: "power2.out" }, 0.17)
      .to(
        overlay,
        {
          clipPath: `circle(145vmax at ${cx}px ${cy}px)`,
          duration: 0.43,
          ease: "power3.inOut",
        },
        0.36,
      )
      .call(show)
      .to(overlay, { opacity: 0, duration: 0.2 });
  };

  const close = () => {
    if (dialog.open) dialog.close();
  };
  dialog.querySelector(".reveal-close").addEventListener("click", close);
  dialog.querySelector(".reveal-brand").addEventListener("click", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...dialog.querySelectorAll(
        'button:not([disabled]),a[href]:not([tabindex="-1"])',
      ),
    ].filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  dialog.addEventListener("close", () => {
    if (openingTimeline) {
      openingTimeline.kill();
      openingTimeline = null;
    }
    if (gsap)
      gsap.set(overlay, {
        visibility: "hidden",
        clearProps: "opacity,clipPath",
      });
    document.body.classList.remove("reveal-is-open");
    history.replaceState(
      null,
      "",
      `${location.pathname}${location.search}${returnHash}`,
    );
    busy = false;
    if (opener && !opener.closest("[hidden]"))
      opener.focus({ preventScroll: true });
  });

  if (gsap && Draggable) gsap.registerPlugin(Draggable);
  cards.forEach((card) => {
    const preview = card.querySelector(".project-preview");
    preview.addEventListener("click", (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;
      event.preventDefault();
      if (Date.now() >= suppressClickUntil) reveal(card);
    });
    card
      .querySelector(".project-open")
      .addEventListener("click", () => reveal(card));
    card.addEventListener("pointerenter", (event) => {
      if (event.pointerType !== "touch") activate(card);
    });
    card.addEventListener("pointerleave", () => deactivate(card));
    card.addEventListener("focusin", () => activate(card));
    card.addEventListener("focusout", () =>
      requestAnimationFrame(() => deactivate(card)),
    );
    card.addEventListener("pointermove", (event) => {
      if (
        !finePointer.matches ||
        reduced.matches ||
        dragging ||
        busy ||
        active !== card
      )
        return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty(
        "--tilt-x",
        `${((event.clientY - rect.top) / rect.height - 0.5) * -4}deg`,
      );
      card.style.setProperty(
        "--tilt-y",
        `${((event.clientX - rect.left) / rect.width - 0.5) * 5}deg`,
      );
    });
    if (!gsap || !Draggable) return;
    const proxy = document.createElement("span");
    proxy.className = "drag-proxy";
    proxy.setAttribute("aria-hidden", "true");
    card.querySelector(".project-space").append(proxy);
    const layer = card.querySelector(".project-drag");
    const drag = Draggable.create(proxy, {
      trigger: preview,
      type: "x",
      dragClickables: true,
      allowNativeTouchScrolling: true,
      minimumMovement: 7,
      zIndexBoost: false,
      edgeResistance: 0.7,
      bounds: { minX: -40, maxX: card.clientWidth * 0.7 },
      onPress() {
        if (busy || dialog.open) {
          this.endDrag();
          return;
        }
        gsap.killTweensOf(layer);
        activate(card);
      },
      onDragStart() {
        dragging = card;
        card.classList.add("is-dragging");
      },
      onDrag() {
        const progress = gsap.utils.clamp(
          0,
          1,
          this.x / (card.clientWidth * 0.27),
        );
        gsap.set(layer, {
          x: this.x,
          y: reduced.matches ? 0 : -progress * 7,
          scaleX: reduced.matches ? 1 : 1 + progress * 0.13,
          scaleY: reduced.matches ? 1 : 1 - progress * 0.09,
          rotationY: reduced.matches ? 0 : progress * 21,
          rotationZ: reduced.matches ? 0 : -progress * 2,
          force3D: true,
        });
        card.classList.toggle("is-portal-ready", progress > 0.75);
        card.querySelector(".portal-label").textContent =
          progress > 0.75 ? "رها کن" : "به سمت پورتال";
      },
      onDragEnd() {
        suppressClickUntil = Date.now() + 700;
        if (this.x > card.clientWidth * 0.205) reveal(card);
        else {
          resetDrag(card);
          deactivate(card);
        }
      },
    })[0];
    // The zero-size proxy can make Draggable choose "manipulation"; the visual
    // trigger must reserve horizontal gestures while keeping vertical scrolling.
    preview.style.touchAction = "pan-y";
    drags.set(card, drag);
  });

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      drags.forEach((drag, card) =>
        drag.applyBounds({ minX: -40, maxX: card.clientWidth * 0.7 }),
      );
    }, 180);
  });
  const openHash = () => {
    const slug = location.hash.replace(/^#project-/, "");
    const card = cards.find((item) => item.dataset.project === slug);
    if (!card || dialog.open) return;
    filtered = cards.slice();
    pageIndex = Math.floor(cards.indexOf(card) / pageSize);
    render();
    reveal(card, false);
  };
  addEventListener("hashchange", openHash);
  render();
  openHash();
  if (gsap && !reduced.matches && !dialog.open) {
    gsap.from(".studio-intro", {
      opacity: 0,
      y: 12,
      duration: 0.65,
      ease: "power2.out",
      clearProps: "transform,opacity",
    });
    gsap.from(
      cards
        .filter((card) => !card.hidden)
        .map((card) => card.querySelector(".project-space")),
      {
        opacity: 0,
        y: 12,
        duration: 0.7,
        stagger: 0.045,
        delay: 0.12,
        ease: "power2.out",
        clearProps: "transform,opacity",
      },
    );
  }
})();
