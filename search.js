(() => {
  "use strict";


  /* =========================================
     ELEMENTS
  ========================================= */

  const searchInput =
    document.getElementById("searchInput");

  const searchForm =
    document.getElementById("searchForm");

  const clearBtn =
    document.getElementById("clearBtn");

  const queryTitle =
    document.getElementById("queryTitle");

  const resultCount =
    document.getElementById("resultCount");

  const loadingState =
    document.getElementById("loadingState");

  const resultsList =
    document.getElementById("resultsList");

  const emptyState =
    document.getElementById("emptyState");

  const errorState =
    document.getElementById("errorState");

  const errorMessage =
    document.getElementById("errorMessage");

  const retryBtn =
    document.getElementById("retryBtn");

  const emptyHomeBtn =
    document.getElementById("emptyHomeBtn");

  const mobileHomeBtn =
    document.getElementById("mobileHomeBtn");

  const homeLogo =
    document.getElementById("homeLogo");

  const routeLoader =
    document.getElementById("routeLoader");

  const settingsBtn =
    document.getElementById("settingsBtn");

  const settingsOverlay =
    document.getElementById("settingsOverlay");

  const closeSettings =
    document.getElementById("closeSettings");

  const themeToggle =
    document.getElementById("themeToggle");

  const themeStatus =
    document.getElementById("themeStatus");

  const settingsHomeBtn =
    document.getElementById("settingsHomeBtn");


  /* =========================================
     QUERY
  ========================================= */

  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const currentQuery =
    (urlParams.get("q") || "").trim();


  /* =========================================
     CONFIG
  ========================================= */

  const CONFIG =
    window.WARELIGENT_CONFIG || {};

  const SUPABASE_URL =
    String(
      CONFIG.SUPABASE_URL || ""
    )
      .trim()
      .replace(/\/+$/, "");

  const SUPABASE_KEY =
    String(
      CONFIG.SUPABASE_KEY || ""
    )
      .trim();


  /* =========================================
     INITIAL UI
  ========================================= */

  searchInput.value =
    currentQuery;

  queryTitle.textContent =
    currentQuery || "Wareligent";


  /* =========================================
     THEME
  ========================================= */

  function setTheme(theme) {

    const dark =
      theme === "dark";

    document.body.classList.toggle(
      "dark-theme",
      dark
    );

    themeStatus.textContent =
      dark ? "On" : "Off";

    localStorage.setItem(
      "wareligent-theme",
      dark
        ? "dark"
        : "light"
    );

    const meta =
      document.querySelector(
        'meta[name="theme-color"]'
      );

    if (meta) {

      meta.content =
        dark
          ? "#0d1014"
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


  themeToggle.addEventListener(
    "click",
    () => {

      const dark =
        document.body.classList.contains(
          "dark-theme"
        );

      setTheme(
        dark
          ? "light"
          : "dark"
      );

    }
  );


  /* =========================================
     SETTINGS
  ========================================= */

  function openSettings() {

    settingsOverlay.classList.add(
      "open"
    );

    settingsOverlay.setAttribute(
      "aria-hidden",
      "false"
    );
  }


  function closeSettingsPanel() {

    settingsOverlay.classList.remove(
      "open"
    );

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

  function startRouteLoader() {

    document.body.classList.add(
      "page-leave"
    );

    routeLoader.classList.add(
      "active"
    );
  }


  function goHome() {

    startRouteLoader();

    setTimeout(
      () => {
        window.location.href = "/";
      },
      260
    );
  }


  function goSearch(query) {

    query =
      String(query || "").trim();

    if (!query) return;

    startRouteLoader();

    setTimeout(
      () => {

        window.location.href =
          "/search.html?q=" +
          encodeURIComponent(query);

      },
      260
    );
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
     HTML SAFETY
  ========================================= */

  function escapeHTML(value) {

    return String(
      value ?? ""
    )
      .replace(
        /&/g,
        "&amp;"
      )
      .replace(
        /</g,
        "&lt;"
      )
      .replace(
        />/g,
        "&gt;"
      )
      .replace(
        /"/g,
        "&quot;"
      )
      .replace(
        /'/g,
        "&#039;"
      );
  }


  /* =========================================
     SAFE URL
  ========================================= */

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


  /* =========================================
     HOSTNAME
  ========================================= */

  function getHostname(value) {

    try {

      return new URL(value)
        .hostname
        .replace(
          /^www\./,
          ""
        );

    } catch (error) {

      return "";

    }
  }


  /* =========================================
     WEBSITE ICONS
  ========================================= */

  function getWebsiteIcon(url) {

    const hostname =
      getHostname(url)
        .toLowerCase();


    /* FACEBOOK */

    if (
      hostname === "facebook.com" ||
      hostname.endsWith(".facebook.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#1877F2"
            d="M13.5 21v-8h2.7l.4-3h-3.1V8.1c0-.9.3-1.6 1.6-1.6h1.7V3.8c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V10H7.3v3h2.8v8z"
          />
        </svg>
      `;
    }


    /* YOUTUBE */

    if (
      hostname === "youtube.com" ||
      hostname.endsWith(".youtube.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="2"
            y="5"
            width="20"
            height="14"
            rx="4"
            fill="#FF0000"
          />
          <path
            d="M10 9l6 3-6 3z"
            fill="#fff"
          />
        </svg>
      `;
    }


    /* INSTAGRAM */

    if (
      hostname === "instagram.com" ||
      hostname.endsWith(".instagram.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="5"
            fill="none"
            stroke="#C13584"
            stroke-width="2"
          />
          <circle
            cx="12"
            cy="12"
            r="4"
            fill="none"
            stroke="#C13584"
            stroke-width="2"
          />
          <circle
            cx="17.3"
            cy="6.8"
            r="1.2"
            fill="#C13584"
          />
        </svg>
      `;
    }


    /* GITHUB */

    if (
      hostname === "github.com" ||
      hostname.endsWith(".github.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.69c-2.78.6-3.37-1.34-3.37-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.36 1.09 2.94.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.85c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
          />
        </svg>
      `;
    }


    /* MICROSOFT */

    if (
      hostname === "microsoft.com" ||
      hostname.endsWith(".microsoft.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="8" height="8" fill="#f35325"/>
          <rect x="13" y="3" width="8" height="8" fill="#81bc06"/>
          <rect x="3" y="13" width="8" height="8" fill="#05a6f0"/>
          <rect x="13" y="13" width="8" height="8" fill="#ffba08"/>
        </svg>
      `;
    }


    /* GOOGLE */

    if (
      hostname === "google.com" ||
      hostname.endsWith(".google.com")
    ) {

      return `
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            fill="#4285F4"
            d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.37z"
          />
          <path
            fill="#34A853"
            d="M12 22c2.7 0 4.96-.9 6.61-2.4l-3.22-2.51c-.9.6-2.04.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.06v2.59A9.99 9.99 0 0 0 12 22z"
          />
          <path
            fill="#FBBC05"
            d="M6.39 13.92A6.01 6.01 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.49H3.06A10 10 0 0 0 2 12c0 1.61.39 3.13 1.06 4.51z"
          />
          <path
            fill="#EA4335"
            d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87C16.96 2.92 14.7 2 12 2a9.99 9.99 0 0 0-8.94 5.49l3.33 2.59C7.18 7.71 9.39 5.95 12 5.95z"
          />
        </svg>
      `;
    }


    /* DEFAULT WEBSITE ICON */

    return `
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
        />

        <path
          d="M3 12h18M12 3c2.3 2.5 3.4 5.5 3.4 9S14.3 18.5 12 21M12 3c-2.3 2.5-3.4 5.5-3.4 9s1.1 6.5 3.4 9"
          fill="none"
          stroke="currentColor"
          stroke-width="1.4"
        />
      </svg>
    `;
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


    const cleanQuery =
      String(query || "")
        .trim()
        .replace(/[*]/g, "");


    if (!cleanQuery) {
      return [];
    }


    const pattern =
      `*${cleanQuery}*`;


    const orFilter =
      `(` +
      `title.ilike.${pattern},` +
      `description.ilike.${pattern},` +
      `keywords.ilike.${pattern}` +
      `)`;


    const requestParams =
      new URLSearchParams();


    requestParams.set(
      "select",
      "id,title,url,description,keywords"
    );


    requestParams.set(
      "or",
      orFilter
    );


    requestParams.set(
      "limit",
      "50"
    );


    const endpoint =
      `${SUPABASE_URL}/rest/v1/websites?${requestParams.toString()}`;


    console.log(
      "Wareligent Supabase endpoint:",
      endpoint
    );


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
              "application/json",

            "Accept-Profile":
              "public"

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
          data.error ||
          "";

      } catch (error) {}


      throw new Error(
        `Supabase returned HTTP ${response.status}` +
        (
          detail
            ? ` — ${detail}`
            : ""
        )
      );
    }


    const data =
      await response.json();


    if (
      !Array.isArray(data)
    ) {

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
      `${results.length} result${
        results.length === 1
          ? ""
          : "s"
      }`;


    resultsList.innerHTML =
      results
        .map(
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


            const icon =
              getWebsiteIcon(
                site.url
              );


            return `
              <a
                class="result-card"
                href="${url}"
                target="_blank"
                rel="noopener noreferrer"
                style="animation-delay:${Math.min(
                  index * 45,
                  450
                )}ms"
              >

                <div class="result-source">

                  <div
                    class="source-icon"
                    aria-hidden="true"
                  >
                    ${icon}
                  </div>


                  <span class="source-name">
                    ${hostname || "Website"}
                  </span>


                  ${
                    hostname
                      ? `
                        <span class="source-url">
                          · ${hostname}
                        </span>
                      `
                      : ""
                  }

                </div>


                <div class="result-title">
                  ${title}
                </div>


                <div class="result-description">
                  ${description}
                </div>

              </a>
            `;
          }
        )
        .join("");
  }


  /* =========================================
     MAIN SEARCH
  ========================================= */

  async function searchSites(query) {

    query =
      String(query || "").trim();


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
     ESCAPE
  ========================================= */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {
        return;
      }


      if (
        settingsOverlay.classList.contains(
          "open"
        )
      ) {

        closeSettingsPanel();

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
