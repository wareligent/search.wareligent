/* =====================================================
   WARELIGENT
   Minimal Search Interaction
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

    if (!clearBtn) return;

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
     NORMAL SEARCH
  =================================================== */

  function search() {

    const query =
      searchInput.value.trim();


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

        search();

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
     AI SEARCH
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


      /*
        AI backend এখনো connected নয়।
        তাই query-টি search page-এ পাঠানো হচ্ছে।
      */

      window.location.href =
        "/search.html?q=" +
        encodeURIComponent(query) +
        "&mode=ai";

    }
  );


  /* ===================================================
     FIRE / CLEAR
  =================================================== */

  fireBtn.addEventListener(
    "click",
    () => {

      if (fireOverlay) {

        fireOverlay.classList.add(
          "active"
        );

      }


      searchInput.value = "";

      updateClear();


      setTimeout(
        () => {

          fireOverlay?.classList.remove(
            "active"
          );

        },
        400
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
     THEME
  =================================================== */

  function setTheme(theme) {

    const dark =
      theme === "dark";


    body.classList.toggle(
      "dark-theme",
      dark
    );


    themeStatus.textContent =
      dark ? "On" : "Off";


    localStorage.setItem(
      "wareligent-theme",
      theme
    );

  }


  function loadTheme() {

    const saved =
      localStorage.getItem(
        "wareligent-theme"
      );


    if (
      saved === "dark" ||
      saved === "light"
    ) {

      setTheme(saved);

      return;

    }


    setTheme("light");

  }


  themeToggleBtn.addEventListener(
    "click",
    () => {

      const dark =
        body.classList.contains(
          "dark-theme"
        );


      setTheme(
        dark
          ? "light"
          : "dark"
      );

    }
  );


  /* ===================================================
     KEYBOARD
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
     INITIALIZE
  =================================================== */

  loadTheme();

  updateClear();


})();
