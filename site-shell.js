(() => {
  const header = document.querySelector(".site-header");
  const menuButton = document.querySelector("#mobileMenuButton");

  setupMobileMenu();
  setupSmoothNavigation();
  setupViewButtons();

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
      closeMobileMenu();

      const view = link.dataset.openView;
      if (view) openDashboardView(view);

      target.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
    });
  }

  function setupViewButtons() {
    document.addEventListener("click", (event) => {
      const button = event.target.closest("button[data-open-view]");
      if (!button) return;

      openDashboardView(button.dataset.openView);
      document.querySelector("#dashboard")?.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
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

  function closeMobileMenu() {
    if (header) header.classList.remove("menu-open");
    if (menuButton) menuButton.setAttribute("aria-expanded", "false");
  }

  function getScrollBehavior() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
  }
})();
