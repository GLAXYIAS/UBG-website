// REPLACE THESE WITH YOUR ACTUAL DATA
const SUPABASE_URL = 'https://abujajuzsiqjksabvybi.supabase.co'; 
const SUPABASE_KEY = 'sb_publishable_p-LIu9LC5FT-KprFOosVTw_Y16KCLAN';

document.addEventListener('DOMContentLoaded', () => {
    const messageContainer = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const usernameDisplay = document.getElementById('username-display');

    // Guest name setup
    let user = localStorage.getItem('chatUser') || "Guest_" + Math.floor(Math.random() * 9999);
    localStorage.setItem('chatUser', user);
    if (usernameDisplay) usernameDisplay.textContent = user;

    async function fetchMessages() {
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });
            const data = await response.json();
            
            if (messageContainer) {
                messageContainer.innerHTML = '<div class="message system">Encrypted connection active.</div>';
                data.forEach(msg => {
                    const msgDiv = document.createElement('div');
                    msgDiv.className = 'message';
                    msgDiv.innerHTML = `<strong style="color: #8b00ff">${msg.username}:</strong> ${msg.content}`;
                    messageContainer.appendChild(msgDiv);
                });
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }
        } catch (err) {
            console.error("Connection lost:", err);
        }
    }

    async function sendMessage(text) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                method: 'POST',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({ username: user, content: text })
            });
            fetchMessages(); 
        } catch (err) {
            console.error("Send failed:", err);
        }
    }

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = messageInput.value.trim();
            if (text) {
                sendMessage(text);
                messageInput.value = "";
            }
        });
    }

    setInterval(fetchMessages, 2500); 
    fetchMessages(); 
});
