import { applyCloak } from '../Cloaks/Cloaks.js';

// --- DATA HARDCODED HERE
const _0xData = [
  {
    id: "s_lp",
    title: atob("U2xvcGU="), 
    path: "slope", 
    desc: "A fast-paced 3D platformer. Stay on the track!",
    popular: true
  },
  {
    id: "d_md",
    title: atob("RHJpdmUgTWFk"), 
    path: "drivemad", 
    desc: "Challenging physics-based driving. Don't flip your truck!",
    popular: true
  },
  {
    id: "b_ft",
    title: atob("QnVsbGV0IEZvcmNl"), 
    path: "bulletforce", 
    desc: "Action-packed multiplayer FPS. Dominate the battlefield.",
    popular: true
  },
  {
    id: "p_em",
    title: atob("UG9rZW1vbiBFbWVyYWxk"), 
    path: "pokemon-emerald",
    desc: "The classic GBA adventure. Become the Hoenn Champion!",
    popular: true
  },
  {
    id: "b_to",
    title: atob("QnJvdGF0bw=="), 
    path: "brotato", 
    desc: "A top-down arena shooter roguelite where you play a potato.",
    popular: true
  }
];

// Fixed: Functions now use _0xData instead of 'games'
function getMostPopular() {
    return _0xData.filter(g => g.popular);
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) applyTheme(savedTheme);

    const savedCloak = localStorage.getItem('savedCloak');
    if (savedCloak && savedCloak !== "none") {
        try { applyCloak(savedCloak); } catch (e) {}
    }

    let savedShortcut = localStorage.getItem('panicKey') || "";
    let savedLink = localStorage.getItem('panicUrl') || "https://google.com";

    const settingsModal = document.getElementById('settingsModal');
    const settingsBtn = document.getElementById('settingsBtn');
    const closeSettings = document.getElementById('closeSettings');
    const cloakSelector = document.getElementById('cloakSelector');
    const panicInput = document.getElementById('panicShortcut');
    const panicLinkInput = document.getElementById('panicLink');
    const savePanicBtn = document.getElementById('savePanic');
    
    const navHome = document.getElementById('nav-home');
    const navGames = document.getElementById('nav-games');
    const heroSection = document.getElementById('heroSection');
    const gameGrid = document.getElementById('gameGrid');

    function applyTheme(theme) {
        const root = document.documentElement;
        if (theme === 'midnight') {
            root.style.setProperty('--accent', '#ffffff');
            root.style.setProperty('--container-bg', '#000000');
            document.body.style.background = "#000000";
        } else {
            root.style.setProperty('--accent', '#8b00ff');
            root.style.setProperty('--container-bg', 'rgba(15, 15, 25, 0.95)');
            document.body.style.background = "linear-gradient(135deg, #0a0a0a, #1a0033)";
        }
    }

   // Update your launch function to include the path in the URL
function launchGame(gameId) {
    const game = _0xData.find(g => g.id === gameId);
    if (game) {
        window.location.href = `Games/game-player.html?id=${game.id}&folder=${game.path}`;
    }
}

    function showLibrary() {
        if (heroSection) heroSection.style.display = 'none';
        if (gameGrid) {
            gameGrid.innerHTML = '';
            gameGrid.style.display = 'grid';
            // Fixed: changed 'games' to '_0xData'
            _0xData.forEach(game => {
                const card = document.createElement('div');
                card.className = 'game-card';
                card.innerHTML = `
                    <h3>${game.title}</h3>
                    <div class="game-desc-overlay">${game.desc}</div>
                `;
                card.onclick = () => launchGame(game.id);
                gameGrid.appendChild(card);
            });
        }
    }

    function showHome() {
        if (heroSection) heroSection.style.display = 'flex';
        if (gameGrid) gameGrid.style.display = 'none';
    }

    if (navGames) {
        navGames.addEventListener('click', (e) => {
            e.preventDefault();
            showLibrary();
        });
    }

    if (navHome) {
        navHome.addEventListener('click', (e) => {
            e.preventDefault();
            showHome();
        });
    }

    document.querySelectorAll('.theme-card').forEach(card => {
        card.addEventListener('click', () => {
            const theme = card.getAttribute('data-theme');
            applyTheme(theme);
            localStorage.setItem('selectedTheme', theme);
        });
    });

    if (cloakSelector) {
        if (savedCloak) cloakSelector.value = savedCloak;
        cloakSelector.addEventListener('change', (e) => {
            const val = e.target.value;
            if (val === "none") {
                localStorage.removeItem('savedCloak');
                location.reload(); 
            } else {
                applyCloak(val);
            }
        });
    }

    if (panicInput) panicInput.value = savedShortcut;
    if (panicLinkInput) panicLinkInput.value = savedLink;

    if (panicInput) {
        panicInput.addEventListener('keydown', (e) => {
            e.preventDefault();
            panicInput.value = e.key; 
        });
    }

    if (savePanicBtn) {
        savePanicBtn.addEventListener('click', () => {
            localStorage.setItem('panicKey', panicInput.value);
            localStorage.setItem('panicUrl', panicLinkInput.value);
            savedShortcut = panicInput.value;
            savedLink = panicLinkInput.value;
            alert("Saved");
        });
    }

    window.addEventListener('keydown', (e) => {
        const isTyping = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
        if (!isTyping && e.key === savedShortcut && savedShortcut !== "") {
            let url = savedLink.startsWith('http') ? savedLink : 'https://' + savedLink;
            window.location.href = url;
        }
    });

    if (settingsBtn) settingsBtn.onclick = () => settingsModal.style.display = 'flex';
    if (closeSettings) closeSettings.onclick = () => settingsModal.style.display = 'none';

    const popular = getMostPopular();
    if (popular && popular.length > 0) {
        const titleEl = document.getElementById('hero-title');
        const descEl = document.getElementById('hero-desc');
        if (titleEl) titleEl.textContent = popular[0].title;
        if (descEl) descEl.textContent = popular[0].desc;
        const playBtn = document.getElementById('playFeatured'); 
        if (playBtn) playBtn.onclick = () => launchGame(popular[0].id);
    }

    const randomBtn = document.getElementById('randomBtn');
    if (randomBtn) {
        randomBtn.onclick = () => {
            // Fixed: changed 'games' to '_0xData'
            if (_0xData.length > 0) {
                const rand = _0xData[Math.floor(Math.random() * _0xData.length)];
                launchGame(rand.id);
            }
        };
    }
});
