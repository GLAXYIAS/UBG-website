import { games, getMostPopular } from './config.js';

document.addEventListener('DOMContentLoaded', () => {

  console.log("JavaScript loaded successfully");

  // ====================== SIGN IN BUTTON (with debug) ======================
  const signInBtn = document.getElementById('signInBtn');
  console.log("Sign In button found:", signInBtn ? "YES" : "NO");

  if (signInBtn) {
    signInBtn.addEventListener('click', () => {
  console.log("Redirecting...");
  // Try this simpler path first:
  window.location.href = "Login/login.html"; 
});
  }
  // ====================== NAVIGATION ======================
 
  // Left Sidebar Navigation
  const navHome = document.getElementById('nav-home');
  const navGames = document.getElementById('nav-games');
  const navFavorites = document.getElementById('nav-favorites');
  const navUnblockers = document.getElementById('nav-unblockers');
  const navCommunications = document.getElementById('nav-communications');

  if (navHome) navHome.addEventListener('click', () => alert("You are already on Home"));
  if (navGames) navGames.addEventListener('click', () => alert("All Games section coming soon"));
  if (navFavorites) navFavorites.addEventListener('click', () => alert("Favorites coming soon"));
  if (navUnblockers) navUnblockers.addEventListener('click', () => alert("Unblockers / Proxy section coming soon"));
  if (navCommunications) navCommunications.addEventListener('click', () => alert("Communications / Chat coming soon"));

  const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettings = document.getElementById('closeSettings');
const themeCards = document.querySelectorAll('.theme-card');

// Open/Close logic
if (settingsBtn) {
  settingsBtn.addEventListener('click', () => settingsModal.style.display = 'flex');
}
if (closeSettings) {
  closeSettings.addEventListener('click', () => settingsModal.style.display = 'none');
}

// Theme Application logic
themeCards.forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.getAttribute('data-theme');
    const root = document.documentElement;

    if (theme === 'midnight') {
      root.style.setProperty('--accent', '#ffffff');
      root.style.setProperty('--bg-gradient', '#000000');
      root.style.setProperty('--container-bg', '#000000');
      document.body.style.background = "#000000";
    } else {
      // Reset to Default Purple
      root.style.setProperty('--accent', '#8b00ff');
      root.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #0a0a0a, #1a0033)');
      root.style.setProperty('--container-bg', 'rgba(15, 15, 25, 0.95)');
      document.body.style.background = "linear-gradient(135deg, #0a0a0a, #1a0033)";
    }
    
    // Optional: Save to localStorage so it stays after refresh
    localStorage.setItem('selectedTheme', theme);
  });
});

  // Random Game
  const randomBtn = document.getElementById('randomBtn');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      if (games.length === 0) {
        alert("No games available!");
        return;
      }
      const randomGame = games[Math.floor(Math.random() * games.length)];
      alert(`Launching: ${randomGame.title}`);
    });
  }

  // Play Featured
  const playFeatured = document.getElementById('playFeatured');
  if (playFeatured) {
    playFeatured.addEventListener('click', () => {
      const popular = getMostPopular();
      if (popular.length > 0) {
        alert(`Launching: ${popular[0].title}`);
      }
    });
  }

  // Search
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Enter' && searchInput.value.trim()) {
        alert(`Searching for: ${searchInput.value.trim()} (coming soon)`);
      }
    });
  }

  // Greeting
  const greeting = document.getElementById('greeting');
  if (greeting) {
    greeting.innerHTML = `<h1>Hello, Guest</h1><p>Find something fun to play.</p>`;
  }

  // Set Featured Game
  function setFeaturedGame() {
    const popular = getMostPopular();
    if (popular.length > 0) {
      document.getElementById('hero-title').textContent = popular[0].title;
      document.getElementById('hero-desc').textContent = popular[0].desc;
    }
  }
  setFeaturedGame();

  console.log("%cNull_X loaded successfully", "color: #c084fc");
});
