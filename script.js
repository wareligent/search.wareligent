/* =====================================================
   WARELIGENT
   Interactive Search Homepage
===================================================== */

(() => {
  "use strict";


  /* ===================================================
     ELEMENTS
  =================================================== */

  const body = document.body;

  const searchInput =
    document.getElementById("searchInput");

  const searchBox =
    document.getElementById("searchBar");

  const backBtn =
    document.getElementById("backBtn");

  const clearBtn =
    document.getElementById("clearBtn");

  const aiSparkBtn =
    document.getElementById("aiSparkBtn");

  const fireBtn =
    document.getElementById("fireBtn");

  const fireOverlay =
    document.getElementById("fireOverlay");

  const menuBtn =
    document.getElementById("menuBtn");

  const closeMenuBtn =
    document.getElementById("closeMenuBtn");

  const menuModal =
    document.getElementById("menuModal");

  const themeToggleBtn =
    document.getElementById("themeToggleBtn");

  const themeStatus =
    document.getElementById("themeStatus");

  const tabCountBtn =
    document.getElementById("tabCountBtn");

  const toast =
    document.getElementById("toast");


  /* ===================================================
     SAFETY CHECK
  =================================================== */

  if (!searchInput) {
    return;
  }


  /* ===================================================
     TOAST
  =================================================== */

  let toastTimer = null;

  function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 1800);
  }


  /* ===================================================
     SEARCH FOCUS MODE
  =================================================== */

  function enterSearchFocus() {

    body.classList.add("search-focused");

    updateClearButton();

  }


  function exitSearchFocus() {

    body.classList.remove("search-focused");

    searchInput.blur();

    updateClearButton();

  }


  searchInput.addEventListener(
    "focus",
    enterSearchFocus
  );


  backBtn?.addEventListener(
    "click",
    (event) => {

      event.preventDefault();
      event.stopPropagation();

      exitSearchFocus();

    }
  );


  /* ===================================================
     CLEAR BUTTON
  =================================================== */

  function updateClearButton() {

    if (!clearBtn) return;

    const hasText =
      searchInput.value.trim().length > 0;

    clearBtn.style.display =
      hasText ? "grid" : "none";

  }


  clearBtn?.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      searchInput.value = "";

      searchInput.focus();

      updateClearButton();

    }
  );


  searchInput.addEventListener(
    "input",
    updateClearButton
  );


  /* ===================================================
     SEARCH
  =================================================== */

  function executeSearch() {

    const query =
      searchInput.value.trim();

    if (!query) {

      searchInput.focus();

      showToast("Type something to search");

      return;

    }


    /*
      Search results page.

      Example:
      /search.html?q=facebook
    */

    const searchURL =
      `/search.html?q=${encodeURIComponent(query)}`;

    window.location.href = searchURL;

  }


  searchInput.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Enter") {

        event.preventDefault();

        executeSearch();

      }

      if (event.key === "Escape") {

        event.preventDefault();

        searchInput.value = "";

        updateClearButton();

      }

    }
  );


  /* ===================================================
     AI BUTTON
  =================================================== */

  aiSparkBtn?.addEventListener(
    "click",
    () => {

      const query =
        searchInput.value.trim();

      if (!query) {

        searchInput.focus();

        showToast("Type a question first");

        return;

      }


      /*
        AI backend is not connected yet.

        We do NOT fake an AI answer.
        For now the button sends the query
        to the normal search page.
      */

      const aiURL =
        `/search.html?q=${encodeURIComponent(query)}&mode=ai`;

      window.location.href = aiURL;

    }
  );


  /* ===================================================
     FIRE / CLEAR
  =================================================== */

  fireBtn?.addEventListener(
    "click",
    () => {

      if (fireOverlay) {

        fireOverlay.classList.add("active");

      }


      searchInput.value = "";

      updateClearButton();


      setTimeout(() => {

        fireOverlay?.classList.remove("active");

      }, 450);


      showToast("Search cleared");

    }
  );


  /* ===================================================
     MENU
  =================================================== */

  function openMenu() {

    if (!menuModal) return;

    menuModal.classList.add("open");

    menuModal.setAttribute(
      "aria-hidden",
      "false"
    );

    body.classList.add("menu-open");

  }


  function closeMenu() {

    if (!menuModal) return;

    menuModal.classList.remove("open");

    menuModal.setAttribute(
      "aria-hidden",
      "true"
    );

    body.classList.remove("menu-open");

  }


  menuBtn?.addEventListener(
    "click",
    openMenu
  );


  closeMenuBtn?.addEventListener(
    "click",
    closeMenu
  );


  menuModal?.addEventListener(
    "click",
    (event) => {

      if (event.target === menuModal) {

        closeMenu();

      }

    }
  );


  /* ===================================================
     ESCAPE KEY
  =================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key !== "Escape") return;


      if (menuModal?.classList.contains("open")) {

        closeMenu();

        return;

      }


      if (
        body.classList.contains(
          "search-focused"
        )
      ) {

        exitSearchFocus();

      }

    }
  );


  /* ===================================================
     THEME
  =================================================== */

  function setTheme(theme) {

    const isDark =
      theme === "dark";


    body.classList.toggle(
      "dark-theme",
      isDark
    );


    if (themeStatus) {

      themeStatus.textContent =
        isDark ? "On" : "Off";

    }


    localStorage.setItem(
      "wareligent-theme",
      theme
    );


    updateThemeColor(isDark);

  }


  function updateThemeColor(isDark) {

    let themeMeta =
      document.querySelector(
        'meta[name="theme-color"]'
      );


    if (!themeMeta) {

      themeMeta =
        document.createElement("meta");

      themeMeta.name =
        "theme-color";

      document.head.appendChild(
        themeMeta
      );

    }


    themeMeta.content =
      isDark ? "#101214" : "#ffffff";

  }


  function initTheme() {

    const savedTheme =
      localStorage.getItem(
        "wareligent-theme"
      );


    if (
      savedTheme === "dark" ||
      savedTheme === "light"
    ) {

      setTheme(savedTheme);

      return;

    }


    /*
      Respect device preference only
      when the user has never selected
      a Wareligent theme.
    */

    const prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;


    setTheme(
      prefersDark
        ? "dark"
        : "light"
    );

  }


  themeToggleBtn?.addEventListener(
    "click",
    () => {

      const isDark =
        body.classList.contains(
          "dark-theme"
        );


      setTheme(
        isDark
          ? "light"
          : "dark"
      );

    }
  );


  /* ===================================================
     TAB BUTTON
  =================================================== */

  tabCountBtn?.addEventListener(
    "click",
    () => {

      /*
        There is currently one homepage
        tab. This keeps the old tab button
        functional without pretending to
        manage browser tabs.
      */

      showToast("1 tab open");

    }
  );


  /* ===================================================
     PREVENT UNWANTED FORM-LIKE BEHAVIOR
  =================================================== */

  searchBox?.addEventListener(
    "click",
    () => {

      if (
        document.activeElement !==
        searchInput
      ) {

        searchInput.focus();

      }

    }
  );


  /* ===================================================
     INITIALIZE
  =================================================== */

  initTheme();

  updateClearButton();

})();
