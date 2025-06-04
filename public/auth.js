// public/auth.js

document.addEventListener("DOMContentLoaded", () => {
    const authButtons = document.getElementById("auth-buttons");
    const welcomeBanner = document.getElementById("welcome-message"); // 🌟 Added welcome message container
  
    if (!authButtons || !firebase?.auth) return;
  
    firebase.auth().onAuthStateChanged((user) => {
      const authButtons = document.getElementById("auth-buttons");
  
      if (user) {
        const displayName = user.displayName || user.email;
        const firstName = displayName.split(" ")[0];
  
        // 🎉 Show welcome message
        if (welcomeBanner) {
          welcomeBanner.innerHTML = `<span class="emoji">🎉</span> Welcome back, <strong>${firstName}</strong>!`;
        }
  
        authButtons.innerHTML = `
          <span class="text-light me-2">Hi, ${firstName}</span>
          <button class="btn btn-outline-light me-2" id="logout-btn">Logout</button>
        `;
  
        document.getElementById("logout-btn").addEventListener("click", () => {
          firebase.auth().signOut().then(() => {
            location.reload();
          }).catch((error) => {
            console.error("Logout error:", error);
          });
        });
  
      } else {
        authButtons.innerHTML = `
          <a href="login.html" class="btn btn-outline-light me-2">Login</a>
          <a href="signup.html" class="btn btn-warning">Sign-up</a>
        `;
  
        // 📴 Clear welcome message if logged out
        if (welcomeBanner) {
          welcomeBanner.innerHTML = '';
        }
      }
    });
  });
  