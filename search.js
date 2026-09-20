(() => {
  "use strict";


  /* =========================================
     ELEMENTS
  ========================================= */

  const searchInput = document.getElementById("searchInput");
  const searchForm = document.getElementById("searchForm");

  const clearBtn = document.getElementById("clearBtn");

  const queryTitle = document.getElementById("queryTitle");
  const resultCount = document.getElementById("resultCount");

  const loadingState = document.getElementById("loadingState");
  const resultsList = document.getElementById("resultsList");

  const emptyState = document.getElementById("emptyState");
  const errorState = document.getElementById("errorState");

  const errorMessage = document.getElementById("errorMessage");

  const retryBtn = document.getElementById("retryBtn");
  const emptyHomeBtn = document.getElementById("emptyHomeBtn");

  const mobileHomeBtn = document.getElementById("mobileHomeBtn");
  const homeLogo = document.getElementById("homeLogo");

  const routeLoader = document.getElementById("routeLoader");

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const closeSettings = document.getElementById("closeSettings");

  const themeToggle = document.getElementById("themeToggle");
  const themeStatus = document.getElementById("themeStatus");

  const settingsHomeBtn =
    document.getElementById("settingsHomeBtn");


  /* =========================================
     QUERY
  ========================================= */

  const params = new URLSearchParams(window.location.search);

  const currentQuery =
    (params.get("q") || "").trim();


  /* =========================================
     CONFIG
  ========================================= */

  const CONFIG = window.WARELIGENT_CONFIG || {};

  const SUPABASE_URL =
    String(CONFIG.SUPABASE_URL || "").replace(/\/+$/, "");

  const SUPABASE_KEY =
    String(CONFIG.SUPABASE_KEY || "");


  /* =========================================
     INITIAL UI
  ========================================= */

  searchInput.value = currentQuery;

  queryTitle.textContent =
    currentQuery || "Wareligent";


  /* =========================================
     THEME
  ========================================= */

  function setTheme(theme) {

    const dark = theme === "dark";

    document.body.classList.toggle(
      "dark-theme",
      dark
    );

    themeStatus.textContent =
      dark ? "On" : "Off";

    localStorage.setItem(
      "wareligent-theme",
      dark ? "dark" : "light"
    );

    const meta =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (meta) {
      meta.content =
        dark ? "#0d1014" : "#ffffff";
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


  themeToggle.addEventListener(
    "click",
    () => {

      const isDark =
        document.body.classList.contains(
          "dark-theme"
        );

      setTheme(
        isDark
          ? "light"
          : "dark"
      );

    }
  );


  /* =========================================
     SETTINGS
  ========================================= */

  function openSettings() {

    settingsOverlay.classList.add("open");

    settingsOverlay.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function closeSettingsPanel() {

    settingsOverlay.classList.remove("open");

    settingsOverlay.setAttribute(
      "aria-hidden",
      "true"
    );
  }


  settingsBtn.addEventListener(
    "click",
    openSettings
  );

  closeSettings.addEventListener(
    "click",
    closeSettingsPanel
  );


  settingsOverlay.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        settingsOverlay
      ) {
        closeSettingsPanel();
      }

    }
  );


  /* =========================================
     NAVIGATION
  ========================================= */

  function goHome() {

    document.body.classList.add(
      "page-leave"
    );

    routeLoader.classList.add(
      "active"
    );

    setTimeout(() => {
      window.location.href = "/";
    }, 260);
  }


  function goSearch(query) {

    query = query.trim();

    if (!query) {
      return;
    }

    document.body.classList.add(
      "page-leave"
    );

    routeLoader.classList.add(
      "active"
    );

    setTimeout(() => {

      window.location.href =
        "/search.html?q=" +
        encodeURIComponent(query);

    }, 260);
  }


  homeLogo.addEventListener(
    "click",
    event => {

      event.preventDefault();

      goHome();

    }
  );


  mobileHomeBtn.addEventListener(
    "click",
    goHome
  );


  emptyHomeBtn.addEventListener(
    "click",
    goHome
  );


  settingsHomeBtn.addEventListener(
    "click",
    () => {

      closeSettingsPanel();

      setTimeout(
        goHome,
        100
      );

    }
  );


  /* =========================================
     SEARCH FORM
  ========================================= */

  searchForm.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      const query =
        searchInput.value.trim();

      if (!query) {
        searchInput.focus();
        return;
      }

      if (
        query === currentQuery
      ) {
        searchSites(query);
        return;
      }

      goSearch(query);

    }
  );


  /* =========================================
     INPUT
  ========================================= */

  searchInput.addEventListener(
    "input",
    () => {

      clearBtn.style.display =
        searchInput.value.trim()
          ? "grid"
          : "none";

    }
  );


  clearBtn.addEventListener(
    "click",
    () => {

      searchInput.value = "";

      clearBtn.style.display =
        "none";

      searchInput.focus();

    }
  );


  /* =========================================
     HELPERS
  ========================================= */

  function escapeHTML(value) {

    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  }


  function safeURL(value) {

    try {

      const url =
        new URL(value);

      if (
        url.protocol === "http:" ||
        url.protocol === "https:"
      ) {
        return url.href;
      }

    } catch (error) {}

    return "#";
  }


  function getHostname(value) {

    try {

      return new URL(value)
        .hostname
        .replace(/^www\./, "");

    } catch (error) {

      return "";

    }
  }


  function normalizeKeywords(value) {

    if (!value) {
      return [];
    }

    if (Array.isArray(value)) {
      return value;
    }

    return String(value)
      .split(/[,\s]+/)
      .map(item => item.trim())
      .filter(Boolean)
      .slice(0, 8);

  }


  /* =========================================
     UI STATES
  ========================================= */

  function showLoading() {

    loadingState.classList.remove(
      "hidden"
    );

    resultsList.innerHTML = "";

    emptyState.classList.add(
      "hidden"
    );

    errorState.classList.add(
      "hidden"
    );

    resultCount.textContent = "";

  }


  function showEmpty() {

    loadingState.classList.add(
      "hidden"
    );

    resultsList.innerHTML = "";

    emptyState.classList.remove(
      "hidden"
    );

    errorState.classList.add(
      "hidden"
    );

    resultCount.textContent =
      "0 results";

  }


  function showError(message) {

    loadingState.classList.add(
      "hidden"
    );

    resultsList.innerHTML = "";

    emptyState.classList.add(
      "hidden"
    );

    errorState.classList.remove(
      "hidden"
    );

    errorMessage.textContent =
      message;

    resultCount.textContent = "";

  }


  /* =========================================
     SUPABASE SEARCH
  ========================================= */

  async function searchSupabase(query) {

    if (
      !SUPABASE_URL ||
      !SUPABASE_KEY
    ) {

      throw new Error(
        "Supabase configuration is missing. Please check config.js."
      );

    }


    /*
      We search:
      - title
      - description
      - keywords

      PostgreSQL/PostgREST OR syntax.
    */

    const searchValue =
      `*${query.replace(/[*]/g, "")}*`;


    const filter =
      [
        `title.ilike.${searchValue}`,
        `description.ilike.${searchValue}`,
        `keywords.ilike.${searchValue}`
      ].join(",");


    const endpoint =
      SUPABASE_URL +
      "/rest/v1/websites?" +
      new URLSearchParams({

        select:
          "id,title,url,description,keywords",

        or: filter,

        limit: "50"

      }).toString();


    const response =
      await fetch(
        endpoint,
        {
          method: "GET",

          headers: {

            "apikey":
              SUPABASE_KEY,

            "Authorization":
              `Bearer ${SUPABASE_KEY}`,

            "Accept":
              "application/json"

          }
        }
      );


    if (!response.ok) {

      let detail = "";

      try {

        const data =
          await response.json();

        detail =
          data.message ||
          data.hint ||
          data.details ||
          "";

      } catch (error) {}


      throw new Error(
        `Supabase returned HTTP ${response.status}` +
        (detail
          ? ` — ${detail}`
          : "")
      );

    }


    const data =
      await response.json();


    if (!Array.isArray(data)) {

      throw new Error(
        "Supabase returned an unexpected response."
      );

    }


    return data;

  }


  /* =========================================
     RENDER RESULTS
  ========================================= */

  function renderResults(results) {

    loadingState.classList.add(
      "hidden"
    );

    emptyState.classList.add(
      "hidden"
    );

    errorState.classList.add(
      "hidden"
    );


    resultCount.textContent =
      `${results.length} result${results.length === 1 ? "" : "s"}`;


    resultsList.innerHTML =
      results.map(
        (site, index) => {

          const title =
            escapeHTML(
              site.title ||
              "Untitled website"
            );

          const description =
            escapeHTML(
              site.description ||
              "No description available."
            );

          const url =
            safeURL(
              site.url
            );

          const hostname =
            escapeHTML(
              getHostname(
                site.url
              )
            );


          const keywords =
            normalizeKeywords(
              site.keywords
            );


          const keywordHTML =
            keywords
              .map(
                keyword =>
                  `<span class="keyword">${escapeHTML(keyword)}</span>`
              )
              .join("");


          return `
            <a
              class="result-card"
              href="${url}"
              target="_blank"
              rel="noopener noreferrer"
              style="animation-delay:${Math.min(index * 45, 450)}ms"
            >

              <div class="result-source">

                <div class="source-icon">
                  W
                </div>

                <span class="source-name">
                  ${hostname || "Website"}
                </span>

                ${
                  hostname
                    ? `<span class="source-url">· ${hostname}</span>`
                    : ""
                }

              </div>


              <div class="result-title">
                ${title}
              </div>


              <div class="result-description">
                ${description}
              </div>


              ${
                keywordHTML
                  ? `<div class="result-keywords">${keywordHTML}</div>`
                  : ""
              }

            </a>
          `;

        }
      ).join("");

  }


  /* =========================================
     MAIN SEARCH
  ========================================= */

  async function searchSites(query) {

    query = query.trim();

    if (!query) {

      showEmpty();

      return;

    }


    queryTitle.textContent =
      query;


    showLoading();


    try {

      const results =
        await searchSupabase(
          query
        );


      if (
        !results ||
        results.length === 0
      ) {

        showEmpty();

        return;

      }


      renderResults(
        results
      );

    } catch (error) {

      console.error(
        "Wareligent Search Error:",
        error
      );


      showError(
        error.message ||
        "Unable to connect to Supabase."
      );

    }

  }


  /* =========================================
     RETRY
  ========================================= */

  retryBtn.addEventListener(
    "click",
    () => {

      if (currentQuery) {
        searchSites(
          currentQuery
        );
      }

    }
  );


  /* =========================================
     ESCAPE KEY
  ========================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        if (
          settingsOverlay.classList.contains(
            "open"
          )
        ) {

          closeSettingsPanel();

        }

      }

    }
  );


  /* =========================================
     INITIALIZE
  ========================================= */

  loadTheme();


  clearBtn.style.display =
    currentQuery
      ? "grid"
      : "none";


  if (currentQuery) {

    searchSites(
      currentQuery
    );

  } else {

    showEmpty();

  }


})();
