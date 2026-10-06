const searchForm = document.querySelector("#menu-search-form");
const searchInput = document.querySelector("#menu-search-input");
const categoryButtons = [...document.querySelectorAll("[data-category]")];
const categorySections = [...document.querySelectorAll("[data-category-section]")];
const productOptions = [...document.querySelectorAll("[data-product-option]")];
const itemRails = [...document.querySelectorAll(".item-rail")];
const visibleCount = document.querySelector("#visible-count");
const noResults = document.querySelector("#no-results");
const backToTop = document.querySelector("#back-to-top");

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
  let activeCategory = "همه";

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

  const selectCenteredProduct = (rail) => {
    const railRect = rail.getBoundingClientRect();
    const railCenter = railRect.left + railRect.width / 2;
    const railOptions = [...rail.querySelectorAll("[data-product-option]")]
      .filter((option) => !option.hidden);
    const visibleOptions = railOptions
      .map((option) => {
        const rect = option.getBoundingClientRect();
        const visibleWidth = Math.max(
          0,
          Math.min(rect.right, railRect.right) - Math.max(rect.left, railRect.left),
        );

        return {
          option,
          rect,
          visible: visibleWidth / rect.width,
          distance: Math.abs(rect.left + rect.width / 2 - railCenter),
        };
      })
      .filter(({visible}) => visible >= 0.5)
      .sort((first, second) => first.distance - second.distance);

    const firstOption = visibleOptions.find(({option}) => option === railOptions[0]);
    const lastOption = visibleOptions.find(({option}) => option === railOptions[railOptions.length - 1]);
    const direction = getComputedStyle(rail).direction;
    const leadingOption = direction === "rtl" ? firstOption : lastOption;
    const trailingOption = direction === "rtl" ? lastOption : firstOption;
    const edgeOffset = 4;
    const reachesLeadingEdge = leadingOption && (direction === "rtl"
      ? leadingOption.rect.right >= railRect.right - edgeOffset
      : leadingOption.rect.left <= railRect.left + edgeOffset);
    const reachesTrailingEdge = trailingOption && (direction === "rtl"
      ? trailingOption.rect.left <= railRect.left + edgeOffset
      : trailingOption.rect.right >= railRect.right - edgeOffset);

    if (reachesLeadingEdge) {
      selectProduct(leadingOption.option);
    } else if (reachesTrailingEdge) {
      selectProduct(trailingOption.option);
    } else if (visibleOptions[0]) {
      selectProduct(visibleOptions[0].option);
    }
  };

  const filterProducts = () => {
    const query = searchInput.value.trim().toLocaleLowerCase("fa");
    let count = 0;

    categorySections.forEach((section) => {
      const matchesCategory = activeCategory === "همه" || section.dataset.categorySection === activeCategory;
      const options = [...section.querySelectorAll("[data-product-option]")];

      options.forEach((option) => {
        const matchesSearch = option.dataset.search.toLocaleLowerCase("fa").includes(query);
        option.hidden = !matchesSearch;
        if (matchesCategory && matchesSearch) count += 1;
      });

      const firstVisibleOption = options.find((option) => !option.hidden);
      section.hidden = !matchesCategory || !firstVisibleOption;
      if (!section.hidden && section.querySelector(".menu-option.is-selected")?.hidden) {
        selectProduct(firstVisibleOption);
      }
    });

    if (visibleCount) visibleCount.textContent = new Intl.NumberFormat("fa-IR").format(count);
    noResults.hidden = count !== 0;
  };

  productOptions.forEach((option) => {
    option.addEventListener("click", () => selectProduct(option));
  });

  itemRails.forEach((rail) => {
    let frameRequested = false;

    rail.addEventListener("scroll", () => {
      if (frameRequested) return;
      frameRequested = true;
      requestAnimationFrame(() => {
        frameRequested = false;
        selectCenteredProduct(rail);
      });
    }, {passive: true});
  });

  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterProducts();
  });
  searchInput.addEventListener("input", filterProducts);

  categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      categoryButtons.forEach((item) => {
        const selected = item === button;
        item.classList.toggle("is-active", selected);
        item.setAttribute("aria-pressed", String(selected));
      });
      filterProducts();

      if (activeCategory !== "همه") {
        const section = categorySections.find((item) => item.dataset.categorySection === activeCategory);
        section?.scrollIntoView({behavior: "smooth", block: "start"});
      }
    });
  });
}
