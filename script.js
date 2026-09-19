/* =========================================================
   WARELIGENT SEARCH ENGINE
   Main Application Script
   ========================================================= */


/* =========================================================
   0. SUPABASE
   ========================================================= */

const SUPABASE_URL =
    "https://xveccsbdrysuiwyuvodw.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_HkyRE170ylT0kkdZxbwUSQ_ihHrS_Ra";

let supabaseClient = null;

try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_ANON_KEY
        );
    }
} catch (error) {
    console.error("Supabase initialization failed:", error);
}


/* =========================================================
   1. DOM ELEMENTS
   ========================================================= */

const searchInput = document.getElementById("searchInput");
const searchForm = document.getElementById("searchForm");

const clearBtn = document.getElementById("clearBtn");
const voiceBtn = document.getElementById("voiceBtn");
const imageInput = document.getElementById("imageInput");

const suggestionsList =
    document.getElementById("suggestionsList");

const resultsFeed =
    document.getElementById("resultsFeed");

const resultsHeader =
    document.getElementById("resultsHeader");

const resultsLabel =
    document.getElementById("resultsLabel");

const resultsCount =
    document.getElementById("resultsCount");

const loadingState =
    document.getElementById("loadingState");

const emptyState =
    document.getElementById("emptyState");

const errorState =
    document.getElementById("errorState");

const errorMessage =
    document.getElementById("errorMessage");

const historySection =
    document.getElementById("historySection");

const historyList =
    document.getElementById("historyList");

const settingsPanel =
    document.getElementById("settingsPanel");

const settingsOverlay =
    document.getElementById("settingsOverlay");

const historyToggle =
    document.getElementById("historyToggle");

const safeSearchToggle =
    document.getElementById("safeSearchToggle");


/* =========================================================
   2. APP STATE
   ========================================================= */

let selectedSuggestionIndex = -1;
let suggestionTimer = null;

let currentQuery = "";
let currentSearchType = "all";

let lastSearchQuery = "";

let isSearching = false;

let sortMode = "relevance";

let recognition = null;
let isRecording = false;


/* =========================================================
   3. STORAGE KEYS
   ========================================================= */

const STORAGE_KEYS = {
    HISTORY: "wareligent_search_history",
    THEME: "wareligent_theme",
    HISTORY_ENABLED: "wareligent_history_enabled",
    SAFE_SEARCH: "wareligent_safe_search"
};


/* =========================================================
   4. INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    initializeSettings();

    initializeSearch();

    initializeVoiceSearch();

    initializeImageSearch();

    renderSearchHistory();

    updateClearButton();

    loadInitialPage();

});


/* =========================================================
   5. INITIAL PAGE
   ========================================================= */

async function loadInitialPage() {

    hideLoading();
    hideError();
    hideEmpty();

    if (resultsFeed) {
        resultsFeed.innerHTML = "";
    }

    if (resultsHeader) {
        resultsHeader.hidden = true;
    }

    /*
     * Initial page intentionally stays clean.
     * Search results are loaded after the user searches.
     */
}


/* =========================================================
   6. SEARCH INITIALIZATION
   ========================================================= */

