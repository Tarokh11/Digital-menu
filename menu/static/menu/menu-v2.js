const searchForm = document.querySelector("#menu-search-form");
const searchInput = document.querySelector("#menu-search-input");
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const categorySections = [...document.querySelectorAll("[data-category-section]")];
const productOptions = [...document.querySelectorAll("[data-product-option]")];
const itemRails = [...document.querySelectorAll(".item-rail")];
const visibleCount = document.querySelector("#visible-count");
const noResults = document.querySelector("#no-results");
const backToTop = document.querySelector("#back-to-top");

const menuSettings = document.querySelector("#menu-settings");
const themeOptions = [...document.querySelectorAll("[data-theme]")];
if (menuSettings && themeOptions.length) {
  const themeKey = "vita-menu-v2-theme";
  const validThemes = new Set(themeOptions.map((option) => option.dataset.theme));
  const applyTheme = (theme) => {
    const selectedTheme = validThemes.has(theme) ? theme : "mint";
    document.body.dataset.menuTheme = selectedTheme;
    themeOptions.forEach((option) => {
      option.setAttribute("aria-pressed", String(option.dataset.theme === selectedTheme));
    });
  };

  try { applyTheme(localStorage.getItem(themeKey)); }
  catch { applyTheme("mint"); }

  themeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      applyTheme(option.dataset.theme);
      try { localStorage.setItem(themeKey, option.dataset.theme); } catch { /* The theme still works without storage. */ }
      menuSettings.open = false;
      menuSettings.querySelector("summary").focus({preventScroll: true});
    });
  });
  document.addEventListener("click", (event) => {
    if (!menuSettings.contains(event.target)) menuSettings.open = false;
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuSettings.open) {
      menuSettings.open = false;
      menuSettings.querySelector("summary").focus({preventScroll: true});
    }
  });
}

if (backToTop) {
  const updateBackToTop = () => {
    backToTop.hidden = window.scrollY < 500;
  };

  window.addEventListener("scroll", updateBackToTop, {passive: true});
  updateBackToTop();
  backToTop.addEventListener("click", () => {
    window.scrollTo({top: 0, behavior: "smooth"});
  });
}

