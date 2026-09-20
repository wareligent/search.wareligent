/* ====================================
   Wareligent Animated Logic
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
  const fireOverlay = document.getElementById("fireOverlay");

  /* Theme Toggle Logic */
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

  /* Search Execute Function */
  function executeSearch() {
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
    }
  }

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") executeSearch();
  });

  /* DuckDuckGo Animated Fire Button Effect */
  fireBtn?.addEventListener("click", () => {
    fireBtn.classList.add("burning");
    fireOverlay.classList.add("active");

    setTimeout(() => {
      if (searchInput) searchInput.value = "";
      fireOverlay.classList.remove("active");
      fireBtn.classList.remove("burning");
    }, 600);
  });

  /* Smooth Menu Drawer Controls */
  menuBtn?.addEventListener("click", () => menuModal.classList.add("open"));
  closeMenuBtn?.addEventListener("click", () => menuModal.classList.remove("open"));

  menuModal?.addEventListener("click", (e) => {
    if (e.target === menuModal) menuModal.classList.remove("open");
  });

  initTheme();
})();
