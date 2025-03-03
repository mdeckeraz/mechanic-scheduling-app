document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  // Update navigation based on authentication status
  updateNavigation(!!token);
  
  // Update homepage welcome message if logged in
  const welcomeMessage = document.getElementById('welcomeMessage');
  const userWelcome = document.getElementById('userWelcome');
  const userName = document.getElementById('userName');
  
  if (welcomeMessage && userWelcome && userName && token) {
    welcomeMessage.classList.add('d-none');
    userWelcome.classList.remove('d-none');
    userName.textContent = user.name || '';
  }
  
  // Handle register form submission
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      
      // Validate passwords match
      if (password !== confirmPassword) {
        showAlert('registerAlert', 'Passwords do not match!', 'danger');
        return;
      }
      
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Save token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showAlert('registerAlert', 'Registration successful! Redirecting...', 'success');
          
          // Redirect to homepage after 1 second
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          showAlert('registerAlert', data.message || 'Registration failed', 'danger');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showAlert('registerAlert', 'An error occurred during registration', 'danger');
      }
    });
  }
  
  // Handle login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
          // Save token and user data
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
          
          // Redirect to homepage after 1 second
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          showAlert('loginAlert', data.message || 'Login failed', 'danger');
        }
      } catch (error) {
        console.error('Login error:', error);
        showAlert('loginAlert', 'An error occurred during login', 'danger');
      }
    });
  }
  
  // Handle logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to homepage
      window.location.href = '/';
    });
  }
  
  // Load profile data if on profile page
  const profileContent = document.getElementById('profileContent');
  const profileLoading = document.getElementById('profileLoading');
  const profileNotLoggedIn = document.getElementById('profileNotLoggedIn');
  
  if (profileContent && profileLoading && profileNotLoggedIn) {
    if (!token) {
      profileLoading.classList.add('d-none');
      profileNotLoggedIn.classList.remove('d-none');
    } else {
      loadProfileData();
    }
  }
  
  // Function to load profile data
  async function loadProfileData() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        document.getElementById('profileName').textContent = data.user.name;
        document.getElementById('profileEmail').textContent = data.user.email;
        document.getElementById('profileCreated').textContent = new Date(data.user.createdAt).toLocaleString();
        
        profileLoading.classList.add('d-none');
        profileContent.classList.remove('d-none');
      } else {
        // Token might be expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        profileLoading.classList.add('d-none');
        profileNotLoggedIn.classList.remove('d-none');
      }
    } catch (error) {
      console.error('Profile error:', error);
      showAlert('profileAlert', 'An error occurred while loading profile data', 'danger');
      
      profileLoading.classList.add('d-none');
    }
  }
  
  // Helper function to show alerts
  function showAlert(elementId, message, type) {
    const alertElement = document.getElementById(elementId);
    if (alertElement) {
      alertElement.textContent = message;
      alertElement.className = `alert alert-${type}`;
      alertElement.classList.remove('d-none');
      
      // Auto hide alert after 5 seconds
      setTimeout(() => {
        alertElement.classList.add('d-none');
      }, 5000);
    }
  }
  
  // Helper function to update navigation based on auth status
  function updateNavigation(isLoggedIn) {
    const loginNavItem = document.getElementById('loginNavItem');
    const registerNavItem = document.getElementById('registerNavItem');
    const profileNavItem = document.getElementById('profileNavItem');
    const logoutNavItem = document.getElementById('logoutNavItem');
    const calendarNavItem = document.getElementById('calendarNavItem');
    const mechanicsNavItem = document.getElementById('mechanicsNavItem');
    const jobsNavItem = document.getElementById('jobsNavItem');
    
    if (loginNavItem && registerNavItem && profileNavItem && logoutNavItem) {
      if (isLoggedIn) {
        loginNavItem.classList.add('d-none');
        registerNavItem.classList.add('d-none');
        profileNavItem.classList.remove('d-none');
        logoutNavItem.classList.remove('d-none');
        
        // Show scheduler-specific nav items when logged in
        if (calendarNavItem) calendarNavItem.classList.remove('d-none');
        if (mechanicsNavItem) mechanicsNavItem.classList.remove('d-none');
        if (jobsNavItem) jobsNavItem.classList.remove('d-none');
      } else {
        loginNavItem.classList.remove('d-none');
        registerNavItem.classList.remove('d-none');
        profileNavItem.classList.add('d-none');
        logoutNavItem.classList.add('d-none');
        
        // Hide scheduler-specific nav items when logged out
        if (calendarNavItem) calendarNavItem.classList.add('d-none');
        if (mechanicsNavItem) mechanicsNavItem.classList.add('d-none');
        if (jobsNavItem) jobsNavItem.classList.add('d-none');
      }
    }
  }
});
