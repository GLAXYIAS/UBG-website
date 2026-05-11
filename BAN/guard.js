// BAN/guard.js
const DB_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const DB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

async function runSecurityCheck() {
    const user = localStorage.getItem('chatUser');
    const overlay = document.getElementById('lockdown-overlay');

    // If the overlay doesn't exist on the page, create it dynamically
    if (!overlay) {
        const newOverlay = document.createElement('div');
        newOverlay.id = 'lockdown-overlay';
        newOverlay.style.cssText = "display:none; position:fixed; inset:0; background:black; z-index:999999; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:20px; font-family:sans-serif;";
        newOverlay.innerHTML = `
            <h1 id="lockdown-title" style="color:red; font-size:40px; margin-bottom:20px;">ACCESS DENIED</h1>
            <p id="lockdown-msg" style="color:white; font-size:18px; margin-bottom:10px;"></p>
            <div id="lockdown-timer" style="color:#ff4444; font-size:24px; font-weight:bold; font-family:monospace;"></div>
        `;
        document.body.appendChild(newOverlay);
    }

    const activeOverlay = document.getElementById('lockdown-overlay');

    if (!user) {
        activeOverlay.style.display = 'none';
        return; 
    }

    try {
        const res = await fetch(`${DB_URL}/rest/v1/user_roles?username=eq.${user}&select=*`, {
            headers: { 'apikey': DB_KEY, 'Authorization': `Bearer ${DB_KEY}` }
        });
        const data = await res.json();
        const profile = data[0];

        if (!profile) {
            activeOverlay.style.display = 'none';
            return;
        }

        // --- PERMANENT BAN ---
        if (profile.is_banned) {
            activeOverlay.style.display = 'flex';
            document.getElementById('lockdown-title').innerText = "YOU ARE PERMANENTLY BANNED";
            document.getElementById('lockdown-msg').innerText = `Reason: ${profile.last_action_reason || "Violation of terms."}`;
            return;
        }

        // --- TEMPORARY BAN ---
        if (profile.temp_ban_until) {
            const expiry = new Date(profile.temp_ban_until);
            if (expiry > new Date()) {
                activeOverlay.style.display = 'flex';
                document.getElementById('lockdown-title').innerText = "YOU ARE TEMPORARILY BANNED";
                
                const timerInterval = setInterval(() => {
                    const diff = expiry - new Date();
                    if (diff <= 0) {
                        clearInterval(timerInterval);
                        location.reload();
                    }
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    document.getElementById('lockdown-timer').innerText = `Unban in: ${h}h ${m}m ${s}s`;
                }, 1000);
                return;
            }
        }

        // If no ban active, ensure it's hidden
        activeOverlay.style.display = 'none';

    } catch (err) {
        console.error("Guard failed:", err);
        if (activeOverlay) activeOverlay.style.display = 'none';
    }
}

// Run immediately
runSecurityCheck();