function initializeSearch() {

    if (!searchInput) return;


    /* Input */

    searchInput.addEventListener("input", () => {

        const query = searchInput.value.trim();

        updateClearButton();

        selectedSuggestionIndex = -1;

        if (!query) {
            hideSuggestions();
            return;
        }

        clearTimeout(suggestionTimer);

        suggestionTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 250);

    });


    /* Keyboard */

    searchInput.addEventListener("keydown", (event) => {

        const items =
            suggestionsList
                ? suggestionsList.querySelectorAll("li")
                : [];


        if (event.key === "ArrowDown") {

            if (!items.length) return;

            event.preventDefault();

            selectedSuggestionIndex =
                (selectedSuggestionIndex + 1) %
                items.length;

            updateSuggestionSelection(items);

            return;
        }


        if (event.key === "ArrowUp") {

            if (!items.length) return;

            event.preventDefault();

            selectedSuggestionIndex =
                (selectedSuggestionIndex - 1 + items.length) %
                items.length;

            updateSuggestionSelection(items);

            return;
        }


        if (event.key === "Escape") {

            hideSuggestions();

            return;
        }


        if (event.key === "Enter") {

            event.preventDefault();

            if (
                selectedSuggestionIndex >= 0 &&
                items[selectedSuggestionIndex]
            ) {

                const selectedValue =
                    items[selectedSuggestionIndex].dataset.val;

                searchInput.value = selectedValue;

            }

            hideSuggestions();

            executeSearch();

        }

    });


    /* Form */

    if (searchForm) {

        searchForm.addEventListener("submit", (event) => {

            event.preventDefault();

            executeSearch();

        });

    }


    /* Outside click */

    document.addEventListener("click", (event) => {

        if (
            suggestionsList &&
            !suggestionsList.contains(event.target) &&
            !searchForm?.contains(event.target)
        ) {
            hideSuggestions();
        }

    });

}


/* =========================================================
   7. CLEAR BUTTON
   ========================================================= */

function updateClearButton() {

    if (!clearBtn || !searchInput) return;

    const hasValue =
        searchInput.value.trim().length > 0;

    clearBtn.hidden = !hasValue;

}


/* =========================================================
   8. CLEAR SEARCH
   ========================================================= */

function clearSearch() {

    if (searchInput) {
        searchInput.value = "";
        searchInput.focus();
    }

    currentQuery = "";
    lastSearchQuery = "";

    updateClearButton();

    hideSuggestions();
    hideLoading();
    hideError();
    hideEmpty();

    if (resultsFeed) {
        resultsFeed.innerHTML = "";
    }

    if (resultsHeader) {
        resultsHeader.hidden = true;
    }

    showHomeNavigation();

}


/* =========================================================
   9. QUICK SEARCH
   ========================================================= */

function quickSearch(queryText) {

    if (!queryText) return;

    if (searchInput) {
        searchInput.value = queryText;
    }

    updateClearButton();

    executeSearch(queryText);

}


/* =========================================================
   10. SEARCH SUGGESTIONS
   ========================================================= */

function fetchSuggestions(query) {

    if (!suggestionsList || !query) return;

    const oldScript =
        document.getElementById("jsonp-suggestions");

    if (oldScript) {
        oldScript.remove();
    }


    window.handleGoogleSuggestions = (data) => {

        const suggestions =
            data && Array.isArray(data[1])
                ? data[1]
                : [];

        renderSuggestions(suggestions);

    };


    const script =
        document.createElement("script");

    script.id = "jsonp-suggestions";

    script.src =
        `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=handleGoogleSuggestions`;

    script.onerror = () => {
        renderSuggestions([]);
    };

    document.body.appendChild(script);

}


/* =========================================================
   11. RENDER SUGGESTIONS
   ========================================================= */

function renderSuggestions(suggestions) {

    if (!suggestionsList) return;

    suggestionsList.innerHTML = "";

    selectedSuggestionIndex = -1;

    if (!suggestions || suggestions.length === 0) {

        hideSuggestions();

        return;
    }


    suggestions
        .filter(Boolean)
        .slice(0, 7)
        .forEach((term) => {

            const li =
                document.createElement("li");

            li.dataset.val = term;

            li.setAttribute(
                "role",
                "option"
            );


            const icon =
                document.createElement("span");

            icon.className =
                "suggestion-icon";

            icon.textContent = "⌕";


            const text =
                document.createElement("span");

            text.textContent = term;


            li.appendChild(icon);
            li.appendChild(text);


            li.addEventListener("mousedown", (event) => {

                event.preventDefault();

                if (searchInput) {
                    searchInput.value = term;
                }

                hideSuggestions();

                executeSearch(term);

            });


            suggestionsList.appendChild(li);

        });


    if (suggestionsList.children.length) {

        suggestionsList.hidden = false;

    }

}


