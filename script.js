/* ====================================
   Wareligent Search Engine
   Global English UI
==================================== */

(() => {
  "use strict";


  /* ================================
     Supabase
  ================================= */

  const SUPABASE_URL =
    "https://xveccsbdrysuiwyuvodw.supabase.co";

  const SUPABASE_KEY =
    "sb_publishable_HkyRE170ylT0kkdZxbwUSQ_ihHrS_Ra";

  let supabaseClient = null;

  try {
    if (
      window.supabase &&
      SUPABASE_URL.includes(".supabase.co")
    ) {
      supabaseClient =
        window.supabase.createClient(
          SUPABASE_URL,
          SUPABASE_KEY
        );
    }
  } catch (error) {
    console.warn(
      "Supabase unavailable:",
      error
    );
  }


  /* ================================
     Elements
  ================================= */

  const themeToggleBtn =
    document.getElementById(
      "themeToggleBtn"
    );

  const themeIcon =
    document.getElementById(
      "themeIcon"
    );

  const homeSearchButton =
    document.getElementById(
      "homeSearchButton"
    );

  const refreshWeatherBtn =
    document.getElementById(
      "refreshWeatherBtn"
    );

  const weatherCard =
    document.getElementById(
      "weatherCard"
    );

  const newsList =
    document.getElementById(
      "newsList"
    );

  const openNewsSearch =
    document.getElementById(
      "openNewsSearch"
    );


  /* ================================
     Theme
  ================================= */

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
        theme === "dark"
          ? "☀"
          : "☾";
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

    if (saved === "dark" || saved === "light") {
      setTheme(saved);
      return;
    }

    const dark =
      window.matchMedia &&
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;

    setTheme(
      dark ? "dark" : "light"
    );
  }


  themeToggleBtn?.addEventListener(
    "click",
    () => {

      const dark =
        document.body.classList.contains(
          "dark-theme"
        );

      setTheme(
        dark ? "light" : "dark"
      );
    }
  );


  /* ================================
     Open Search Page
  ================================= */

  function openSearchPage(query = "") {

    const value =
      String(query || "").trim();

    if (value) {

      window.location.href =
        `/search.html?q=${encodeURIComponent(
          value
        )}`;

    } else {

      window.location.href =
        "/search.html";

    }
  }


  homeSearchButton?.addEventListener(
    "click",
    () => {
      openSearchPage();
    }
  );


  /* ================================
     News Search
  ================================= */

  openNewsSearch?.addEventListener(
    "click",
    () => {

      window.location.href =
        "/search.html?q=latest news";

    }
  );


  /* ================================
     Weather
  ================================= */

  function weatherIcon(code) {

    if (code === 0) return "☀️";

    if (
      code === 1 ||
      code === 2
    ) {
      return "🌤️";
    }

    if (code === 3) {
      return "☁️";
    }

    if (
      code >= 45 &&
      code <= 48
    ) {
      return "🌫️";
    }

    if (
      code >= 51 &&
      code <= 67
    ) {
      return "🌧️";
    }

    if (
      code >= 71 &&
      code <= 77
    ) {
      return "❄️";
    }

    if (
      code >= 80 &&
      code <= 82
    ) {
      return "🌦️";
    }

    if (
      code >= 95
    ) {
      return "⛈️";
    }

    return "🌤️";
  }


  function weatherText(code) {

    const map = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
      51: "Light drizzle",
      53: "Drizzle",
      55: "Heavy drizzle",
      61: "Light rain",
      63: "Rain",
      65: "Heavy rain",
      71: "Light snow",
      73: "Snow",
      75: "Heavy snow",
      80: "Rain showers",
      81: "Rain showers",
      82: "Heavy showers",
      95: "Thunderstorm",
      96: "Thunderstorm",
      99: "Thunderstorm"
    };

    return map[code] || "Current weather";
  }


  async function getLocation() {

    return new Promise(
      (resolve) => {

        if (!navigator.geolocation) {
          resolve(null);
          return;
        }

        navigator.geolocation.getCurrentPosition(
          position => {

            resolve({
              lat:
                position.coords.latitude,

              lon:
                position.coords.longitude
            });

          },

          () => {
            resolve(null);
          },

          {
            enableHighAccuracy: false,
            timeout: 8000,
            maximumAge: 600000
          }
        );

      }
    );
  }


  async function loadWeather() {

    if (!weatherCard) return;

    weatherCard.innerHTML = `
      <div class="weather-loading">
        Loading weather...
      </div>
    `;


    try {

      let location =
        await getLocation();


      /*
       * Default location is used only
       * when the browser does not provide
       * a location.
       */

      if (!location) {

        location = {
          lat: 23.8103,
          lon: 90.4125
        };
      }


      const weatherUrl =
        "https://api.open-meteo.com/v1/forecast" +
        `?latitude=${location.lat}` +
        `&longitude=${location.lon}` +
        "&current=temperature_2m,weather_code" +
        "&timezone=auto";


      const response =
        await fetch(weatherUrl);


      if (!response.ok) {
        throw new Error(
          "Weather request failed"
        );
      }


      const data =
        await response.json();


      const current =
        data.current;


      const temperature =
        Math.round(
          current.temperature_2m
        );


      const code =
        current.weather_code;


      weatherCard.innerHTML = `
        <div class="weather-main">

          <div>

            <div class="weather-location">
              Current weather
            </div>

            <div class="weather-temperature">
              ${temperature}°C
            </div>

            <div class="weather-condition">
              ${weatherText(code)}
            </div>

          </div>

          <div class="weather-icon">
            ${weatherIcon(code)}
          </div>

        </div>
      `;

    } catch (error) {

      console.warn(
        "Weather unavailable:",
        error
      );

      weatherCard.innerHTML = `
        <div class="weather-loading">
          Weather is currently unavailable.
        </div>
      `;
    }
  }


  refreshWeatherBtn?.addEventListener(
    "click",
    loadWeather
  );


  /* ================================
     News
  ================================= */

  const fallbackNews = [
    {
      title:
        "Latest technology and innovation news",
      source:
        "Technology"
    },

    {
      title:
        "Artificial intelligence continues to evolve",
      source:
        "AI"
    },

    {
      title:
        "Global science and technology updates",
      source:
        "Science"
    }
  ];


  function escapeHtml(value) {

    return String(value || "")
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


  async function loadNews() {

    if (!newsList) return;


    try {

      /*
       * Your existing backend can provide
       * live news through /api/search-web.
       */

      const response =
        await fetch(
          "/api/search-web?q=latest%20news&type=news",
          {
            headers: {
              Accept:
                "application/json"
            }
          }
        );


      if (!response.ok) {
        throw new Error(
          "News API unavailable"
        );
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


      if (!results.length) {
        throw new Error(
          "No news results"
        );
      }


      newsList.innerHTML =
        results
          .slice(0, 5)
          .map(item => {

            const title =
              item.title ||
              item.name ||
              "Latest news";

            const source =
              item.source ||
              item.site ||
              "Web";

            const url =
              item.url ||
              item.link ||
              "#";


            return `
              <a
                class="news-item"
                href="${escapeHtml(url)}"
                target="_blank"
                rel="noopener noreferrer"
              >

                <div class="news-source">
                  ${escapeHtml(source)}
                </div>

                <div class="news-title">
                  ${escapeHtml(title)}
                </div>

              </a>
            `;
          })
          .join("");


    } catch (error) {

      console.warn(
        "News unavailable:",
        error
      );


      newsList.innerHTML =
        fallbackNews
          .map(item => `
            <button
              class="news-item"
              type="button"
              data-news-query="${escapeHtml(
                item.title
              )}"
            >

              <div class="news-source">
                ${escapeHtml(
                  item.source
                )}
              </div>

              <div class="news-title">
                ${escapeHtml(
                  item.title
                )}
              </div>

            </button>
          `)
          .join("");


      newsList
        .querySelectorAll(
          "[data-news-query]"
        )
        .forEach(button => {

          button.addEventListener(
            "click",
            () => {

              openSearchPage(
                button.dataset.newsQuery
              );

            }
          );

        });
    }
  }


  /* ================================
     Init
  ================================= */

  initTheme();

  loadWeather();

  loadNews();

})();
