// Load users from localStorage or use demo user
let users = JSON.parse(localStorage.getItem('null_x_users')) || [
  { email: "test@gmail.com", username: "demo_user", password: "password123" }
];

function saveToDisk() {
  localStorage.setItem('null_x_users', JSON.stringify(users));
}

const allowedDomains = new Set(["gmail.com", "outlook.com", "hotmail.com", "live.com", "yahoo.com", "proton.me", "protonmail.com", "icloud.com", "me.com", "aol.com", "zoho.com", "yandex.com", "mail.com"]);

function isValidEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email.trim());
}

function checkEmail() {
  const email = document.getElementById('signupEmail').value.trim();
  const feedback = document.getElementById('emailFeedback');
  if (!email) return;
  
  if (!isValidEmail(email)) {
    feedback.innerHTML = '<span class="error">Invalid email</span>';
    return;
  }
  
  const exists = users.some(user => user.email.toLowerCase() === email.toLowerCase());
  feedback.innerHTML = exists ? '<span class="error">Email taken</span>' : '<span class="success">Looks good</span>';
}

function checkUsername() {
  const username = document.getElementById('signupUsername').value.trim();
  const feedback = document.getElementById('usernameFeedback');
  if (!username) return;
  
  const exists = users.some(user => user.username.toLowerCase() === username.toLowerCase());
  feedback.innerHTML = exists ? '<span class="error">Taken</span>' : '<span class="success">Available</span>';
}

function handleSignup() {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    if (!isValidEmail(email) || !username || password.length < 8) {
        message.innerHTML = '<span class="error">Check your inputs (Password 8+ chars)</span>';
        return;
    }

    // Check if user already exists
    if (users.some(u => u.username === username)) {
        message.innerHTML = '<span class="error">Username already exists</span>';
        return;
    }

    users.push({ email, username, password });
    saveToDisk();

    // SUCCESS: Save the "ID card" so the chat knows who you are
    localStorage.setItem('chatUser', username);

    message.innerHTML = '<span class="success">Account created! Redirecting...</span>';
    
    // Send them to the home page after 1 second
    setTimeout(() => {
        window.location.href = "../index.html";
    }, 1000);
}

function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
        message.innerHTML = '<span class="error">Invalid username or password</span>';
        return;
    }

    // SUCCESS: Save the "ID card" so the site knows you are logged in
    localStorage.setItem('chatUser', username);

    message.innerHTML = `<span class="success">Welcome, ${username}!</span>`;
    
    // Redirect to home page so the sign-in screen disappears
    window.location.href = "../index.html";
}

// Tab Switching
document.getElementById('signupTab').addEventListener('click', () => {
  document.getElementById('signupForm').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('signupTab').classList.add('active');
  document.getElementById('loginTab').classList.remove('active');
});

document.getElementById('loginTab').addEventListener('click', () => {
  document.getElementById('signupForm').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('signupTab').classList.remove('active');
  document.getElementById('loginTab').classList.add('active');
});

// Password Visibility Toggles
function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  
  toggle.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password';
  });
}

setupPasswordToggle('signupPassword', 'toggleSignupPassword');
setupPasswordToggle('loginPassword', 'toggleLoginPassword');