/* =========================================================
   12. SUGGESTION KEYBOARD SELECTION
   ========================================================= */

function updateSuggestionSelection(items) {

    items.forEach((item, index) => {

        const selected =
            index === selectedSuggestionIndex;

        item.classList.toggle(
            "selected",
            selected
        );

        item.setAttribute(
            "aria-selected",
            selected ? "true" : "false"
        );

    });


    const selected =
        items[selectedSuggestionIndex];

    if (selected && searchInput) {

        searchInput.value =
            selected.dataset.val;

    }

}


/* =========================================================
   13. HIDE SUGGESTIONS
   ========================================================= */

function hideSuggestions() {

    if (!suggestionsList) return;

    suggestionsList.innerHTML = "";

    suggestionsList.hidden = true;

    selectedSuggestionIndex = -1;

}


/* =========================================================
   14. MAIN SEARCH FUNCTION
   ========================================================= */

async function executeSearch(queryStr = "") {

    if (isSearching) return;


    const query =
        typeof queryStr === "string" &&
        queryStr.trim()
            ? queryStr.trim()
            : searchInput
                ? searchInput.value.trim()
                : "";


    if (!query) {

        clearSearch();

        return;

    }


    currentQuery = query;

    lastSearchQuery = query;

    if (searchInput) {
        searchInput.value = query;
    }

    updateClearButton();

    hideSuggestions();

    saveSearchToHistory(query);

    saveSearchWordToDatabase(query);


    showSearchState();


    isSearching = true;


    try {

        let results =
            await searchSupabase(query);


        /*
         * If database has no result,
         * use the project's existing web API.
         */

        if (!results.length) {

            showLoading(
                "Searching the live web..."
            );

            const webResults =
                await fetchAndSaveFromWeb(query);

            if (webResults.length) {
                results = webResults;
            }

        }


        /*
         * Final result rendering
         */

        if (results.length) {

            results =
                normalizeResults(results);

            results =
                sortResults(results);

            renderResults(results, query);

        } else {

            showEmptyState(query);

        }

    } catch (error) {

        console.error(
            "Wareligent Search Error:",
            error
        );

        showErrorState(
            "Search failed. Please try again."
        );

    } finally {

        isSearching = false;

        hideLoading();

    }

}


/* =========================================================
   15. SUPABASE SEARCH
   ========================================================= */

async function searchSupabase(query) {

    if (!supabaseClient) {
        return [];
    }


    /*
     * Escape PostgREST filter characters.
     */

    const safeQuery =
        escapePostgrestValue(query);


    try {

        let request =
            supabaseClient
                .from("websites")
                .select("*")
                .or(
                    `title.ilike.%${safeQuery}%,keywords.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%`
                )
                .limit(30);


        /*
         * Search type hooks.
         *
         * These are intentionally lightweight because
         * the current database schema does not show
         * dedicated news/image/video fields.
         */

        const { data, error } =
            await request;


        if (error) {

            console.error(
                "Supabase Search Error:",
                error
            );

            return [];

        }


        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        console.error(
            "Supabase request failed:",
            error
        );

        return [];

    }

}


/* =========================================================
   16. POSTGREST ESCAPE
   ========================================================= */

function escapePostgrestValue(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/%/g, "\\%")
        .replace(/_/g, "\\_")
        .replace(/,/g, "\\,")
        .replace(/\./g, "\\.");

}


/* =========================================================
   17. LIVE WEB SEARCH + DATABASE SAVE
   ========================================================= */

