// Database Configuration
const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

const ADMIN_NAME = "glaeesas";
let allUsers = [];
let lastMessageTime = 0; 
let reportingUser = ""; 

document.addEventListener('DOMContentLoaded', () => {
    // 1. AUTHENTICATION CHECK
    const user = localStorage.getItem('chatUser');
    if (!user) {
        window.location.href = "../Login/login.html";
        return;
    }
    const lowerUser = user.toLowerCase();

    // 2. TAB CLOAK & ADMIN VISIBILITY
    document.title = "Grades";
    Object.defineProperty(document, 'title', {
        value: 'Grades',
        writable: false
    });

    if (lowerUser === ADMIN_NAME) {
        const adminTab = document.getElementById('admin-tab');
        if (adminTab) {
            adminTab.style.display = 'block';
        }
    }

    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user;
    }
    
    const msgContainer = document.getElementById('chat-messages');

    // 3. SEARCH DROPDOWN LOGIC (FORCING UPWARD GROWTH)
    const createDropdown = (inputId) => {
        let dropdown = document.getElementById(inputId + '-dropdown');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.id = inputId + '-dropdown';
            // Explicit styles for the dropdown to appear ABOVE the search bar
            dropdown.style.position = 'absolute';
            dropdown.style.bottom = '100%'; 
            dropdown.style.left = '0';
            dropdown.style.background = '#1a1a1a';
            dropdown.style.border = '2px solid #8b00ff';
            dropdown.style.borderRadius = '8px 8px 0 0';
            dropdown.style.zIndex = '10000';
            dropdown.style.width = '100%';
            dropdown.style.maxHeight = '200px';
            dropdown.style.overflowY = 'auto';
            dropdown.style.display = 'none';
            dropdown.style.boxShadow = '0 -5px 15px rgba(0,0,0,0.8)';

            const parent = document.getElementById(inputId).parentNode;
            parent.style.position = 'relative';
            parent.appendChild(dropdown);
        }
        return dropdown;
    };

    window.handleAdminSearch = (val, inputId) => {
        const dropdown = createDropdown(inputId);
        
        if (!val.includes('@')) {
            dropdown.style.display = 'none';
            return;
        }

        const searchPart = val.split('@')[1].toLowerCase();
        const matches = allUsers.filter(u => u.toLowerCase().includes(searchPart));

        if (matches.length > 0) {
            dropdown.innerHTML = '';
            matches.forEach(match => {
                const item = document.createElement('div');
                item.style.padding = '12px';
                item.style.cursor = 'pointer';
                item.style.borderBottom = '1px solid #333';
                item.style.color = 'white';
                item.innerText = match;
                
                item.onmouseover = () => { item.style.background = '#333'; };
                item.onmouseout = () => { item.style.background = 'transparent'; };
                item.onclick = () => { selectAdminUser(match, inputId); };
                
                dropdown.appendChild(item);
            });
            dropdown.style.display = 'block';
        } else {
            dropdown.style.display = 'none';
        }
    };

    window.selectAdminUser = (name, inputId) => {
        const inputField = document.getElementById(inputId);
        inputField.value = name;
        const dropdown = document.getElementById(inputId + '-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    };

    // 4. USER DATA FETCHING (ENSURING EVERYONE SHOWS UP)
    const fetchAllUsers = async () => {
        try {
            const rolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const rolesData = await rolesResponse.json();

            const messagesResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=username`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const messagesData = await messagesResponse.json();

            const combinedUsernames = [
                ...rolesData.map(u => u.username),
                ...messagesData.map(u => u.username)
            ];

            // Filter unique names and remove nulls
            allUsers = [...new Set(combinedUsernames)].filter(name => name !== null && name !== undefined);
            
            // Immediately refresh the directory if it's visible
            renderUserDirectory();
        } catch (error) {
            console.error("Critical Error Fetching Users:", error);
        }
    };

    // 5. USER DIRECTORY & INTERACTIVE BUTTONS
    const renderUserDirectory = (filterTerm = "") => {
        const listContainer = document.getElementById('user-list-display');
        if (!listContainer) return;

        const filteredUsers = allUsers.filter(u => 
            u.toLowerCase().includes(filterTerm.toLowerCase())
        );

        listContainer.innerHTML = '';
        filteredUsers.forEach(username => {
            const userCard = document.createElement('div');
            userCard.className = 'admin-card';
            userCard.style.textAlign = 'center';
            userCard.style.position = 'relative';

            userCard.innerHTML = `
                <div style="cursor:pointer;" id="click-target-${username}">
                    <div class="avatar" style="margin: 0 auto 10px;"></div>
                    <strong style="display:block;">${username}</strong>
                </div>
                <div id="actions-${username}" style="display:none; margin-top:15px; padding-top:10px; border-top:1px solid #333; gap:10px; justify-content:center;">
                    <button id="btn-report-${username}" style="background:#ff4444; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-size:12px;">Report</button>
                    <button id="btn-msg-${username}" style="background:#8b00ff; color:white; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; font-size:12px;">Message</button>
                </div>
            `;

            listContainer.appendChild(userCard);

            // Add Click Events
            document.getElementById(`click-target-${username}`).onclick = () => {
                toggleUserActions(username);
            };

            document.getElementById(`btn-report-${username}`).onclick = () => {
                openReportModal(username);
            };

            document.getElementById(`btn-msg-${username}`).onclick = () => {
                alert(`Direct messaging ${username} will be available in the next update.`);
            };
        });
    };

    window.toggleUserActions = (targetUser) => {
        const actionArea = document.getElementById(`actions-${targetUser}`);
        const currentlyVisible = actionArea.style.display === 'flex';

        // Hide all action bars first
        allUsers.forEach(u => {
            const otherArea = document.getElementById(`actions-${u}`);
            if (otherArea) otherArea.style.display = 'none';
        });

        // Toggle the specific one
        if (!currentlyVisible) {
            actionArea.style.display = 'flex';
        }
    };

    // 6. REPORTING MODAL SYSTEM
    window.openReportModal = (targetUser) => {
        reportingUser = targetUser;
        let reportModal = document.getElementById('report-modal');
        
        if (!reportModal) {
            reportModal = document.createElement('div');
            reportModal.id = 'report-modal';
            document.body.appendChild(reportModal);
        }

        reportModal.innerHTML = `
            <div style="text-align:center;">
                <h2 style="color:#ff4444; margin-bottom:10px;">Report User</h2>
                <p style="margin-bottom:20px;">You are reporting: <strong>${targetUser}</strong></p>
                <textarea id="report-reason-input" placeholder="Reason for report..." style="width:100%; height:100px; background:#000; border:1px solid #333; color:white; padding:10px; border-radius:5px;"></textarea>
                <div style="display:flex; gap:10px; margin-top:20px;">
                    <button id="confirm-report-btn" style="flex:1; background:#ff4444; color:white; padding:12px; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">Submit Report</button>
                    <button id="cancel-report-btn" style="flex:1; background:#333; color:white; padding:12px; border:none; border-radius:5px; cursor:pointer;">Cancel</button>
                </div>
            </div>
        `;

        reportModal.style.display = 'block';

        document.getElementById('confirm-report-btn').onclick = submitReport;
        document.getElementById('cancel-report-btn').onclick = () => {
            reportModal.style.display = 'none';
        };
    };

    window.submitReport = async () => {
        const reasonText = document.getElementById('report-reason-input').value.trim();
        if (!reasonText) {
            alert("Please provide a reason for the report.");
            return;
        }

        try {
            await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
                method: 'POST',
                headers: { 
                    'apikey': SUPABASE_KEY, 
                    'Authorization': `Bearer ${SUPABASE_KEY}`, 
                    'Content-Type': 'application/json', 
                    'Prefer': 'resolution=merge-duplicates' 
                },
                body: JSON.stringify({ 
                    username: reportingUser, 
                    last_action_reason: `REPORTED BY ${user}: ${reasonText}`, 
                    last_action_type: 'report' 
                })
            });
            
            alert(`User ${reportingUser} has been reported to the owner.`);
            document.getElementById('report-modal').style.display = 'none';
        } catch (err) {
            console.error("Report submission failed:", err);
        }
    };

    // 7. TAB NAVIGATION
    window.switchTab = (targetTab) => {
        const viewIds = ['chat-view', 'rules-view', 'admin-panel-view', 'users-view'];
        viewIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        document.querySelectorAll('.channel').forEach(chan => {
            chan.classList.remove('active');
        });

        if (targetTab === 'general' || targetTab === 'dev-logs') {
            document.getElementById('chat-view').style.display = 'flex';
            const sidebarId = targetTab === 'general' ? 'chan-general' : 'chan-dev';
            document.getElementById(sidebarId).classList.add('active');
        } else if (targetTab === 'users') {
            document.getElementById('users-view').style.display = 'block';
            document.getElementById('chan-users').classList.add('active');
            fetchAllUsers();
        } else if (targetTab === 'rules') {
            document.getElementById('rules-view').style.display = 'block';
            document.getElementById('chan-rules').classList.add('active');
        } else if (targetTab === 'admin') {
            document.getElementById('admin-panel-view').style.display = 'block';
            document.getElementById('admin-tab').classList.add('active');
            fetchAllUsers();
        }
    };

    // 8. FETCH MESSAGES & FULL TIMESTAMPS
    async function fetchMessages() {
        try {
            const messagesResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages?select=*&order=created_at.asc`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });
            const rolesResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_roles?select=*`, {
                headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
            });

            const messages = await messagesResponse.json();
            const roles = await rolesResponse.json();

            if (!Array.isArray(messages) || !msgContainer) return;

            msgContainer.innerHTML = '';
            messages.forEach(msg => {
                const isDeleted = msg.content === "Message Was Deleted By Owner";
                const roleData = roles.find(r => r.username === msg.username);
                
                // Detailed Timestamp logic
                const dateObj = new Date(msg.created_at);
                const fullTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                let roleTag = "";
                if (msg.username.toLowerCase() === ADMIN_NAME) {
                    roleTag = `<span class="owner-tag">OWNER</span>`;
                } else if (roleData && roleData.role_tag) {
                    roleTag = `<span style="color:#aaa; font-weight:bold; margin-right:5px;">[${roleData.role_tag.toUpperCase()}]</span> `;
                }

                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.username === user ? 'my-message' : 'other-message'}`;
                
                const deleteButton = (lowerUser === ADMIN_NAME && !isDeleted) 
                    ? `<button class="delete-btn" onclick="deleteMsg('${msg.id}')">⋮</button>` 
                    : "";

                messageDiv.innerHTML = `
                    <div class="msg-info">
                        <div style="display:flex; align-items:center;">
                            ${roleTag}<strong>${msg.username}</strong>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="font-size:10px; opacity:0.4;">${fullTime}</span>
                            ${deleteButton}
                        </div>
                    </div>
                    <div class="${isDeleted ? 'message-deleted' : ''}">${msg.content}</div>
                `;
                msgContainer.appendChild(messageDiv);
            });
            msgContainer.scrollTop = msgContainer.scrollHeight;
        } catch (err) {
            console.error("Message Refresh Error:", err);
        }
    }

    // 9. ANTI-SPAM SEND LOGIC (THE FIXED VERSION)
    const chatForm = document.getElementById('chat-form');
    if (chatForm) {
        chatForm.onsubmit = async (event) => {
            event.preventDefault();
            
            const currentTime = Date.now();
            const messageInput = document.getElementById('message-input');
            const messageContent = messageInput.value.trim();

            // ANTI-SPAM CHECK (3-second cooldown)
            if (currentTime - lastMessageTime < 3000 && lowerUser !== ADMIN_NAME) {
                const secondsRemaining = Math.ceil((3000 - (currentTime - lastMessageTime)) / 1000);
                alert(`Spam Protection: Please wait ${secondsRemaining} second(s) before sending another message.`);
                return; // BLOCK THE REST OF THE FUNCTION
            }

            if (!messageContent) return;

            // Clear input and update cooldown immediately for better UX
            messageInput.value = "";
            lastMessageTime = currentTime;

            try {
                const sendResponse = await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
                    method: 'POST',
                    headers: { 
                        'apikey': SUPABASE_KEY, 
                        'Authorization': `Bearer ${SUPABASE_KEY}`, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({ 
                        username: user, 
                        content: messageContent 
                    })
                });

                if (sendResponse.ok) {
                    fetchMessages();
                }
            } catch (err) {
                console.error("Failed to send message:", err);
            }
        };
    }

    // 10. ADMIN EXECUTION SYSTEM
    window.adminExecute = async (actionType) => {
        let targets = [];
        const category = document.getElementById('ban-category').value;
        let singleUser, bulkUsers, reason;

        if (actionType === 'warn') {
            singleUser = document.getElementById('warn-search').value.trim();
            bulkUsers = document.getElementById('bulk-warn').value.trim();
            reason = document.getElementById('warn-reason').value.trim();
        } else {
            singleUser = document.getElementById('ban-search').value.trim();
            reason = document.getElementById('ban-reason').value.trim();
        }

        if (singleUser) {
            targets = [singleUser];
        } else if (bulkUsers) {
            targets = bulkUsers.split(',').map(n => n.trim()).filter(n => n !== "");
        }

        if (targets.length === 0) {
            alert("No user specified for this action.");
            return;
        }

        for (const target of targets) {
            let updatePayload = { 
                username: target, 
                last_action_reason: reason || "No reason provided.", 
                last_action_type: actionType, 
                last_action_category: category 
            };

            if (actionType === 'ban') {
                updatePayload.is_banned = true;
                updatePayload.ban_until = '3000-01-01T00:00:00Z';
            } else if (actionType === 'unban') {
                updatePayload.is_banned = false;
                updatePayload.warned = false;
                updatePayload.last_action_type = "unban";
            } else if (actionType === 'warn') {
                updatePayload.warned = true;
            }

            try {
                await fetch(`${SUPABASE_URL}/rest/v1/user_roles`, {
                    method: 'POST',
                    headers: { 
                        'apikey': SUPABASE_KEY, 
                        'Authorization': `Bearer ${SUPABASE_KEY}`, 
                        'Content-Type': 'application/json', 
                        'Prefer': 'resolution=merge-duplicates' 
                    },
                    body: JSON.stringify(updatePayload)
                });
            } catch (err) {
                console.error(`Admin action failed for ${target}:`, err);
            }
        }
        alert(`Admin action: ${actionType.toUpperCase()} successful.`);
    };

    window.deleteMsg = async (messageId) => {
        if (!confirm("Delete this message?")) return;
        
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/messages?id=eq.${messageId}`, {
                method: 'PATCH',
                headers: { 
                    'apikey': SUPABASE_KEY, 
                    'Authorization': `Bearer ${SUPABASE_KEY}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ content: "Message Was Deleted By Owner" })
            });
            fetchMessages();
        } catch (err) {
            console.error("Deletion failed:", err);
        }
    };

    // 11. BACKGROUND LOOPS & LISTENERS
    document.getElementById('directory-search').oninput = (e) => renderUserDirectory(e.target.value);
    document.getElementById('warn-search').oninput = (e) => handleAdminSearch(e.target.value, 'warn-search');
    document.getElementById('ban-search').oninput = (e) => handleAdminSearch(e.target.value, 'ban-search');

    setInterval(fetchMessages, 3000);
    fetchMessages();
});
