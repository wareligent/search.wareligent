// --- 0. SUPABASE INTEGRATION ---
const SUPABASE_URL = "https://xveccsbdrysuiwyuvodw.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_HkyRE170ylT0kkdZxbwUSQ_ihHrS_Ra";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to save search keyword to database (User History Handling)
async function saveSearchWordToDatabase(word) {
    if (!word) return;
    const cleanWord = word.trim().toLowerCase();

    // Filter: Empty or keywords shorter than 2 characters will be ignored
    if (!cleanWord || cleanWord.length < 2) return;

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        const user = session ? session.user : null;

        const payload = {
            keyword: cleanWord,
            created_at: new Date().toISOString(),
            user_id: user ? user.id : null
        };

        let checkQuery = supabaseClient.from("search_suggestions").select("id").eq("keyword", cleanWord);
        if (user) checkQuery = checkQuery.eq("user_id", user.id);
        else checkQuery = checkQuery.is("user_id", null);

        const { data } = await checkQuery.maybeSingle();

        if (data) {
            await supabaseClient.from("search_suggestions").update({ created_at: payload.created_at }).eq("id", data.id);
        } else {
            await supabaseClient.from("search_suggestions").insert([payload]);
        }
    } catch (err) {
        console.error("Database Save Error:", err);
    }
}

// --- DOM ELEMENTS ---
const searchInput = document.getElementById('searchInput');
const suggestionsList = document.getElementById('suggestionsList');
const resultsWrapper = document.getElementById('resultsWrapper');
const trendingBox = document.getElementById('trendingBox');
const categoryTabs = document.getElementById('categoryTabs');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeIcon = document.getElementById('themeIcon');
const clearBtn = document.getElementById('clearBtn');
const voiceBtn = document.getElementById('voiceBtn');

let selectedIndex = -1;
let debounceTimer;

// Clean Keyword Highlighting Helper
function highlightText(text, keyword) {
    if (!text || !keyword) return text || '';
    const regex = new RegExp(`(${keyword.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="highlight">$1</mark>');
}

// 1. Theme Switcher (Dark/Light)
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        if (themeIcon) {
            themeIcon.textContent = document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
        }
    });
}

// 2. Input and Clear Button Handling
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';
        selectedIndex = -1;

        if (!query) {
            if (suggestionsList) suggestionsList.innerHTML = '';
            return;
        }

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 200);
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        clearBtn.style.display = 'none';
        if (suggestionsList) suggestionsList.innerHTML = '';
        if (resultsWrapper) resultsWrapper.innerHTML = '';
        if (categoryTabs) categoryTabs.style.display = 'none';
        if (trendingBox) trendingBox.style.display = 'block';
    });
}

// 3. Keyboard Navigation (Arrow Up/Down, Enter)
if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (!suggestionsList) return;
        const items = suggestionsList.querySelectorAll('li');
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (items.length > 0) {
                selectedIndex = (selectedIndex + 1) % items.length;
                updateSelection(items);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (items.length > 0) {
                selectedIndex = (selectedIndex - 1 + items.length) % items.length;
                updateSelection(items);
            }
        } else if (e.key === 'Enter') {
            executeSearch();
        }
    });
}

function updateSelection(items) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('selected');
            if (searchInput) searchInput.value = item.dataset.val;
        } else {
            item.classList.remove('selected');
        }
    });
}

// 4. Real-time Auto-Suggest API (JSONP Method)
function fetchSuggestions(query) {
    const oldScript = document.getElementById('jsonp-suggestions');
    if (oldScript) oldScript.remove();

    window.handleGoogleSuggestions = function(data) {
        const suggestions = (data && data[1]) ? data[1] : [];
        renderSuggestions(suggestions);
    };

    const script = document.createElement('script');
    script.id = 'jsonp-suggestions';
    script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=handleGoogleSuggestions`;
    script.onerror = () => renderSuggestions([]);
    
    document.body.appendChild(script);
}

function renderSuggestions(suggestions) {
    if (!suggestionsList) return;
    suggestionsList.innerHTML = '';
    if (suggestions.length === 0) return;

    suggestions.slice(0, 5).forEach((term) => {
        const li = document.createElement('li');
        li.dataset.val = term;
        li.innerHTML = `<span>🔍</span> ${term}`;
        li.onclick = () => {
            if (searchInput) searchInput.value = term;
            suggestionsList.innerHTML = '';
            executeSearch(term);
        };
        suggestionsList.appendChild(li);
    });
}

// 5. Trending Items Click Event
document.querySelectorAll('.trend-item').forEach(item => {
    item.addEventListener('click', function() {
        const query = this.dataset.query;
        if (searchInput) searchInput.value = query;
        if (clearBtn) clearBtn.style.display = 'block';
        executeSearch(query);
    });
});

// 6. Voice Search Integration
if (voiceBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    voiceBtn.addEventListener('click', () => {
        recognition.start();
        voiceBtn.style.color = '#ef4444';
    });

    recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        if (searchInput) searchInput.value = transcript;
        voiceBtn.style.color = '';
        executeSearch(transcript);
    };

    recognition.onend = () => { voiceBtn.style.color = ''; };
}