async function fetchAndSaveFromWeb(query) {

    try {

        const response =
            await fetch(
                `/api/search-web?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `Web API returned ${response.status}`
            );

        }


        const apiData =
            await response.json();


        if (
            !apiData ||
            !Array.isArray(apiData.results)
        ) {
            return [];
        }


        const items =
            apiData.results
                .filter(item => item && item.link)
                .map(item => ({

                    title:
                        item.title ||
                        "Untitled Result",

                    url:
                        item.link,

                    description:
                        item.snippet ||
                        "",

                    keywords:
                        `${query}, ${
                            item.title
                                ? item.title.toLowerCase()
                                : ""
                        }`

                }));


        /*
         * Save to Supabase.
         */

        if (
            supabaseClient &&
            items.length
        ) {

            try {

                await supabaseClient
                    .from("websites")
                    .insert(items);

            } catch (saveError) {

                /*
                 * Search should still work even if
                 * database saving fails.
                 */

                console.warn(
                    "Could not save web results:",
                    saveError
                );

            }

        }


        return items;

    } catch (error) {

        console.error(
            "Live web search failed:",
            error
        );

        return [];

    }

}


/* =========================================================
   18. NORMALIZE RESULTS
   ========================================================= */

function normalizeResults(results) {

    return results
        .filter(Boolean)
        .map((site) => {

            let targetUrl =
                site.url
                    ? String(site.url).trim()
                    : "";


            if (
                targetUrl &&
                !/^https?:\/\//i.test(targetUrl)
            ) {

                targetUrl =
                    "https://" + targetUrl;

            }


            let domain = "";

            try {

                domain =
                    new URL(targetUrl).hostname;

            } catch {

                domain =
                    targetUrl
                        .replace(/^https?:\/\//i, "")
                        .split("/")[0];

            }


            return {

                ...site,

                title:
                    site.title ||
                    "Untitled Result",

                url:
                    targetUrl,

                domain:
                    domain,

                description:
                    site.description ||
                    site.snippet ||
                    ""

            };

        })
        .filter(site => site.url);

}


/* =========================================================
   19. SORT RESULTS
   ========================================================= */

function sortResults(results) {

    if (!Array.isArray(results)) {
        return [];
    }


    if (sortMode === "recent") {

        return [...results].sort((a, b) => {

            const dateA =
                new Date(
                    a.created_at || 0
                ).getTime();

            const dateB =
                new Date(
                    b.created_at || 0
                ).getTime();

            return dateB - dateA;

        });

    }


    /*
     * Default = relevance.
     * Keep database/API order.
     */

    return results;

}


/* =========================================================
   20. RENDER RESULTS
   ========================================================= */

function renderResults(results, query) {

    if (!resultsFeed) return;


    resultsFeed.innerHTML = "";


    if (resultsHeader) {
        resultsHeader.hidden = false;
    }


    if (resultsLabel) {
        resultsLabel.textContent =
            currentSearchType === "all"
                ? "Search results"
                : `${capitalize(currentSearchType)} results`;
    }


    if (resultsCount) {

        resultsCount.textContent =
            `${results.length} result${
                results.length === 1
                    ? ""
                    : "s"
            }`;

    }


    results.forEach((site) => {

        const card =
            document.createElement("article");

        card.className =
            "result-card";


        const meta =
            document.createElement("div");

        meta.className =
            "result-header";


        /*
         * Favicon
         */

        const icon =
            document.createElement("img");

        icon.className =
            "site-icon";

        icon.alt = "";

        icon.loading = "lazy";

        icon.src =
            `https://www.google.com/s2/favicons?domain=${encodeURIComponent(site.domain)}&sz=32`;

        icon.onerror = () => {
            icon.style.display = "none";
        };


        const domain =
            document.createElement("span");

        domain.className =
            "site-url";

        domain.textContent =
            site.domain || "Web result";


        meta.appendChild(icon);
        meta.appendChild(domain);


        /*
         * Result title
         */

        const title =
            document.createElement("a");

        title.className =
            "result-title";

        title.textContent =
            site.title;

        title.href =
            buildReaderUrl(
                site.url,
                site.title
            );


        /*
         * Result description
         */

        const description =
            document.createElement("p");

        description.className =
            "result-snippet";

        description.innerHTML =
            highlightText(
                escapeHtml(site.description),
                query
            );


        /*
         * Result URL
         */

        const urlLine =
            document.createElement("span");

        urlLine.className =
            "result-url";

        urlLine.textContent =
            shortenUrl(site.url);


        card.appendChild(meta);

        card.appendChild(title);

        card.appendChild(urlLine);

        card.appendChild(description);


        resultsFeed.appendChild(card);

    });


    scrollToResults();

}


