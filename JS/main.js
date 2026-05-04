// Basic interactivity
document.addEventListener('DOMContentLoaded', () => {
    
  // Sign In Button
  const signInBtn = document.getElementById('signInBtn');
  signInBtn.addEventListener('click', () => {
    alert("Sign In feature coming soon! 🔑");
    // You can later connect this to a modal or Firebase, etc.
  });

  // Navigation Buttons
  document.getElementById('gamesBtn').addEventListener('click', () => {
    alert("Games section - you are already here!");
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    alert("Settings panel coming soon ⚙️");
  });

  // Search functionality (basic)
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      console.log('Searching for:', searchInput.value);
      // Add your search/filter logic here
    }
  });
});
