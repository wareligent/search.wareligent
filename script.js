/* ====================================
   Wareligent Search Engine - Simple Logic
==================================== */

(() => {
  "use strict";

  /* DOM Elements */
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = document.getElementById("themeIcon");
  const homeSearchButton = document.getElementById("homeSearchButton");
  const weatherCard = document.getElementById("weatherCard");
  const profileBtn = document.getElementById("profileBtn");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileModal = document.getElementById("profileModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const authContent = document.getElementById("authContent");

  /* ================================
     Theme Toggle
  ================================= */
  function setTheme(theme) {
    document.body.classList.toggle("dark-theme", theme === "dark");
    if (themeIcon) themeIcon.textContent = theme === "dark" ? "☀" : "☾";
    localStorage.setItem("wareligent-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("wareligent-theme");
    if (saved) {
      setTheme(saved);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    setTheme(isDark ? "light" : "dark");
  });

  /* ================================
     Search Redirect
  ================================= */
  homeSearchButton?.addEventListener("click", () => {
    window.location.href = "/search.html";
  });

  /* ================================
     Profile & Account Logic
  ================================= */
  const AVATAR_COLORS = ["#2563eb", "#e11d48", "#d97706", "#059669", "#7c3aed"];

  function getAvatarColor(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) {
      hash = email.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function renderProfileIcon() {
    const userEmail = localStorage.getItem("wareligent_user_email");
    const isGuest = localStorage.getItem("wareligent_is_guest");

    if (userEmail) {
      const firstLetter = userEmail.charAt(0).toUpperCase();
      const bg = getAvatarColor(userEmail);
      profileAvatar.innerHTML = `<div class="avatar-letter" style="background: ${bg}">${firstLetter}</div>`;
    } else if (isGuest) {
      profileAvatar.innerHTML = `<div class="avatar-letter" style="background: #64748b">G</div>`;
    } else {
      profileAvatar.innerHTML = `<span class="avatar-default">👤</span>`;
    }
  }

  function openProfileModal() {
    const userEmail = localStorage.getItem("wareligent_user_email");
    const isGuest = localStorage.getItem("wareligent_is_guest");

    if (userEmail) {
      authContent.innerHTML = `
        <p style="font-size:14px; text-align:center;">Logged in as:<br><strong>${userEmail}</strong></p>
        <button id="logoutBtn" class="secondary-btn" style="color: #e11d48;">Log Out</button>
      `;
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("wareligent_user_email");
        localStorage.removeItem("wareligent_is_guest");
        renderProfileIcon();
        profileModal.classList.add("hidden");
      };
    } else if (isGuest) {
      authContent.innerHTML = `
        <p style="font-size:14px; text-align:center;">You are using as <strong>Guest</strong>.<br><small style="color:var(--muted)">Data will not be saved.</small></p>
        <button id="addAccountBtn" class="primary-btn">Connect Gmail</button>
        <button id="logoutBtn" class="secondary-btn">Exit Guest Mode</button>
      `;
      document.getElementById("addAccountBtn").onclick = () => showEmailInputForm();
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("wareligent_is_guest");
        renderProfileIcon();
        profileModal.classList.add("hidden");
      };
    } else {
      showEmailInputForm();
    }

    profileModal.classList.remove("hidden");
  }

  function showEmailInputForm() {
    authContent.innerHTML = `
      <input type="email" id="emailInput" class="modal-input" placeholder="Enter your Gmail..." />
      <button id="saveEmailBtn" class="primary-btn">Continue with Gmail</button>
      <button id="guestBtn" class="secondary-btn">Continue as Guest</button>
    `;

    document.getElementById("saveEmailBtn").onclick = () => {
      const email = document.getElementById("emailInput").value.trim();
      if (email && email.includes("@")) {
        localStorage.setItem("wareligent_user_email", email);
        localStorage.removeItem("wareligent_is_guest");
        renderProfileIcon();
        profileModal.classList.add("hidden");
      } else {
        alert("Please enter a valid Gmail address.");
      }
    };

    document.getElementById("guestBtn").onclick = () => {
      localStorage.setItem("wareligent_is_guest", "true");
      localStorage.removeItem("wareligent_user_email");
      renderProfileIcon();
      profileModal.classList.add("hidden");
    };
  }

  profileBtn?.addEventListener("click", openProfileModal);
  closeModalBtn?.addEventListener("click", () => profileModal.classList.add("hidden"));

  /* ================================
     Weather System
  ================================= */
  function weatherIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "🌤️";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    return "⛈️";
  }

  async function loadWeather() {
    if (!weatherCard) return;

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`;
          const res = await fetch(url);
          const data = await res.json();
          const temp = Math.round(data.current.temperature_2m);
          const icon = weatherIcon(data.current.weather_code);

          weatherCard.innerHTML = `
            <div class="weather-flex">
              <div>
                <div class="weather-temp">${temp}°C</div>
                <div class="weather-desc">Your Location</div>
              </div>
              <div class="weather-icon">${icon}</div>
            </div>
          `;
        },
        () => {
          weatherCard.innerHTML = `<div class="weather-loading">Enable location for weather</div>`;
        }
      );
    } catch (err) {
      weatherCard.innerHTML = `<div class="weather-loading">Weather unavailable</div>`;
    }
  }

  /* ================================
     Init
  ================================= */
  initTheme();
  renderProfileIcon();
  loadWeather();
})();
