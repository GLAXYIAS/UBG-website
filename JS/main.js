document.addEventListener('DOMContentLoaded', () => {
    
  // Sign In Button - Goes to your Login folder
  const signInBtn = document.getElementById('signInBtn');
  signInBtn.addEventListener('click', () => {
    window.location.href = "Login/login.html";
  });

  // Other buttons
  document.getElementById('gamesBtn').addEventListener('click', () => {
    alert("You are already on the Games page!");
    // You can remove the alert later or make it scroll to top, etc.
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    alert("Settings panel coming soon ⚙️");
  });

  // Search bar
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' && searchInput.value.trim() !== "") {
      console.log('Searching for:', searchInput.value);
      // Add search logic later
    }
  });
});
