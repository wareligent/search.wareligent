/* ====================================
   Wareligent Logic
==================================== */

(() => {
  "use strict";

  const searchInput = document.getElementById("searchInput");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeStateText = document.getElementById("themeStateText");
  const profileBtn = document.getElementById("profileBtn");
  const profileAvatar = document.getElementById("profileAvatar");
  const profileModal = document.getElementById("profileModal");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const authContent = document.getElementById("authContent");

  /* Theme Toggle */
  function setTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-theme", isDark);
    if (themeStateText) themeStateText.textContent = isDark ? "on" : "off";
    localStorage.setItem("wareligent-theme", theme);
  }

  function initTheme() {
    const saved = localStorage.getItem("wareligent-theme");
    setTheme(saved || "light");
  }

  themeToggleBtn?.addEventListener("click", () => {
    const isDark = document.body.classList.contains("dark-theme");
    setTheme(isDark ? "light" : "dark");
  });

  /* Search handling */
  function handleSearch(query) {
    const q = query.trim();
    if (q) {
      window.location.href = `/search.html?q=${encodeURIComponent(q)}`;
    }
  }

  searchInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSearch(searchInput.value);
    }
  });

  /* Trending Click */
  document.querySelectorAll(".trending-item").forEach((item) => {
    item.addEventListener("click", () => {
      const q = item.getAttribute("data-query");
      if (q) handleSearch(q);
    });
  });

  /* Account System */
  const AVATAR_COLORS = ["#2563eb", "#e11d48", "#d97706", "#059669", "#7c3aed"];

  function getAvatarColor(email) {
    let hash = 0;
    for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
  }

  function renderProfileIcon() {
    const userEmail = localStorage.getItem("wareligent_user_email");
    const isGuest = localStorage.getItem("wareligent_is_guest");

    if (userEmail) {
      const letter = userEmail.charAt(0).toUpperCase();
      const bg = getAvatarColor(userEmail);
      profileAvatar.innerHTML = `<div class="avatar-letter" style="background: ${bg}">${letter}</div>`;
    } else if (isGuest) {
      profileAvatar.innerHTML = `<div class="avatar-letter" style="background: #5f6368">G</div>`;
    } else {
      profileAvatar.innerHTML = `<div class="avatar-default">W</div>`;
    }
  }

  function openProfileModal() {
    const userEmail = localStorage.getItem("wareligent_user_email");
    const isGuest = localStorage.getItem("wareligent_is_guest");

    if (userEmail) {
      authContent.innerHTML = `
        <p style="font-size:14px; text-align:center;">Signed in as:<br><strong>${userEmail}</strong></p>
        <button id="logoutBtn" class="secondary-btn" style="color: #ea4335;">Sign Out</button>
      `;
      document.getElementById("logoutBtn").onclick = () => {
        localStorage.removeItem("wareligent_user_email");
        localStorage.removeItem("wareligent_is_guest");
        renderProfileIcon();
        profileModal.classList.add("hidden");
      };
    } else if (isGuest) {
      authContent.innerHTML = `
        <p style="font-size:14px; text-align:center;">You are in <strong>Guest Mode</strong>.</p>
        <button id="addAccountBtn" class="primary-btn">Sign in with Gmail</button>
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
      <input type="email" id="emailInput" class="modal-input" placeholder="Enter Gmail address" />
      <button id="saveEmailBtn" class="primary-btn">Continue</button>
      <button id="guestBtn" class="secondary-btn">Use as Guest</button>
    `;

    document.getElementById("saveEmailBtn").onclick = () => {
      const email = document.getElementById("emailInput").value.trim();
      if (email && email.includes("@")) {
        localStorage.setItem("wareligent_user_email", email);
        localStorage.removeItem("wareligent_is_guest");
        renderProfileIcon();
        profileModal.classList.add("hidden");
      } else {
        alert("Enter a valid email.");
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

  initTheme();
  renderProfileIcon();
})();
