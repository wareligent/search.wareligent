/* ====================================
   Wareligent Core Logic
==================================== */

(() => {
  "use strict";

  const searchInput = document.getElementById("searchInput");
  const menuBtn = document.getElementById("menuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const menuModal = document.getElementById("menuModal");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeStatus = document.getElementById("themeStatus");
  const fireBtn = document.getElementById("fireBtn");

  /* Theme Control */
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

  /* Search Handler */
  function executeSearch() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  }

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });

  /* DuckDuckGo Fire Button Effect */
  fireBtn?.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    alert("Tabs and search history cleared!");
  });

  /* Settings Modal Handler */
  menuBtn?.addEventListener("click", () => menuModal.classList.remove("hidden"));
  closeMenuBtn?.addEventListener("click", () => menuModal.classList.add("hidden"));

  // Close menu on clicking outside
  menuModal?.addEventListener("click", (e) => {
    if (e.target === menuModal) menuModal.classList.add("hidden");
  });

  initTheme();
})();
