// --- INITIALIZATION ---
const SUPABASE_URL = 'https://ukwjojxutcjkvabnybtj.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrd2pvanh1dGNqa3ZhYm55YnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzk5NDAsImV4cCI6MjA5Mzg1NTk0MH0.iLr9OrIZlRBrbcI1XDE0zl7t_wpwVg3ko3DgppxbUh8'; 

let _supabase;
if (window.supabase) {
    _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}

// SUCCESSFUL CONNECT: Initializing EmailJS with your verified Public Key
if (window.emailjs) {
    window.emailjs.init("21Uh3wToxS52z7NUN");
}

// --- TAB SWITCHING & UI ---
document.addEventListener('DOMContentLoaded', () => {
    const signupTab = document.getElementById('signupTab');
    const loginTab = document.getElementById('loginTab');
    const signupForm = document.getElementById('signupForm');
    const loginForm = document.getElementById('loginForm');

    if (signupTab && loginTab) {
        signupTab.onclick = () => {
            signupForm.classList.remove('hidden');
            loginForm.classList.add('hidden');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
        };

        loginTab.onclick = () => {
            signupForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            signupTab.classList.remove('active');
            loginTab.classList.add('active');
        };
    }

    const setupToggle = (inputId, toggleId) => {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        if (input && toggle) {
            toggle.onclick = () => {
                input.type = input.type === 'password' ? 'text' : 'password';
                toggle.textContent = input.type === 'password' ? '👁️' : '🙈';
            };
        }
    };
    setupToggle('signupPassword', 'toggleSignupPassword');
    setupToggle('loginPassword', 'toggleLoginPassword');
});

// --- VALIDATION ---
window.checkEmail = () => {
    const email = document.getElementById('signupEmail').value.trim();
    const feedback = document.getElementById('emailFeedback');
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    feedback.innerHTML = regex.test(email) ? '<span class="success">Valid format</span>' : '<span class="error">Invalid email</span>';
};

window.checkUsername = async () => {
    const username = document.getElementById('signupUsername').value.trim();
    const feedback = document.getElementById('usernameFeedback');
    if (username.length < 3) return;
    const { data } = await _supabase.from('user_roles').select('username').eq('username', username);
    feedback.innerHTML = (data && data.length > 0) ? '<span class="error">Taken</span>' : '<span class="success">Available</span>';
};

// --- SIGN UP LOGIC ---
window.handleSignup = async () => {
    const email = document.getElementById('signupEmail').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const message = document.getElementById('signupMessage');

    if (!email || !username || !password) {
        message.innerHTML = '<span class="error">Please fill in all fields.</span>';
        return;
    }

    const captchaToken = grecaptcha.getResponse();
    if (!captchaToken) {
        message.innerHTML = '<span class="error">Complete the reCAPTCHA</span>';
        return;
    }

    const verificationCode = Math.floor(100000000000 + Math.random() * 900000000000);
    message.innerHTML = '<span style="color: #8b00ff;">Sending code to ' + email + '...</span>';

    let emailSent = false;

    try {
        await emailjs.send("service_jh86mmf", "template_yhnzvos", {
            to_email: email,
            verification_code: verificationCode,
            username: username
        });
        console.log("Email sent successfully with code:", verificationCode);
        emailSent = true;
    } catch (err) {
        console.error("EmailJS Error:", err);
        console.warn("Using system recovery fallback code display.");
    }

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            captchaToken: captchaToken,
            data: { display_name: username }
        }
    });

    if (error) {
        message.innerHTML = `<span class="error">${error.message}</span>`;
        grecaptcha.reset();
        return;
    }

    let userEnteredCode;
    if (emailSent) {
        userEnteredCode = prompt("Check your inbox! Enter the 12-digit code sent to " + email);
    } else {
        userEnteredCode = prompt("[FALLBACK] The email service failed to connect. Your confirmation code is:\n\n" + verificationCode + "\n\nCopy and paste it below:");
    }

    if (userEnteredCode == verificationCode) {
        message.innerHTML = '<span style="color: #8b00ff;">Finalizing registration...</span>';
        
        try {
            const { error: insertError } = await _supabase.from('user_roles').insert([
                { id: data.user.id, username: username, email: email, role_tag: 'user' }
            ]);

            if (insertError) {
                console.error("Database Insert Error:", insertError);
                message.innerHTML = `<span class="error">Profile link failed: ${insertError.message}</span>`;
                return;
            }

            message.innerHTML = '<span class="success">Verified! You can now login.</span>';
            grecaptcha.reset();
            
            setTimeout(() => {
                const loginTab = document.getElementById('loginTab');
                if (loginTab) loginTab.click();
            }, 1500);

        } catch (dbErr) {
            console.error("Database Error:", dbErr);
            message.innerHTML = '<span class="error">Failed to save profile record.</span>';
        }
    } else {
        message.innerHTML = '<span class="error">Invalid code. Signup failed.</span>';
    }
};

// --- LOGIN LOGIC ---
window.handleLogin = async () => {
    const identifier = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    if (!identifier || !password) {
        message.innerHTML = '<span class="error">Fill in all fields</span>';
        return;
    }

    message.innerHTML = '<span style="color: #8b00ff;">Logging in...</span>';

    try {
        let emailToAuth = identifier;

        if (!identifier.includes('@')) {
            const { data: profile, error: profileError } = await _supabase
                .from('user_roles')
                .select('email')
                .eq('username', identifier)
                .single();

            if (profileError || !profile) {
                message.innerHTML = '<span class="error">Username not found</span>';
                return;
            }
            emailToAuth = profile.email;
        }

        const { data, error } = await _supabase.auth.signInWithPassword({
            email: emailToAuth,
            password: password
        });

        if (error) {
            message.innerHTML = `<span class="error">${error.message}</span>`;
        } else {
            const finalName = data.user.user_metadata?.display_name || identifier;
            localStorage.setItem('chatUser', finalName);
            message.innerHTML = `<span class="success">Welcome, ${finalName}!</span>`;
            
            setTimeout(() => {
                window.location.href = "../index.html";
            }, 1000);
        }
    } catch (criticalErr) {
        console.error("Critical Failure:", criticalErr);
        message.innerHTML = '<span class="error">Unexpected server error.</span>';
    }
};
