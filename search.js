document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearBtn");
  const queryTitle = document.getElementById("queryTitle");
  const resultCount = document.getElementById("resultCount");
  
  const loadingState = document.getElementById("loadingState");
  const resultsList = document.getElementById("resultsList");
  const emptyState = document.getElementById("emptyState");
  const errorState = document.getElementById("errorState");
  const errorMessage = document.getElementById("errorMessage");
  const retryBtn = document.getElementById("retryBtn");
  
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsOverlay = document.getElementById("settingsOverlay");
  const closeSettings = document.getElementById("closeSettings");
  const themeToggle = document.getElementById("themeToggle");
  const themeStatus = document.getElementById("themeStatus");
  const mobileHomeBtn = document.getElementById("mobileHomeBtn");
  const emptyHomeBtn = document.getElementById("emptyHomeBtn");
  const settingsHomeBtn = document.getElementById("settingsHomeBtn");

  let currentQuery = "";

  // 1. CLEAR BUTTON LOGIC
  function updateClearButtonState() {
    if (searchInput.value.trim()) {
      clearBtn.style.display = "grid";
    } else {
      clearBtn.style.display = "none";
    }
  }

  searchInput.addEventListener("input", updateClearButtonState);

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    updateClearButtonState();
    searchInput.focus();
  });

  // 2. QUERY PARSING & INITIAL SEARCH
  const urlParams = new URLSearchParams(window.location.search);
  const queryParam = urlParams.get("q");

  if (queryParam) {
    currentQuery = queryParam.trim();
    searchInput.value = currentQuery;
    queryTitle.textContent = currentQuery;
    updateClearButtonState();
    performSearch(currentQuery);
  } else {
    showState(emptyState);
    queryTitle.textContent = "No Query";
  }

  // 3. FORM SUBMISSION
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
  });

  // 4. SEARCH API CALL
  async function performSearch(query) {
    showState(loadingState);

    try {
      // Configuration via config.js
      const apiUrl = (window.CONFIG && window.CONFIG.API_URL) 
        ? `${window.CONFIG.API_URL}?q=${encodeURIComponent(query)}` 
        : `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`;

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const data = await response.json();
      renderResults(data);
    } catch (err) {
      console.error("Search error:", err);
      errorMessage.textContent = "Unable to load search results. Please try again.";
      showState(errorState);
    }
  }

  // 5. RENDER RESULTS
  function renderResults(data) {
    resultsList.innerHTML = "";

    // Adapting for DuckDuckGo RelatedTopics or custom API payload
    const topics = data.RelatedTopics || [];
    const filteredResults = topics.filter(t => t.Text && t.FirstURL);

    if (filteredResults.length === 0) {
      resultCount.textContent = "0 results";
      showState(emptyState);
      return;
    }

    resultCount.textContent = `${filteredResults.length} results found`;

    filteredResults.forEach(item => {
      const card = document.createElement("article");
      card.className = "result-card";

      const url = document.createElement("div");
      url.className = "result-url";
      url.textContent = item.FirstURL;

      const title = document.createElement("h2");
      title.className = "result-title";
      
      const link = document.createElement("a");
      link.href = item.FirstURL;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = item.Text.split(' - ')[0] || item.Text;
      
      title.appendChild(link);

      const snippet = document.createElement("p");
      snippet.className = "result-snippet";
      snippet.textContent = item.Text;

      card.appendChild(url);
      card.appendChild(title);
      card.appendChild(snippet);

      resultsList.appendChild(card);
    });

    showState(resultsList);
  }

  // 6. UI STATE CONTROLLER
  function showState(targetElement) {
    [loadingState, resultsList, emptyState, errorState].forEach(el => {
      if (el) el.classList.add("hidden");
    });
    if (targetElement) {
      targetElement.classList.remove("hidden");
    }
  }

  // 7. RETRY BTN
  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      if (currentQuery) performSearch(currentQuery);
    });
  }

  // 8. SETTINGS MODAL & THEME TOGGLE
  if (settingsBtn && settingsOverlay && closeSettings) {
    settingsBtn.addEventListener("click", () => {
      settingsOverlay.classList.add("open");
      settingsOverlay.setAttribute("aria-hidden", "false");
    });

    closeSettings.addEventListener("click", () => {
      settingsOverlay.classList.remove("open");
      settingsOverlay.setAttribute("aria-hidden", "true");
    });
  }

  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  if (themeStatus) themeStatus.textContent = savedTheme === "dark" ? "On" : "Off";

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("theme", nextTheme);
      if (themeStatus) themeStatus.textContent = nextTheme === "dark" ? "On" : "Off";
    });
  }

  // 9. NAVIGATION HELPERS
  const goHome = () => { window.location.href = "/"; };
  if (mobileHomeBtn) mobileHomeBtn.addEventListener("click", goHome);
  if (emptyHomeBtn) emptyHomeBtn.addEventListener("click", goHome);
  if (settingsHomeBtn) settingsHomeBtn.addEventListener("click", goHome);
});