/* =========================================================
   21. READER URL
   ========================================================= */

function buildReaderUrl(url, title) {

    if (!url) return "#";


    return (
        `/view.html?url=${
            encodeURIComponent(url)
        }&title=${
            encodeURIComponent(title || "")
        }`
    );

}


/* =========================================================
   22. HIGHLIGHT TEXT
   ========================================================= */

function highlightText(text, keyword) {

    if (!text || !keyword) {
        return text || "";
    }


    const escaped =
        String(keyword)
            .trim()
            .replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );


    if (!escaped) {
        return text;
    }


    const regex =
        new RegExp(
            `(${escaped})`,
            "gi"
        );


    return text.replace(
        regex,
        '<mark class="highlight">$1</mark>'
    );

}


/* =========================================================
   23. HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   24. SHORTEN URL
   ========================================================= */

function shortenUrl(url) {

    if (!url) return "";

    try {

        const parsed =
            new URL(url);

        const path =
            parsed.pathname === "/"
                ? ""
                : parsed.pathname;

        const result =
            `${parsed.hostname}${path}`;

        return result.length > 70
            ? result.slice(0, 67) + "..."
            : result;

    } catch {

        return String(url).slice(0, 70);

    }

}


/* =========================================================
   25. SEARCH UI STATES
   ========================================================= */

function showSearchState() {

    hideEmpty();
    hideError();

    if (resultsFeed) {
        resultsFeed.innerHTML = "";
    }

    if (resultsHeader) {
        resultsHeader.hidden = true;
    }

    showLoading("Searching Wareligent...");

    updateNavigation("home");

}


function showLoading(message = "Searching...") {

    if (!loadingState) return;

    const text =
        loadingState.querySelector("p");

    if (text) {
        text.textContent = message;
    }

    loadingState.hidden = false;

}


function hideLoading() {

    if (loadingState) {
        loadingState.hidden = true;
    }

}


function showEmptyState(query) {

    hideLoading();
    hideError();

    if (resultsFeed) {
        resultsFeed.innerHTML = "";
    }

    if (emptyState) {

        const paragraph =
            emptyState.querySelector("p");

        if (paragraph) {

            paragraph.textContent =
                `No results found for "${query}". Try another search term.`;

        }

        emptyState.hidden = false;

    }

    if (resultsHeader) {
        resultsHeader.hidden = true;
    }

}


function hideEmpty() {

    if (emptyState) {
        emptyState.hidden = true;
    }

}


function showErrorState(message) {

    hideLoading();
    hideEmpty();

    if (resultsFeed) {
        resultsFeed.innerHTML = "";
    }

    if (errorMessage) {
        errorMessage.textContent =
            message;
    }

    if (errorState) {
        errorState.hidden = false;
    }

    if (resultsHeader) {
        resultsHeader.hidden = true;
    }

}


function hideError() {

    if (errorState) {
        errorState.hidden = true;
    }

}


/* =========================================================
   26. RETRY
   ========================================================= */

function retrySearch() {

    if (!lastSearchQuery) return;

    executeSearch(lastSearchQuery);

}


/* =========================================================
   27. SEARCH TYPE TABS
   ========================================================= */

