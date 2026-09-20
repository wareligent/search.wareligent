/* =====================================================
   WARELIGENT
   Professional Search Results Engine
===================================================== */

(() => {

  "use strict";


  /* ===================================================
     CONFIG
  =================================================== */

  /*
     IMPORTANT:

     Do NOT put a Supabase service-role key here.

     For the real frontend connection, use your
     publishable/anon key with proper RLS policies.

     Example:

     const SUPABASE_URL =
       "https://xveccsbdrysuiwyuvodw.supabase.co/rest/v1/";

     const SUPABASE_KEY =
       "sb_publishable_HkyRE170ylT0kkdZxbwUSQ_ihHrS_Ra";
  */

  const SUPABASE_URL =
    window.WARELIGENT_CONFIG?.SUPABASE_URL || "";

  const SUPABASE_KEY =
    window.WARELIGENT_CONFIG?.SUPABASE_KEY || "";


  /* ===================================================
     ELEMENTS
  =================================================== */

  const body =
    document.body;

  const queryInput =
    document.getElementById(
      "queryInput"
    );

  const searchForm =
    document.getElementById(
      "searchForm"
    );

  const clearQueryBtn =
    document.getElementById(
      "clearQueryBtn"
    );

  const homeBtn =
    document.getElementById(
      "homeBtn"
    );

  const backHomeBtn =
    document.getElementById(
      "backHomeBtn"
    );

  const resultsList =
    document.getElementById(
      "resultsList"
    );

  const loadingState =
    document.getElementById(
      "loadingState"
    );

  const emptyState =
    document.getElementById(
      "emptyState"
    );

  const errorState =
    document.getElementById(
      "errorState"
    );

  const resultCount =
    document.getElementById(
      "resultCount"
    );

  const queryLabel =
    document.getElementById(
      "queryLabel"
    );

  const tryAgainBtn =
    document.getElementById(
      "tryAgainBtn"
    );

  const retryBtn =
    document.getElementById(
      "retryBtn"
    );

  const pageTransition =
    document.getElementById(
      "pageTransition"
    );

  const routeLoader =
    document.getElementById(
      "routeLoader"
    );

  const settingsBtn =
    document.getElementById(
      "settingsBtn"
    );

  const settingsModal =
    document.getElementById(
      "settingsModal"
    );

  const closeSettingsBtn =
    document.getElementById(
      "closeSettingsBtn"
    );

  const themeBtn =
    document.getElementById(
      "themeBtn"
    );

  const themeStatus =
    document.getElementById(
      "themeStatus"
    );


  /* ===================================================
     QUERY
  =================================================== */

  function getQuery() {

    const params =
      new URLSearchParams(
        window.location.search
      );

    return (
      params.get("q") || ""
    ).trim();

  }


  let currentQuery =
    getQuery();


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


    themeStatus.textContent =
      isDark
        ? "On"
        : "Off";


    localStorage.setItem(
      "wareligent-theme",
      isDark
        ? "dark"
        : "light"
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


  themeBtn.addEventListener(
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
     SETTINGS
  =================================================== */

  function openSettings() {

    settingsModal.classList.add(
      "open"
    );

    settingsModal.setAttribute(
      "aria-hidden",
      "false"
    );

  }


  function closeSettings() {

    settingsModal.classList.remove(
      "open"
    );

    settingsModal.setAttribute(
      "aria-hidden",
      "true"
    );

  }


  settingsBtn.addEventListener(
    "click",
    openSettings
  );


  closeSettingsBtn.addEventListener(
    "click",
    closeSettings
  );


  settingsModal.addEventListener(
    "click",
    (event) => {

      if (
        event.target ===
        settingsModal
      ) {

        closeSettings();

      }

    }
  );


  /* ===================================================
     CLEAR QUERY
  =================================================== */

  function updateClearButton() {

    clearQueryBtn.style.display =
      queryInput.value.trim()
        ? "grid"
        : "none";

  }


  clearQueryBtn.addEventListener(
    "click",
    () => {

      queryInput.value = "";

      updateClearButton();

      queryInput.focus();

    }
  );


  /* ===================================================
     NAVIGATION
  =================================================== */

  function goHome() {

    body.classList.add(
      "page-leave"
    );


    setTimeout(
      () => {

        window.location.href =
          "/";

      },
      320
    );

  }


  homeBtn.addEventListener(
    "click",
    (event) => {

      event.preventDefault();

      goHome();

    }
  );


  backHomeBtn.addEventListener(
    "click",
    () => {

      goHome();

    }
  );


  /* ===================================================
     SEARCH NAVIGATION
  =================================================== */

  function goSearch(query) {

    query =
      query.trim();


    if (!query) {

      queryInput.focus();

      return;

    }


    routeLoader.classList.add(
      "active"
    );

    body.classList.add(
      "page-leave"
    );


    setTimeout(
      () => {

        window.location.href =
          "/search.html?q=" +
          encodeURIComponent(
            query
          );

      },
      280
    );

  }


  searchForm.addEventListener(
    "submit",
    (event) => {

      event.preventDefault();

      goSearch(
        queryInput.value
      );

    }
  );


  queryInput.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape"
      ) {

        queryInput.blur();

      }

    }
  );


  /* ===================================================
     SUPABASE SEARCH
  =================================================== */

  async function searchSupabase(
    query
  ) {

    if (
      !SUPABASE_URL ||
      !SUPABASE_KEY
    ) {

      /*
        Demo fallback.

        Remove this fallback after
        connecting your real Supabase config.
      */

      return [];

    }


    const encodedQuery =
      encodeURIComponent(
        query
      );


    /*
      Search across:

      title
      description
      keywords

      using PostgREST OR filtering.
    */

    const filter =
      [
        `title.ilike.*${encodedQuery}*`,
        `description.ilike.*${encodedQuery}*`,
        `keywords.ilike.*${encodedQuery}*`
      ].join(",");


    const url =
      `${SUPABASE_URL}/rest/v1/websites` +
      `?or=(${filter})` +
      `&select=id,title,url,description,keywords` +
      `&limit=30`;


    const response =
      await fetch(
        url,
        {
          method: "GET",

          headers: {

            apikey:
              SUPABASE_KEY,

            Authorization:
              `Bearer ${SUPABASE_KEY}`

          }
        }
      );


    if (
      !response.ok
    ) {

      throw new Error(
        `Search request failed: ${response.status}`
      );

    }


    return await response.json();

  }


  /* ===================================================
     FALLBACK DEMO DATA
  =================================================== */

  function demoSearch(
    query
  ) {

    const q =
      query.toLowerCase();


    const demo =
      [
        {
          id: "demo-1",

          title:
            "Internet Assigned Numbers Authority",

          url:
            "https://www.iana.org/",

          description:
            "The Internet Assigned Numbers Authority coordinates some of the key elements that keep the Internet running smoothly.",

          keywords:
            "internet, domains, protocols, numbers"
        },

        {
          id: "demo-2",

          title:
            "Example Domain",

          url:
            "https://example.com/",

          description:
            "This domain is provided for use in documentation examples without needing permission.",

          keywords:
            "example, web, domain"
        }

      ];


    return demo.filter(
      item => {

        const text =
          [
            item.title,
            item.description,
            item.keywords,
            item.url
          ]
            .join(" ")
            .toLowerCase();


        return text.includes(q);

      }
    );

  }


  /* ===================================================
     URL HELPERS
  =================================================== */

  function getHostname(
    url
  ) {

    try {

      return new URL(
        url
      ).hostname
        .replace(
          /^www\./,
          ""
        );

    } catch {

      return url || "";

    }

  }


  function getInitial(
    title
  ) {

    if (!title) {

      return "W";

    }


    return title
      .trim()
      .charAt(0)
      .toUpperCase();

  }


  function safeUrl(
    value
  ) {

    try {

      const url =
        new URL(
          value
        );


      if (
        url.protocol !==
          "http:" &&
        url.protocol !==
          "https:"
      ) {

        return "#";

      }


      return url.href;

    } catch {

      return "#";

    }

  }


  function escapeHTML(
    value
  ) {

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


  /* ===================================================
     RESULT CARD
  =================================================== */

  function createResult(
    item
  ) {

    const title =
      escapeHTML(
        item.title ||
        "Untitled page"
      );


    const url =
      safeUrl(
        item.url || "#"
      );


    const hostname =
      escapeHTML(
        getHostname(
          item.url || ""
        )
      );


    const description =
      escapeHTML(
        item.description ||
        "No description available for this result."
      );


    const keywords =
      String(
        item.keywords || ""
      )
        .split(",")
        .map(
          keyword =>
            keyword.trim()
        )
        .filter(Boolean)
        .slice(0, 5);


    const keywordHTML =
      keywords.length
        ? `
          <div class="result-keywords">

            ${keywords
              .map(
                keyword =>
                  `<span class="keyword">
                    ${escapeHTML(keyword)}
                  </span>`
              )
              .join("")
            }

          </div>
        `
        : "";


    const article =
      document.createElement(
        "article"
      );


    article.className =
      "result-card";


    article.innerHTML =
      `

        <div class="result-source">

          <div class="source-icon">
            ${escapeHTML(
              getInitial(
                item.title
              )
            )}
          </div>

          <div class="source-info">

            <div class="source-name">
              ${escapeHTML(
                item.title ||
                hostname
              )}
            </div>

            <div class="source-url">
              ${hostname}
            </div>

          </div>

        </div>


        <a
          class="result-title"
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${title}
        </a>


        <p class="result-description">
          ${description}
        </p>


        ${keywordHTML}

      `;


    return article;

  }


  /* ===================================================
     SHOW / HIDE STATES
  =================================================== */

  function showLoading() {

    loadingState.hidden =
      false;

    resultsList.innerHTML =
      "";

    emptyState.hidden =
      true;

    errorState.hidden =
      true;

  }


  function showResults(
    results
  ) {

    loadingState.hidden =
      true;

    emptyState.hidden =
      true;

    errorState.hidden =
      true;


    resultsList.innerHTML =
      "";


    if (
      !results.length
    ) {

      showEmpty();

      return;

    }


    results.forEach(
      item => {

        resultsList.appendChild(
          createResult(item)
        );

      }
    );


    resultCount.textContent =
      `${results.length} ${
        results.length === 1
          ? "result"
          : "results"
      }`;

  }


  function showEmpty() {

    loadingState.hidden =
      true;

    resultsList.innerHTML =
      "";

    errorState.hidden =
      true;

    emptyState.hidden =
      false;

    resultCount.textContent =
      "0 results";

  }


  function showError() {

    loadingState.hidden =
      true;

    resultsList.innerHTML =
      "";

    emptyState.hidden =
      true;

    errorState.hidden =
      false;

    resultCount.textContent =
      "Search unavailable";

  }


  /* ===================================================
     PERFORM SEARCH
  =================================================== */

  async function performSearch() {

    currentQuery =
      getQuery();


    queryInput.value =
      currentQuery;


    updateClearButton();


    queryLabel.textContent =
      currentQuery
        ? `Results for “${currentQuery}”`
        : "";


    if (!currentQuery) {

      loadingState.hidden =
        true;

      resultCount.textContent =
        "Search Wareligent";

      return;

    }


    showLoading();


    try {

      let results =
        await searchSupabase(
          currentQuery
        );


      /*
        If Supabase isn't configured,
        use local demo data so the UI
        can still be tested.
      */

      if (
        !SUPABASE_URL ||
        !SUPABASE_KEY
      ) {

        results =
          demoSearch(
            currentQuery
          );

      }


      showResults(
        results
      );

    } catch (
      error
    ) {

      console.error(
        "Wareligent search error:",
        error
      );


      showError();

    }

  }


  /* ===================================================
     RETRY
  =================================================== */

  retryBtn.addEventListener(
    "click",
    performSearch
  );


  tryAgainBtn.addEventListener(
    "click",
    () => {

      queryInput.focus();

    }
  );


  /* ===================================================
     KEYBOARD
  =================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key !== "Escape"
      ) {

        return;

      }


      if (
        settingsModal.classList.contains(
          "open"
        )
      ) {

        closeSettings();

      }

    }
  );


  /* ===================================================
     INITIAL PAGE ANIMATION
  =================================================== */

  function startPageAnimation() {

    body.classList.add(
      "page-enter"
    );


    setTimeout(
      () => {

        body.classList.remove(
          "page-enter"
        );

      },
      700
    );

  }


  /* ===================================================
     INIT
  =================================================== */

  loadTheme();

  startPageAnimation();

  performSearch();

})();
