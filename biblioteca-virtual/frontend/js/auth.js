document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  if (token && !['login.html', 'register.html'].some(page => window.location.pathname.includes(page))) {
    fetch('/api/auth/verify', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
      if (!res.ok && !window.location.pathname.includes('login.html')) {
        window.location.href = 'views/login.html';
      }
    });
  } else if (!token && !['login.html', 'register.html', 'index.html'].some(page => window.location.pathname.includes(page))) {
    window.location.href = 'views/login.html';
  }
  
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          window.location.href = data.isAdmin ? 'views/admin.html' : 'views/dashboard.html';
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
  
  // Register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        
        const data = await res.json();
        if (res.ok) {
          localStorage.setItem('token', data.token);
          window.location.href = 'views/dashboard.html';
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    });
  }
  
  // Logout
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('token');
      window.location.href = '../index.html';
    });
  }
});