/* ====================================
   Wareligent Interactive Search Focus Mode
==================================== */

(() => {
  "use strict";

  const searchInput = document.getElementById("searchInput");
  const backBtn = document.getElementById("backBtn");
  const menuBtn = document.getElementById("menuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const menuModal = document.getElementById("menuModal");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeStatus = document.getElementById("themeStatus");
  const fireBtn = document.getElementById("fireBtn");
  const fireOverlay = document.getElementById("fireOverlay");

  /* Enter Focus Mode on Click/Focus */
  function enterSearchFocus() {
    document.body.classList.add("search-focused");
  }

  /* Exit Focus Mode */
  function exitSearchFocus() {
    document.body.classList.remove("search-focused");
    if (searchInput) searchInput.blur();
  }

  searchInput?.addEventListener("focus", enterSearchFocus);
  backBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    exitSearchFocus();
  });

  /* Search Execution */
  function executeSearch() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  }

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });

  /* Theme Controls */
  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    if (themeStatus) themeStatus.textContent = isDark ? "On" : "Off";
    localStorage.setItem("wareligent-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("wareligent-theme");
    setTheme(saved || "light");
  }

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    setTheme(isDark ? "light" : "dark");
  });

  /* DuckDuckGo Fire Effect */
  fireBtn?.addEventListener("click", () => {
    fireOverlay.classList.add("active");
    setTimeout(() => {
      if (searchInput) searchInput.value = "";
      fireOverlay.classList.remove("active");
    }, 500);
  });

  /* Settings Menu Controls */
  menuBtn?.addEventListener("click", () => menuModal.classList.add("open"));
  closeMenuBtn?.addEventListener("click", () => menuModal.classList.remove("open"));

  menuModal?.addEventListener("click", (e) => {
    if (e.target === menuModal) menuModal.classList.remove("open");
  });

  initTheme();
})();
