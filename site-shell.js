(() => {
  const stats = window.PREPBASE_SKILL_STATS || {};
  const skills = Array.isArray(stats.skills) ? stats.skills : [];
  const companies = Array.isArray(stats.companyStats) ? stats.companyStats : [];
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("#mobileMenuButton");

  updateHeroMetrics();
  setupMobileMenu();
  setupSmoothNavigation();

  function updateHeroMetrics() {
    setMetric("#heroVacanciesMetric", stats.totalVacancies, "12k+");
    setMetric("#heroSkillsMetric", skills.length, "320+");
    setMetric("#heroCompaniesMetric", companies.length, "150+");
  }

  function setMetric(selector, value, fallback) {
    const element = document.querySelector(selector);
    if (!element) return;

    const number = Number(value || 0);
    element.textContent = number > 0 ? compactNumber(number) : fallback;
  }

  function setupMobileMenu() {
    if (!header || !menuButton) return;

    menuButton.addEventListener("click", () => {
      const isOpen = header.classList.toggle("menu-open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupSmoothNavigation() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest("a[href^='#']");
      if (!link) return;

      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      event.preventDefault();
      if (header) header.classList.remove("menu-open");
      if (menuButton) menuButton.setAttribute("aria-expanded", "false");

      const view = link.dataset.openView;
      if (view) openDashboardView(view);
      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
  }

  function openDashboardView(view) {
    const tab = [...document.querySelectorAll("[data-view-target]")].find((item) => item.dataset.viewTarget === view);
    if (tab) {
      tab.click();
      return;
    }

    document.querySelectorAll("[data-view]").forEach((section) => {
      section.classList.toggle("active", section.dataset.view === view);
    });
  }

  function getScrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }

  function compactNumber(value) {
    if (value >= 1000) {
      const compact = value / 1000;
      return `${Number.isInteger(compact) ? compact : compact.toFixed(1)}k`;
    }
    return String(value);
  }
})();