function changeSearchType(type) {

    const allowedTypes = [
        "all",
        "news",
        "images",
        "videos"
    ];


    if (!allowedTypes.includes(type)) {
        type = "all";
    }


    currentSearchType = type;


    document
        .querySelectorAll(".search-tab")
        .forEach(tab => {

            tab.classList.toggle(
                "active",
                tab.dataset.type === type
            );

        });


    /*
     * If there is already a query,
     * re-run it with the selected type.
     */

    if (currentQuery) {
        executeSearch(currentQuery);
    }

}


/* =========================================================
   28. SORT
   ========================================================= */

function toggleSort() {

    sortMode =
        sortMode === "relevance"
            ? "recent"
            : "relevance";


    const sortBtn =
        document.getElementById("sortBtn");

    if (sortBtn) {

        sortBtn.textContent =
            sortMode === "relevance"
                ? "Relevance"
                : "Recent";

    }


    if (currentQuery) {
        executeSearch(currentQuery);
    }

}


/* =========================================================
   29. LOCAL SEARCH HISTORY
   ========================================================= */

function getSearchHistory() {

    try {

        const history =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEYS.HISTORY
                ) || "[]"
            );

        return Array.isArray(history)
            ? history
            : [];

    } catch {

        return [];

    }

}


function saveSearchToHistory(query) {

    if (!query) return;

    if (
        localStorage.getItem(
            STORAGE_KEYS.HISTORY_ENABLED
        ) === "false"
    ) {
        return;
    }


    const clean =
        query.trim();


    if (clean.length < 2) {
        return;
    }


    let history =
        getSearchHistory();


    history =
        history.filter(
            item =>
                item.toLowerCase() !==
                clean.toLowerCase()
        );


    history.unshift(clean);


    history =
        history.slice(0, 15);


    try {

        localStorage.setItem(
            STORAGE_KEYS.HISTORY,
            JSON.stringify(history)
        );

    } catch (error) {

        console.warn(
            "Could not save local history:",
            error
        );

    }


    renderSearchHistory();

}


/* =========================================================
   30. RENDER HISTORY
   ========================================================= */

function renderSearchHistory() {

    if (!historyList || !historySection) {
        return;
    }


    const history =
        getSearchHistory();


    historyList.innerHTML = "";


    if (!history.length) {

        historySection.hidden = true;

        return;

    }


    historySection.hidden = false;


    history.forEach((query) => {

        const button =
            document.createElement("button");

        button.className =
            "history-item";

        button.type =
            "button";


        const icon =
            document.createElement("span");

        icon.textContent =
            "↶";


        const text =
            document.createElement("span");

        text.textContent =
            query;


        button.appendChild(icon);
        button.appendChild(text);


        button.addEventListener(
            "click",
            () => {

                if (searchInput) {
                    searchInput.value =
                        query;
                }

                updateClearButton();

                executeSearch(query);

            }
        );


        historyList.appendChild(button);

    });

}


/* =========================================================
   31. SHOW HISTORY
   ========================================================= */

