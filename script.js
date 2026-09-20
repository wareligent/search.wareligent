/* =====================================================
   WARELIGENT
   Animated Minimal Search
===================================================== */

(() => {

  "use strict";


  /* ===================================================
     ELEMENTS
  =================================================== */

  const body =
    document.body;

  const searchInput =
    document.getElementById(
      "searchInput"
    );

  const searchBox =
    document.getElementById(
      "searchBox"
    );

  const backBtn =
    document.getElementById(
      "backBtn"
    );

  const clearBtn =
    document.getElementById(
      "clearBtn"
    );

  const aiBtn =
    document.getElementById(
      "aiSparkBtn"
    );

  const fireBtn =
    document.getElementById(
      "fireBtn"
    );

  const fireOverlay =
    document.getElementById(
      "fireOverlay"
    );

  const menuBtn =
    document.getElementById(
      "menuBtn"
    );

  const closeMenuBtn =
    document.getElementById(
      "closeMenuBtn"
    );

  const menuModal =
    document.getElementById(
      "menuModal"
    );

  const themeToggleBtn =
    document.getElementById(
      "themeToggleBtn"
    );

  const themeStatus =
    document.getElementById(
      "themeStatus"
    );

  const trendItems =
    document.querySelectorAll(
      ".trend-item"
    );


  /* ===================================================
     SEARCH FOCUS
  =================================================== */

  function enterFocus() {

    body.classList.add(
      "search-focused"
    );

    updateClear();

  }


  function exitFocus() {

    body.classList.remove(
      "search-focused"
    );

    searchInput.blur();

    updateClear();

  }


  searchInput.addEventListener(
    "focus",
    enterFocus
  );


  backBtn.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      exitFocus();

    }
  );


  /* ===================================================
     CLEAR BUTTON
  =================================================== */

  function updateClear() {

    if (
      searchInput.value.trim()
    ) {

      clearBtn.style.display =
        "grid";

    } else {

      clearBtn.style.display =
        "none";

    }

  }


  searchInput.addEventListener(
    "input",
    updateClear
  );


  clearBtn.addEventListener(
    "click",
    () => {

      searchInput.value = "";

      updateClear();

      searchInput.focus();

    }
  );


  /* ===================================================
     SEARCH
  =================================================== */

  function executeSearch(
    query = searchInput.value
  ) {

    query =
      query.trim();


    if (!query) {

      searchInput.focus();

      return;

    }


    window.location.href =
      "/search.html?q=" +
      encodeURIComponent(query);

  }


  searchInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter"
      ) {

        event.preventDefault();

        executeSearch();

      }


      if (
        event.key === "Escape"
      ) {

        searchInput.value = "";

        updateClear();

      }

    }
  );


  /* ===================================================
     AI
  =================================================== */

  aiBtn.addEventListener(
    "click",
    () => {

      const query =
        searchInput.value.trim();


      if (!query) {

        searchInput.focus();

        return;

      }


      window.location.href =
        "/search.html?q=" +
        encodeURIComponent(query) +
        "&mode=ai";

    }
  );


  /* ===================================================
     TRENDING TOPICS
  =================================================== */

  trendItems.forEach(
    (item) => {

      item.addEventListener(
        "click",
        () => {

          const topic =
            item.textContent.trim();


          searchInput.value =
            topic;


          updateClear();

          executeSearch(topic);

        }
      );

    }
  );


  /* ===================================================
     FIRE / CLEAR
  =================================================== */

  fireBtn.addEventListener(
    "click",
    () => {

      fireOverlay.classList.add(
        "active"
      );


      searchInput.value = "";

      updateClear();


      setTimeout(
        () => {

          fireOverlay.classList.remove(
            "active"
          );

        },
        450
      );

    }
  );


  /* ===================================================
     SETTINGS
  =================================================== */

  function openMenu() {

    menuModal.classList.add(
      "open"
    );

    menuModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  function closeMenu() {

    menuModal.classList.remove(
      "open"
    );

    menuModal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  menuBtn.addEventListener(
    "click",
    openMenu
  );


  closeMenuBtn.addEventListener(
    "click",
    closeMenu
  );


  menuModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        menuModal
      ) {

        closeMenu();

      }

    }
  );


  /* ===================================================
     DARK MODE
  =================================================== */

  function setTheme(theme) {

    const isDark =
      theme === "dark";


    body.classList.toggle(
      "dark-theme",
      isDark
    );


    themeStatus.textContent =
      isDark ? "On" : "Off";


    localStorage.setItem(
      "wareligent-theme",
      theme
    );


    const meta =
      document.querySelector(
        'meta[name="theme-color"]'
      );


    if (meta) {

      meta.content =
        isDark
          ? "#0f1114"
          : "#ffffff";

    }

  }


  function loadTheme() {

    const saved =
      localStorage.getItem(
        "wareligent-theme"
      );


    setTheme(
      saved === "dark"
        ? "dark"
        : "light"
    );

  }


  themeToggleBtn.addEventListener(
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
     ESCAPE
  =================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key !== "Escape"
      ) return;


      if (
        menuModal.classList.contains(
          "open"
        )
      ) {

        closeMenu();

        return;

      }


      if (
        body.classList.contains(
          "search-focused"
        )
      ) {

        exitFocus();

      }

    }
  );


  /* ===================================================
     SEARCH BOX CLICK
  =================================================== */

  searchBox.addEventListener(
    "click",
    () => {

      searchInput.focus();

    }
  );


  /* ===================================================
     INIT
  =================================================== */

  loadTheme();

  updateClear();

})();