// --- NEW: ON-DEMAND AUTO-CRAWL & SAVE FUNCTION ---
async function fetchAndSaveFromWeb(query) {
    try {
        const response = await fetch(`/api/search-web?q=${encodeURIComponent(query)}`);
        const apiData = await response.json();

        if (apiData && apiData.results && apiData.results.length > 0) {
            const itemsToSave = apiData.results.map(item => ({
                title: item.title,
                url: item.link,
                description: item.snippet,
                keywords: `${query}, ${item.title.toLowerCase()}`
            }));

            // Supabase-এ অটোমেটিক অন-ডিমান্ড সেভ
            await supabaseClient.from('websites').insert(itemsToSave);
            return itemsToSave;
        }
    } catch (err) {
        console.error("Auto crawl failed:", err);
    }
    return [];
}

// 7. Search Execution (Database First -> Auto Crawl -> In-Site Reader View)
async function executeSearch(queryStr) {
    const query = (typeof queryStr === 'string' && queryStr.trim() !== '') ? queryStr.trim() : (searchInput ? searchInput.value.trim() : '');
    if (suggestionsList) suggestionsList.innerHTML = '';
    
    if (!query) return;

    const cleanQuery = query.trim().toLowerCase();

    // 1. Save keyword to Supabase database history
    await saveSearchWordToDatabase(cleanQuery);

    // 2. UI Preparation
    if (trendingBox) trendingBox.style.display = 'none';
    if (categoryTabs) categoryTabs.style.display = 'flex';
    if (resultsWrapper) {
        resultsWrapper.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 30px;">Searching Wareligent DB for "${query}"...</p>`;
    }

    try {
        // 3. Search data from Supabase 'websites' table
        let { data: searchResults, error } = await supabaseClient
            .from('websites')
            .select('*')
            .or(`title.ilike.%${cleanQuery}%,keywords.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%`);

        if (error) throw error;

        // 4. ডাটাবেজে ডাটা না পাওয়া গেলে অন-ডিমান্ড অটো ক্রলিং চলবে
        if (!searchResults || searchResults.length === 0) {
            if (resultsWrapper) {
                resultsWrapper.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 30px;">🔍 Live crawling the web & indexing into Wareligent DB...</p>`;
            }
            const autoFetchedData = await fetchAndSaveFromWeb(cleanQuery);
            if (autoFetchedData && autoFetchedData.length > 0) {
                searchResults = autoFetchedData;
            }
        }

        if (resultsWrapper) resultsWrapper.innerHTML = '';

        // 5. Display results using In-Site Reader Links
        if (searchResults && searchResults.length > 0) {
            searchResults.forEach(site => {
                let targetUrl = site.url ? site.url.trim() : '';
                if (targetUrl && !targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                    targetUrl = 'https://' + targetUrl;
                }

                let domain = "";
                try {
                    domain = new URL(targetUrl).hostname;
                } catch (e) {
                    domain = targetUrl;
                }

                const highlightedSnippet = highlightText(site.description || '', cleanQuery);

                const card = document.createElement('div');
                card.className = 'result-card';
                
                // লিংকে সরাসরি না গিয়ে view.html এ রিডাইরেক্ট করবে
                card.innerHTML = `
                    <div class="result-header">
                        <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=32" class="site-icon" alt="">
                        <span class="site-url">${domain}</span>
                    </div>
                    <a href="/view.html?url=${encodeURIComponent(targetUrl)}&title=${encodeURIComponent(site.title)}" class="result-title">${site.title}</a>
                    <p class="result-snippet">${highlightedSnippet}</p>
                `;
                resultsWrapper.appendChild(card);
            });
        } else {
            if (resultsWrapper) {
                resultsWrapper.innerHTML = `
                    <div class="result-card" style="text-align: center; padding: 25px;">
                        <p style="color: var(--text-secondary);">No results found anywhere for "${query}".</p>
                    </div>
                `;
            }
        }
    } catch (err) {
        console.error("Search Error:", err);
        if (resultsWrapper) {
            resultsWrapper.innerHTML = `
                <div class="result-card" style="text-align: center; padding: 20px;">
                    <p style="color: #ef4444;">An error occurred while searching.</p>
                </div>
            `;
        }
    }
}