function showSearchHistory() {

    renderSearchHistory();

    if (historySection) {

        historySection.hidden = false;

        historySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    updateNavigation("history");

}


/* =========================================================
   32. CLEAR HISTORY
   ========================================================= */

function clearSearchHistory() {

    try {

        localStorage.removeItem(
            STORAGE_KEYS.HISTORY
        );

    } catch (error) {

        console.warn(error);

    }


    renderSearchHistory();

}


/* =========================================================
   33. SUPABASE SEARCH HISTORY
   ========================================================= */

async function saveSearchWordToDatabase(word) {

    if (!supabaseClient || !word) {
        return;
    }


    const cleanWord =
        word
            .trim()
            .toLowerCase();


    if (cleanWord.length < 2) {
        return;
    }


    try {

        const {
            data: sessionData
        } =
            await supabaseClient.auth.getSession();


        const user =
            sessionData?.session?.user || null;


        const payload = {

            keyword:
                cleanWord,

            created_at:
                new Date().toISOString(),

            user_id:
                user
                    ? user.id
                    : null

        };


        let checkQuery =
            supabaseClient
                .from("search_suggestions")
                .select("id")
                .eq("keyword", cleanWord);


        if (user) {

            checkQuery =
                checkQuery.eq(
                    "user_id",
                    user.id
                );

        } else {

            checkQuery =
                checkQuery.is(
                    "user_id",
                    null
                );

        }


        const {
            data,
            error
        } =
            await checkQuery.maybeSingle();


        if (error) {

            console.warn(
                "History lookup failed:",
                error
            );

            return;

        }


        if (data) {

            await supabaseClient
                .from("search_suggestions")
                .update({
                    created_at:
                        payload.created_at
                })
                .eq(
                    "id",
                    data.id
                );

        } else {

            await supabaseClient
                .from("search_suggestions")
                .insert([
                    payload
                ]);

        }

    } catch (error) {

        console.warn(
            "Database history save failed:",
            error
        );

    }

}


/* =========================================================
   34. VOICE SEARCH
   ========================================================= */

function initializeVoiceSearch() {

    if (!voiceBtn) return;


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        voiceBtn.title =
            "Voice search is not supported";

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous =
        false;

    recognition.interimResults =
        false;


    /*
     * Bengali first.
     * Browser may use the user's microphone language.
     */

    recognition.lang =
        "bn-BD";


    recognition.onstart = () => {

        isRecording = true;

        voiceBtn.classList.add(
            "recording"
        );

        voiceBtn.setAttribute(
            "aria-label",
            "Listening..."
        );

        if (searchInput) {
            searchInput.placeholder =
                "শুনছি...";
        }

    };


    recognition.onresult = (event) => {

        const transcript =
            event.results?.[0]?.[0]?.transcript
            ?.trim();


        if (!transcript) return;


        if (searchInput) {
            searchInput.value =
                transcript;
        }

        updateClearButton();

        executeSearch(transcript);

    };


    recognition.onerror = (event) => {

        console.warn(
            "Voice recognition error:",
            event.error
        );

    };


    recognition.onend = () => {

        isRecording = false;

        voiceBtn.classList.remove(
            "recording"
        );

        voiceBtn.setAttribute(
            "aria-label",
            "Voice search"
        );

        if (searchInput) {
            searchInput.placeholder =
                "Search the web...";
        }

    };


    voiceBtn.addEventListener(
        "click",
        startVoiceRecognition
    );

}


function startVoiceRecognition() {

    if (!recognition) {

        alert(
            "আপনার ব্রাউজারে Voice Search সাপোর্ট করছে না। Chrome বা Edge ব্যবহার করে আবার চেষ্টা করুন।"
        );

        return;

    }


    if (isRecording) {

        recognition.stop();

        return;

    }


    try {

        recognition.start();

    } catch (error) {

        console.warn(
            "Could not start voice recognition:",
            error
        );

    }

}


/* =========================================================
   35. IMAGE SEARCH
   ========================================================= */

function initializeImageSearch() {

    if (!imageInput) return;


    imageInput.addEventListener(
        "change",
        handleImageUpload
    );

}


function handleImageUpload(event) {

    const file =
        event.target?.files?.[0];


    if (!file) return;


    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;

    }


    /*
     * Current backend does not provide
     * a real reverse-image-search endpoint.
     *
     * For now we use the filename as a
     * searchable keyword.
     */

    const imageName =
        file.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim();


    if (!imageName) {

        alert(
            "ছবিটির নাম থেকে কোনো search keyword পাওয়া যায়নি।"
        );

        return;

    }


    if (searchInput) {
        searchInput.value =
            imageName;
    }

    updateClearButton();

    executeSearch(imageName);


    /*
     * Reset input so the same image
     * can be selected again later.
     */

    event.target.value = "";

}


/* =========================================================
   36. THEME
   ========================================================= */

