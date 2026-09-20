/* ====================================
   Wareligent Logic
==================================== */

(() => {
  "use strict";

  const searchInput = document.getElementById("searchInput");
  const menuBtn = document.getElementById("menuBtn");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const menuModal = document.getElementById("menuModal");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeStatus = document.getElementById("themeStatus");

  /* Theme Toggle */
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

  /* Search handle */
  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (q) {
        window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
      }
    }
  });

  /* Menu Modal */
  menuBtn?.addEventListener("click", () => menuModal.classList.remove("hidden"));
  closeMenuBtn?.addEventListener("click", () => menuModal.classList.add("hidden"));

  initTheme();
})();
