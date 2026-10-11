const novaSearch = document.querySelector("#nova-search");
const novaForm = document.querySelector("#nova-search-form");
const novaCards = [...document.querySelectorAll("[data-nova-card]")];
const novaSections = [...document.querySelectorAll("[data-nova-section]")];
const novaLinks = [...document.querySelectorAll(".nova-tabs [data-menu-jump]")];
const novaClear = document.querySelector("#nova-clear-search");
const novaEmpty = document.querySelector("#nova-empty");
const novaStatus = document.querySelector("#nova-search-status");
const novaControls = document.querySelector("#nova-controls");

const normalizeNovaText = (value) => value.normalize("NFKC").replace(/[يى]/g, "ی").replace(/ك/g, "ک").replace(/\u200c/g, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase("fa");
const novaMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
const setNovaActive = (target) => {
  novaLinks.forEach((link) => {
    if (link.getAttribute("href") === target) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
};
const filterNovaProducts = () => {
  const query = normalizeNovaText(novaSearch.value);
  let count = 0;
  novaCards.forEach((card) => {
    card.hidden = !normalizeNovaText(card.dataset.search).includes(query);
    if (!card.hidden) count += 1;
  });
  novaSections.forEach((section) => {
    section.hidden = ![...section.querySelectorAll("[data-nova-card]")].some((card) => !card.hidden);
  });
  novaClear.hidden = !query;
  novaEmpty.hidden = count !== 0;
  novaStatus.textContent = query ? `${new Intl.NumberFormat("fa-IR").format(count)} نوشیدنی پیدا شد` : "";
  if (query) setNovaActive("#menu-catalog");
};
const resetNovaSearch = () => {
  novaSearch.value = "";
  filterNovaProducts();
};
novaSearch.addEventListener("input", filterNovaProducts);
novaForm.addEventListener("submit", (event) => { event.preventDefault(); filterNovaProducts(); });
novaClear.addEventListener("click", () => { resetNovaSearch(); novaSearch.focus(); });
document.querySelector("#nova-show-all").addEventListener("click", () => { resetNovaSearch(); novaSearch.focus(); });

const updateNovaNavHeight = () => {
  document.body.style.setProperty("--nova-nav-height", `${novaControls.getBoundingClientRect().height}px`);
};
updateNovaNavHeight();
if ("ResizeObserver" in window) new ResizeObserver(updateNovaNavHeight).observe(novaControls);
else window.addEventListener("resize", updateNovaNavHeight);

document.querySelectorAll("[data-menu-jump]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    event.preventDefault();
    resetNovaSearch();
    setNovaActive(href);
    history.replaceState(null, "", href);
    target.scrollIntoView({ behavior: novaMotion(), block: "start" });
  });
});
