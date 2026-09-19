/* =================================
   Wareligent Search Engine
================================= */

(() => {
  "use strict";


  /* ===============================
     Supabase
  =============================== */

  const SUPABASE_URL =
    "https://xveccsbdrysuiwyuvodw.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_HkyRE170ylT0kkdZxbwUSQ_ihHrS_Ra";

  let supabaseClient = null;

  try {
    if (
      window.supabase &&
      SUPABASE_URL.includes(".supabase.co") &&
      !SUPABASE_URL.includes("YOUR-PROJECT")
    ) {
      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );
    }
  } catch (error) {
    console.warn("Supabase unavailable:", error);
  }


  /* ===============================
     DOM
  =============================== */

  const searchForm =
    document.getElementById("searchForm");

  const searchInput =
    document.getElementById("searchInput");

  const clearBtn =
    document.getElementById("clearBtn");

  const imageBtn =
    document.getElementById("imageBtn");

  const imageInput =
    document.getElementById("imageInput");

  const voiceBtn =
    document.getElementById("voiceBtn");

  const suggestionsList =
    document.getElementById("suggestionsList");

  const resultsWrapper =
    document.getElementById("resultsWrapper");

  const trendingBox =
    document.getElementById("trendingBox");

  const trendingGrid =
    document.getElementById("trendingGrid");

  const categoryTabs =
    document.getElementById("categoryTabs");

  const searchPerfMeta =
    document.getElementById("searchPerfMeta");

  const themeToggleBtn =
    document.getElementById("themeToggleBtn");

  const themeIcon =
    document.getElementById("themeIcon");

  const toastContainer =
    document.getElementById("toastContainer");


  /* ===============================
     State
  =============================== */

  let currentMode = "all";

  let selectedSuggestion = -1;

  let suggestionTimer = null;

  let suggestionRequestId = 0;


  /* ===============================
     Static Trending
  =============================== */

  const defaultTrending = [
    "Latest technology trends",
    "World news today",
    "AI tools",
    "Best mobile phones",
    "Sports news",
    "Travel destinations"
  ];


  /* ===============================
     Utilities
  =============================== */

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }


  function normalizeUrl(url) {
    if (!url) return "";

    let value = String(url).trim();

    if (!value) return "";

    if (!/^https?:\/\//i.test(value)) {
      if (
        /^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(value)
      ) {
        value = "https://" + value;
      } else {
        return "";
      }
    }

    try {
      const parsed = new URL(value);

      if (
        parsed.protocol !== "http:" &&
        parsed.protocol !== "https:"
      ) {
        return "";
      }

      return parsed.href;
    } catch {
      return "";
    }
  }


  function getDomain(url) {
    try {
      return new URL(url).hostname.replace(
        /^www\./,
        ""
      );
    } catch {
      return "Web";
    }
  }


  function showToast(message) {
    if (!toastContainer) return;

    const toast =
      document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2800);
  }


  /* ===============================
     Theme
  =============================== */

  function setTheme(theme) {
    document.body.classList.toggle(
      "dark-theme",
      theme === "dark"
    );

    document.body.classList.toggle(
      "light-theme",
      theme === "light"
    );

    if (themeIcon) {
      themeIcon.textContent =
        theme === "dark" ? "☀" : "☾";
    }

    localStorage.setItem(
      "wareligent-theme",
      theme
    );
  }


  function initTheme() {
    const saved =
      localStorage.getItem(
        "wareligent-theme"
      );

    if (saved) {
      setTheme(saved);
      return;
    }

    const prefersDark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    setTheme(
      prefersDark ? "dark" : "light"
    );
  }


  themeToggleBtn?.addEventListener(
    "click",
    () => {
      const isDark =
        document.body.classList.contains(
          "dark-theme"
        );

      setTheme(
        isDark ? "light" : "dark"
      );
    }
  );


  /* ===============================
     Trending
  =============================== */

  function renderTrending(items) {
    if (!trendingGrid) return;

    const list =
      items.length
        ? items
        : defaultTrending;

    trendingGrid.innerHTML =
      list
        .slice(0, 6)
        .map(
          (item, index) => `
            <button
              class="trend-item"
              data-query="${escapeHtml(item)}"
            >
              <span class="trend-number">
                ${index + 1}
              </span>

              <span class="trend-text">
                ${escapeHtml(item)}
              </span>
            </button>
          `
        )
        .join("");

    trendingGrid
      .querySelectorAll(".trend-item")
      .forEach((button) => {
        button.addEventListener(
          "click",
          () => {
            const query =
              button.dataset.query || "";

            searchInput.value = query;

            executeSearch(query);
          }
        );
      });
  }


  async function loadTrending() {
    renderTrending(defaultTrending);

    if (!supabaseClient) return;

    try {
      const { data, error } =
        await supabaseClient
          .from("search_suggestions")
          .select("keyword")
          .order("created_at", {
            ascending: false
          })
          .limit(10);

      if (error || !data?.length) return;

      const keywords =
        data
          .map(item => item.keyword)
          .filter(Boolean);

      const combined = [
        ...keywords,
        ...defaultTrending
      ];

      const unique =
        [...new Set(combined)];

      renderTrending(unique);

    } catch (error) {
      console.warn(
        "Trending unavailable:",
        error
      );
    }
  }


  /* ===============================
     Search Suggestions
  =============================== */

  function hideSuggestions() {
    suggestionsList.hidden = true;
    suggestionsList.innerHTML = "";
    selectedSuggestion = -1;
  }


  function renderSuggestions(items) {
    if (!items.length) {
      hideSuggestions();
      return;
    }

    suggestionsList.innerHTML =
      items
        .slice(0, 7)
        .map(
          item => `
            <li
              data-value="${escapeHtml(item)}"
            >
              🔎
              <span>${escapeHtml(item)}</span>
            </li>
          `
        )
        .join("");

    suggestionsList.hidden = false;

    suggestionsList
      .querySelectorAll("li")
      .forEach((item) => {
        item.addEventListener(
          "mousedown",
          (event) => {
            event.preventDefault();

            const value =
              item.dataset.value || "";

            searchInput.value = value;

            hideSuggestions();

            executeSearch(value);
          }
        );
      });
  }


  function fetchGoogleSuggestions(query) {
    if (!query || query.length < 2) {
      hideSuggestions();
      return;
    }

    const requestId =
      ++suggestionRequestId;

    const callbackName =
      "__wareligentSuggestions";

    window[callbackName] = function(data) {
      if (
        requestId !== suggestionRequestId
      ) {
        return;
      }

      const suggestions =
        Array.isArray(data?.[1])
          ? data[1]
              .map(item =>
                Array.isArray(item)
                  ? item[0]
                  : item
              )
              .filter(Boolean)
          : [];

      renderSuggestions(suggestions);
    };

    const oldScript =
      document.getElementById(
        "googleSuggestionsScript"
      );

    if (oldScript) {
      oldScript.remove();
    }

    const script =
      document.createElement("script");

    script.id =
      "googleSuggestionsScript";

    script.src =
      "https://suggestqueries.google.com/complete/search" +
      `?client=firefox&q=${encodeURIComponent(query)}` +
      `&callback=${callbackName}`;

    script.onerror = () => {
      hideSuggestions();
    };

    document.body.appendChild(script);
  }


  searchInput?.addEventListener(
    "input",
    () => {
      const value =
        searchInput.value.trim();

      clearBtn?.classList.toggle(
        "hidden",
        !value
      );

      clearTimeout(
        suggestionTimer
      );

      if (!value) {
        hideSuggestions();
        return;
      }

      suggestionTimer =
        setTimeout(() => {
          fetchGoogleSuggestions(
            value
          );
        }, 250);
    }
  );


  /* ===============================
     Keyboard
  =============================== */

  searchInput?.addEventListener(
    "keydown",
    (event) => {

      const items =
        suggestionsList.querySelectorAll(
          "li"
        );

      if (!items.length) {
        if (
          event.key === "Enter"
        ) {
          event.preventDefault();

          executeSearch(
            searchInput.value
          );
        }

        return;
      }


      if (event.key === "ArrowDown") {
        event.preventDefault();

        selectedSuggestion =
          Math.min(
            selectedSuggestion + 1,
            items.length - 1
          );
      }


      if (event.key === "ArrowUp") {
        event.preventDefault();

        selectedSuggestion =
          Math.max(
            selectedSuggestion - 1,
            0
          );
      }


      if (event.key === "Enter") {
        event.preventDefault();

        if (
          selectedSuggestion >= 0
        ) {
          const value =
            items[
              selectedSuggestion
            ].dataset.value;

          searchInput.value =
            value;

          hideSuggestions();

          executeSearch(value);

        } else {
          executeSearch(
            searchInput.value
          );
        }

        return;
      }


      items.forEach(
        (item, index) => {
          item.classList.toggle(
            "selected",
            index ===
              selectedSuggestion
          );
        }
      );
    }
  );


  /* ===============================
     Save Search
  =============================== */

  async function saveSearchWord(word) {
    if (!supabaseClient) return;

    const keyword =
      String(word || "")
        .trim()
        .toLowerCase();

    if (keyword.length < 2) return;

    try {
      const {
        data: sessionData
      } =
        await supabaseClient.auth
          .getSession();

      const user =
        sessionData?.session?.user;

      const row = {
        keyword
      };

      if (user) {
        row.user_id = user.id;
      }

      await supabaseClient
        .from("search_suggestions")
        .insert(row);

    } catch (error) {
      console.warn(
        "Could not save search:",
        error
      );
    }
  }


  /* ===============================
     Database Search
  =============================== */

  async function searchDatabase(query) {
    if (!supabaseClient) {
      return [];
    }

    try {

      const fields = [
        "title",
        "keywords",
        "description"
      ];

      const responses =
        await Promise.all(
          fields.map(field =>
            supabaseClient
              .from("websites")
              .select(
                "id,title,url,description,keywords"
              )
              .ilike(
                field,
                `%${query}%`
              )
              .limit(10)
          )
        );

      const map = new Map();

      responses.forEach(response => {

        if (
          response.error ||
          !response.data
        ) {
          return;
        }

        response.data.forEach(item => {

          const url =
            normalizeUrl(item.url);

          const key =
            item.id ||
            url ||
            item.title;

          if (
            key &&
            !map.has(key)
          ) {
            map.set(key, item);
          }

        });
      });

      return [...map.values()]
        .slice(0, 20);

    } catch (error) {

      console.warn(
        "Database search failed:",
        error
      );

      return [];
    }
  }


  /* ===============================
     Web API Search
  =============================== */

  async function searchWebAPI(
    query,
    mode
  ) {

    try {

      const url =
        `/api/search-web?q=${encodeURIComponent(
          query
        )}&type=${encodeURIComponent(
          mode
        )}`;

      const response =
        await fetch(url, {
          headers: {
            Accept:
              "application/json"
          }
        });

      if (!response.ok) {
        return [];
      }

      const data =
        await response.json();

      const results =
        Array.isArray(data)
          ? data
          : (
              data.results ||
              data.items ||
              []
            );

      return results.map(item => ({
        title:
          item.title ||
          item.name ||
          "Untitled result",

        url:
          item.url ||
          item.link ||
          item.href ||
          "",

        description:
          item.description ||
          item.snippet ||
          item.summary ||
          "",

        image:
          item.image ||
          item.thumbnail ||
          item.thumbnailUrl ||
          "",

        video:
          item.video ||
          item.videoUrl ||
          "",

        source:
          item.source ||
          item.site ||
          ""
      }));

    } catch (error) {

      console.warn(
        "Web API unavailable:",
        error
      );

      return [];
    }
  }


  /* ===============================
     Wikipedia fallback
  =============================== */

  async function wikipediaSearch(query) {

    try {

      const url =
        "https://en.wikipedia.org/w/api.php" +
        "?action=query" +
        "&format=json" +
        "&origin=*" +
        "&generator=search" +
        "&gsrsearch=" +
        encodeURIComponent(query) +
        "&gsrlimit=8" +
        "&prop=extracts|info" +
        "&exintro=1" +
        "&explaintext=1" +
        "&inprop=url";

      const response =
        await fetch(url);

      if (!response.ok) {
        return [];
      }

      const data =
        await response.json();

      const pages =
        data?.query?.pages || {};

      return Object.values(pages)
        .map(page => ({
          title:
            page.title,

          url:
            page.fullurl ||
            `https://en.wikipedia.org/wiki/${encodeURIComponent(
              page.title
            )}`,

          description:
            page.extract || "",

          source:
            "Wikipedia"
        }));

    } catch {
      return [];
    }
  }


  /* ===============================
     Loading UI
  =============================== */

  function showLoading() {

    resultsWrapper.innerHTML = `
      <div class="loading-card">
        <div class="skeleton short"></div>
        <br>
        <div class="skeleton medium"></div>
        <br>
        <div class="skeleton long"></div>
        <br>
        <div class="skeleton medium"></div>
      </div>

      <div class="loading-card">
        <div class="skeleton short"></div>
        <br>
        <div class="skeleton long"></div>
        <br>
        <div class="skeleton medium"></div>
      </div>
    `;
  }


  /* ===============================
     Render Result
  =============================== */

  function renderResultCard(item) {

    const url =
      normalizeUrl(item.url);

    if (!url) return "";

    const domain =
      getDomain(url);

    const title =
      item.title ||
      "Untitled result";

    const description =
      item.description ||
      "No description available.";

    const favicon =
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(
        domain
      )}&sz=64`;

    const viewUrl =
      `/view.html?url=${encodeURIComponent(
        url
      )}&title=${encodeURIComponent(
        title
      )}`;

    return `
      <article class="result-card">

        <div class="result-top">

          <img
            class="site-icon"
            src="${favicon}"
            alt=""
            loading="lazy"
          >

          <div class="result-source">
            <strong>
              ${escapeHtml(domain)}
            </strong>

            <small>
              ${escapeHtml(
                item.source || "Web"
              )}
            </small>
          </div>

        </div>


        <a
          class="result-title"
          href="${viewUrl}"
        >
          ${escapeHtml(title)}
        </a>


        <p class="result-description">
          ${escapeHtml(description)}
        </p>


        <div class="result-actions">

          <a
            class="result-action"
            href="${viewUrl}"
          >
            Open
          </a>

          <a
            class="result-action"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit site
          </a>

        </div>

      </article>
    `;
  }


  /* ===============================
     Render Media
  =============================== */

  function renderMediaCard(item) {

    const url =
      normalizeUrl(item.url);

    if (!url) return "";

    const image =
      item.image ||
      item.thumbnail;

    if (!image) {
      return renderResultCard(item);
    }

    const title =
      item.title ||
      "Untitled";

    return `
      <article class="media-card">

        <a
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >

          <img
            class="media-image"
            src="${escapeHtml(image)}"
            alt="${escapeHtml(title)}"
            loading="lazy"
            onerror="this.style.display='none'"
          >

        </a>

        <div class="media-content">

          <div class="media-title">
            ${escapeHtml(title)}
          </div>

          <div class="media-source">
            ${escapeHtml(
              item.source ||
              getDomain(url)
            )}
          </div>

        </div>

      </article>
    `;
  }


  function renderResults(
    results,
    mode
  ) {

    if (!results.length) {

      resultsWrapper.innerHTML = `
        <div class="empty-state">

          <div class="empty-state-icon">
            🔎
          </div>

          <h3>
            No results found
          </h3>

          <p>
            Try another search or a different keyword.
          </p>

        </div>
      `;

      return;
    }


    if (
      mode === "images" ||
      mode === "videos"
    ) {

      resultsWrapper.innerHTML =
        results
          .map(renderMediaCard)
          .join("");

    } else {

      resultsWrapper.innerHTML =
        results
          .map(renderResultCard)
          .join("");
    }
  }


  /* ===============================
     Direct URL
  =============================== */

  function looksLikeUrl(value) {

    return (
      /^https?:\/\//i.test(value) ||
      /^www\./i.test(value) ||
      /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(
        value
      )
    );
  }


  function renderUrlResult(value) {

    const url =
      normalizeUrl(value);

    if (!url) return false;

    const domain =
      getDomain(url);

    resultsWrapper.innerHTML = `
      <article class="result-card">

        <div class="result-top">

          <img
            class="site-icon"
            src="https://www.google.com/s2/favicons?domain=${encodeURIComponent(
              domain
            )}&sz=64"
            alt=""
          >

          <div class="result-source">
            <strong>
              ${escapeHtml(domain)}
            </strong>

            <small>
              Direct website
            </small>
          </div>

        </div>

        <a
          class="result-title"
          href="${url}"
          target="_blank"
          rel="noopener noreferrer"
        >
          Open ${escapeHtml(domain)}
        </a>

        <p class="result-description">
          You entered a website address.
        </p>

        <div class="result-actions">

          <a
            class="result-action"
            href="${url}"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit website
          </a>

        </div>

      </article>
    `;

    return true;
  }


  /* ===============================
     Main Search
  =============================== */

  async function executeSearch(
    query,
    mode = currentMode
  ) {

    query =
      String(query || "").trim();

    if (!query) {
      showToast(
        "Please enter something to search."
      );

      searchInput.focus();

      return;
    }


    currentMode = mode;

    hideSuggestions();


    document
      .querySelectorAll(".tab")
      .forEach(tab => {
        tab.classList.toggle(
          "active",
          tab.dataset.mode === mode
        );
      });


    trendingBox.style.display =
      "none";


    searchPerfMeta.hidden = false;

    searchPerfMeta.textContent =
      "Searching...";


    const started =
      performance.now();


    clearBtn.classList.remove(
      "hidden"
    );


    await saveSearchWord(query);


    if (looksLikeUrl(query)) {

      const success =
        renderUrlResult(query);

      if (success) {

        const time =
          Math.round(
            performance.now() -
              started
          );

        searchPerfMeta.textContent =
          `Website • ${time} ms`;

        return;
      }
    }


    showLoading();


    let results = [];

    let source = "Wareligent";


    /* 1. Database */

    results =
      await searchDatabase(query);


    /* 2. Web API */

    if (!results.length) {

      results =
        await searchWebAPI(
          query,
          mode
        );

      if (results.length) {
        source = "Live Web";
      }
    }


    /* 3. Wikipedia fallback */

    if (
      !results.length &&
      (
        mode === "all" ||
        mode === "news" ||
        mode === "web"
      )
    ) {

      results =
        await wikipediaSearch(query);

      if (results.length) {
        source = "Wikipedia";
      }
    }


    renderResults(
      results,
      mode
    );


    const time =
      Math.round(
        performance.now() -
          started
      );


    searchPerfMeta.textContent =
      `${results.length} result${
        results.length === 1
          ? ""
          : "s"
      } • ${source} • ${time} ms`;
  }


  /* ===============================
     Search Form
  =============================== */

  searchForm?.addEventListener(
    "submit",
    event => {

      event.preventDefault();

      executeSearch(
        searchInput.value,
        currentMode
      );
    }
  );


  /* ===============================
     Clear
  =============================== */

  clearBtn?.addEventListener(
    "click",
    () => {

      searchInput.value = "";

      clearBtn.classList.add(
        "hidden"
      );

      hideSuggestions();

      resultsWrapper.innerHTML = "";

      searchPerfMeta.hidden = true;

      trendingBox.style.display =
        "";

      currentMode = "all";

      document
        .querySelectorAll(".tab")
        .forEach(tab => {
          tab.classList.toggle(
            "active",
            tab.dataset.mode === "all"
          );
        });

      searchInput.focus();
    }
  );


  /* ===============================
     Category Tabs
  =============================== */

  categoryTabs
    ?.querySelectorAll(".tab")
    .forEach(tab => {

      tab.addEventListener(
        "click",
        () => {

          const mode =
            tab.dataset.mode;

          currentMode = mode;

          categoryTabs
            .querySelectorAll(".tab")
            .forEach(item => {
              item.classList.remove(
                "active"
              );
            });

          tab.classList.add(
            "active"
          );


          const query =
            searchInput.value.trim();

          if (!query) {

            showToast(
              "Search something first."
            );

            return;
          }

          executeSearch(
            query,
            mode
          );
        }
      );
    });


  /* ===============================
     Quick Cards
  =============================== */

  document
    .querySelectorAll(".quick-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const action =
            card.dataset.action;

          if (action === "images") {

            imageInput?.click();

            return;
          }


          if (action === "news") {

            searchInput.value =
              "latest news";

            executeSearch(
              "latest news",
              "news"
            );

            return;
          }


          if (action === "trending") {

            trendingBox.scrollIntoView({
              behavior: "smooth"
            });

            return;
          }


          if (action === "rewards") {

            showToast(
              "Rewards feature is coming soon."
            );

          }

        }
      );
    });


  /* ===============================
     Image Search
  =============================== */

  imageBtn?.addEventListener(
    "click",
    () => {
      imageInput?.click();
    }
  );


  imageInput?.addEventListener(
    "change",
    async () => {

      const file =
        imageInput.files?.[0];

      if (!file) return;


      if (!file.type.startsWith("image/")) {

        showToast(
          "Please select an image."
        );

        return;
      }


      if (
        file.size >
        8 * 1024 * 1024
      ) {

        showToast(
          "Image must be smaller than 8MB."
        );

        return;
      }


      showToast(
        "Image selected."
      );


      /*
       * If /api/image-search exists,
       * real image search can be used.
       */

      try {

        const formData =
          new FormData();

        formData.append(
          "image",
          file
        );


        const response =
          await fetch(
            "/api/image-search",
            {
              method: "POST",
              body: formData
            }
          );


        if (response.ok) {

          const data =
            await response.json();

          const results =
            Array.isArray(data)
              ? data
              : (
                  data.results ||
                  []
                );

          if (results.length) {

            searchInput.value =
              file.name;

            trendingBox.style.display =
              "none";

            renderResults(
              results,
              "images"
            );

            searchPerfMeta.hidden =
              false;

            searchPerfMeta.textContent =
              `${results.length} image results`;

            return;
          }
        }

      } catch {
        // Fallback below
      }


      /*
       * Backend না থাকলে filename search.
       */

      const filename =
        file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]+/g, " ")
          .trim();


      if (filename) {

        searchInput.value =
          filename;

        executeSearch(
          filename,
          "images"
        );
      }

    }
  );


  /* ===============================
     Voice Search
  =============================== */

  let recognition = null;

  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


  if (SpeechRecognition) {

    recognition =
      new SpeechRecognition();

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.lang = "bn-BD";


    recognition.onstart = () => {

      voiceBtn.classList.add(
        "listening"
      );

      showToast(
        "Listening..."
      );
    };


    recognition.onresult =
      event => {

        const text =
          event.results[0][0]
            .transcript;

        searchInput.value =
          text;

        clearBtn.classList.remove(
          "hidden"
        );

        executeSearch(
          text
        );
      };


    recognition.onerror =
      () => {

        showToast(
          "Voice search could not start."
        );
      };


    recognition.onend = () => {

      voiceBtn.classList.remove(
        "listening"
      );
    };


    voiceBtn?.addEventListener(
      "click",
      () => {

        try {
          recognition.start();
        } catch {
          // Already running
        }

      }
    );

  } else {

    voiceBtn?.addEventListener(
      "click",
      () => {

        showToast(
          "Voice search is not supported in this browser."
        );

      }
    );

  }


  /* ===============================
     Bottom Navigation
  =============================== */

  document
    .querySelectorAll(".bottom-item")
    .forEach(item => {

      item.addEventListener(
        "click",
        () => {

          const nav =
            item.dataset.nav;

          document
            .querySelectorAll(
              ".bottom-item"
            )
            .forEach(button => {
              button.classList.remove(
                "active"
              );
            });

          item.classList.add(
            "active"
          );


          if (nav === "home") {

            window.scrollTo({
              top: 0,
              behavior: "smooth"
            });

            return;
          }


          if (
            nav === "images"
          ) {

            imageInput?.click();

            return;
          }


          if (
            nav === "videos"
          ) {

            const query =
              searchInput.value.trim();

            if (!query) {

              showToast(
                "Search something first."
              );

              return;
            }

            executeSearch(
              query,
              "videos"
            );

            return;
          }


          if (
            nav === "history"
          ) {

            showToast(
              "Search history will be available here."
            );

            return;
          }


          if (
            nav === "more"
          ) {

            showToast(
              "More features coming soon."
            );

          }

        }
      );
    });


  /* ===============================
     See All Trending
  =============================== */

  document
    .getElementById(
      "seeTrendingBtn"
    )
    ?.addEventListener(
      "click",
      () => {

        trendingBox.scrollIntoView({
          behavior: "smooth"
        });

      }
    );


  /* ===============================
     Outside click
  =============================== */

  document.addEventListener(
    "click",
    event => {

      if (
        !event.target.closest(
          ".search-section"
        )
      ) {
        hideSuggestions();
      }

    }
  );


  /* ===============================
     Init
  =============================== */

  initTheme();

  loadTrending();

})();