if (searchForm && searchInput) {
  const categoryNav = document.querySelector(".category-scroll");
  const scrollBehavior = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";

  const selectProduct = (option) => {
    const section = option.closest("[data-category-section]");
    if (option.classList.contains("is-selected")) return;
    const panel = section.querySelector("[data-feature-panel]");
    const badge = panel.querySelector("[data-feature-badge]");
    const image = panel.querySelector("[data-feature-image]");

    section.querySelectorAll("[data-product-option]").forEach((item) => {
      const selected = item === option;
      item.classList.toggle("is-selected", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    panel.querySelector("[data-feature-name]").textContent = option.dataset.name;
    panel.querySelector("[data-feature-description]").textContent = option.dataset.description;
    const price = panel.querySelector("[data-feature-price]");
    if (price) price.textContent = option.dataset.price;
    badge.textContent = option.dataset.badge;
    badge.hidden = !option.dataset.badge;
    image.src = option.dataset.image;
    image.alt = option.dataset.name;
    panel.classList.remove("is-changing");
    requestAnimationFrame(() => panel.classList.add("is-changing"));
  };

  const centerOption = (rail, option, behavior = scrollBehavior()) => {
    if (!rail.classList.contains("is-scrollable") || !option) return;
    const railRect = rail.getBoundingClientRect();
    const optionRect = option.getBoundingClientRect();
    rail.scrollBy({left: optionRect.left + optionRect.width / 2 - railRect.left - rail.clientWidth / 2, behavior});
  };

  const selectCenteredProduct = (rail) => {
    if (!rail.classList.contains("is-scrollable")) return;
    const railRect = rail.getBoundingClientRect();
    const center = railRect.left + rail.clientWidth / 2;
    const options = [...rail.querySelectorAll("[data-product-option]")].filter(option => !option.hidden);
    const nearest = options.reduce((best, option) => {
      const rect = option.getBoundingClientRect();
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      const desiredScroll = rail.scrollLeft + rect.left + rect.width / 2 - center;
      const targetScroll = getComputedStyle(rail).direction === "rtl"
        ? Math.max(-maxScroll, Math.min(0, desiredScroll))
        : Math.max(0, Math.min(maxScroll, desiredScroll));
      // At the ends, the browser clamps the snap target instead of adding blank space.
      const distance = Math.abs(rail.scrollLeft - targetScroll);
      return !best || distance < best.distance ? {option, distance} : best;
    }, null);
    if (nearest) selectProduct(nearest.option);
  };

  const updateRailLayout = (rail) => {
    const options = [...rail.querySelectorAll("[data-product-option]")].filter(option => !option.hidden);
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 0;
    const totalWidth = options.reduce((width, option) => width + option.getBoundingClientRect().width, 0)
      + Math.max(0, options.length - 1) * gap;
    rail.classList.toggle("is-scrollable", totalWidth > rail.clientWidth + 1);
    centerOption(rail, options.find(option => option.classList.contains("is-selected")), "instant");
  };

  const filterProducts = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("fa");
    let count = 0;

    categorySections.forEach((section) => {
      const options = [...section.querySelectorAll("[data-product-option]")];

      options.forEach((option) => {
        const matchesSearch = option.dataset.search.toLocaleLowerCase("fa").includes(query);
        option.hidden = !matchesSearch;
        if (matchesSearch) count += 1;
      });

      const firstVisibleOption = options.find((option) => !option.hidden);
      section.hidden = !firstVisibleOption;
      if (!section.hidden && section.querySelector(".menu-option.is-selected")?.hidden) {
        selectProduct(firstVisibleOption);
      }
      if (!section.hidden) updateRailLayout(section.querySelector(".item-rail"));
    });

    if (visibleCount) visibleCount.textContent = new Intl.NumberFormat("fa-IR").format(count);
    noResults.hidden = count !== 0;
  };

  // Keep an explicit click selected until the user scrolls the rail again.
  const explicitlySelectedRails = new WeakSet();
  productOptions.forEach((option) => {
    option.addEventListener("click", () => {
      explicitlySelectedRails.add(option.closest(".item-rail"));
      selectProduct(option);
      centerOption(option.closest(".item-rail"), option);
    });
  });

  itemRails.forEach((rail) => {
    let settleTimer;
    const resumeScrollSelection = () => explicitlySelectedRails.delete(rail);
    rail.addEventListener("pointerdown", resumeScrollSelection, {passive: true});
    rail.addEventListener("wheel", resumeScrollSelection, {passive: true});
    rail.addEventListener("keydown", (event) => {
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) resumeScrollSelection();
    });
    const finishScroll = () => {
      clearTimeout(settleTimer);
      if (!explicitlySelectedRails.has(rail)) selectCenteredProduct(rail);
    };
    rail.addEventListener("scroll", () => {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finishScroll, 160);
    }, {passive: true});
    rail.addEventListener("scrollend", finishScroll);
    new ResizeObserver(() => updateRailLayout(rail)).observe(rail);
    updateRailLayout(rail);
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterProducts();
  });
  searchInput.addEventListener("input", filterProducts);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedCategory = button.dataset.category;
      categoryButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      // Category buttons navigate the full menu; only the search filters products.
      searchInput.value = "";
      categorySections.forEach((section) => { section.hidden = false; });
      productOptions.forEach((option) => { option.hidden = false; });
      itemRails.forEach(updateRailLayout);
      if (visibleCount) visibleCount.textContent = new Intl.NumberFormat("fa-IR").format(productOptions.length);
      noResults.hidden = true;
      const section = selectedCategory === "همه"
        ? document.querySelector(".products-section")
        : categorySections.find((item) => item.dataset.categorySection === selectedCategory);
      if (section) {
        const offset = (categoryNav?.getBoundingClientRect().height ?? 0) + 20;
        window.scrollTo({
          top: Math.max(0, window.scrollY + section.getBoundingClientRect().top - offset),
          behavior: scrollBehavior(),
        });
      }
    });
  });
}