function initializeSettings() {

    const savedTheme =
        localStorage.getItem(
            STORAGE_KEYS.THEME
        );


    if (savedTheme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }


    const historyEnabled =
        localStorage.getItem(
            STORAGE_KEYS.HISTORY_ENABLED
        );


    if (historyToggle) {

        historyToggle.checked =
            historyEnabled !== "false";

    }


    const safeSearch =
        localStorage.getItem(
            STORAGE_KEYS.SAFE_SEARCH
        );


    if (safeSearchToggle) {

        safeSearchToggle.checked =
            safeSearch !== "false";

    }

}


function toggleTheme() {

    const isLight =
        document.body.classList.toggle(
            "light-theme"
        );


    localStorage.setItem(
        STORAGE_KEYS.THEME,
        isLight
            ? "light"
            : "dark"
    );

}


/* =========================================================
   37. SETTINGS PANEL
   ========================================================= */

function openSettings() {

    if (!settingsPanel) return;


    settingsPanel.hidden = false;

    settingsPanel.setAttribute(
        "aria-hidden",
        "false"
    );


    if (settingsOverlay) {
        settingsOverlay.hidden = false;
    }


    document.body.classList.add(
        "settings-open"
    );


    updateNavigation("settings");

}


function closeSettings() {

    if (!settingsPanel) return;


    settingsPanel.hidden = true;

    settingsPanel.setAttribute(
        "aria-hidden",
        "true"
    );


    if (settingsOverlay) {
        settingsOverlay.hidden = true;
    }


    document.body.classList.remove(
        "settings-open"
    );


    updateNavigation("home");

}


/* =========================================================
   38. HISTORY SETTING
   ========================================================= */

function toggleSearchHistory(enabled) {

    localStorage.setItem(
        STORAGE_KEYS.HISTORY_ENABLED,
        enabled
            ? "true"
            : "false"
    );


    if (!enabled) {

        clearSearchHistory();

    }

}


/* =========================================================
   39. SAFE SEARCH SETTING
   ========================================================= */

function toggleSafeSearch(enabled) {

    localStorage.setItem(
        STORAGE_KEYS.SAFE_SEARCH,
        enabled
            ? "true"
            : "false"
    );

}


/* =========================================================
   40. NAVIGATION
   ========================================================= */

function updateNavigation(active) {

    document
        .querySelectorAll(".nav-link")
        .forEach(link => {

            link.classList.toggle(
                "active",
                link.dataset.nav === active
            );

        });

}


function showHomeNavigation() {

    updateNavigation("home");

}


/* =========================================================
   41. SCROLL TO RESULTS
   ========================================================= */

function scrollToResults() {

    const resultsSection =
        document.querySelector(
            ".results-section"
        );


    if (!resultsSection) return;


    /*
     * Don't force scroll on the initial page.
     * Only scroll after a real search.
     */

    if (window.innerWidth < 700) {

        setTimeout(() => {

            resultsSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 100);

    }

}


/* =========================================================
   42. UTILITY
   ========================================================= */

function capitalize(value) {

    if (!value) return "";

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


/* =========================================================
   43. GLOBAL EXPORTS
   =========================================================
   The new index.html uses inline onclick handlers.
   These functions must therefore be available globally.
   ========================================================= */

window.executeSearch =
    executeSearch;

window.quickSearch =
    quickSearch;

window.clearSearch =
    clearSearch;

window.startVoiceRecognition =
    startVoiceRecognition;

window.changeSearchType =
    changeSearchType;

window.toggleSort =
    toggleSort;

window.retrySearch =
    retrySearch;

window.toggleTheme =
    toggleTheme;

window.openSettings =
    openSettings;

window.closeSettings =
    closeSettings;

window.toggleSearchHistory =
    toggleSearchHistory;

window.toggleSafeSearch =
    toggleSafeSearch;

window.showSearchHistory =
    showSearchHistory;

window.clearSearchHistory =
    clearSearchHistory;

window.handleImageUpload =
    handleImageUpload;
