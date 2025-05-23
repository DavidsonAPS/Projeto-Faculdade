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

// Adicione estas funções ao seu auth.js existente

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    document.getElementById(elementId.replace('Error', '')).classList.add('error');
}

function hideError(elementId) {
    const element = document.getElementById(elementId);
    element.style.display = 'none';
    document.getElementById(elementId.replace('Error', '')).classList.remove('error');
}

function showLoader(formType) {
    document.getElementById(`${formType}Loader`).style.display = 'block';
    document.querySelector(`#${formType}Form button`).disabled = true;
}

function hideLoader(formType) {
    document.getElementById(`${formType}Loader`).style.display = 'none';
    document.querySelector(`#${formType}Form button`).disabled = false;
}

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se já está logado
    checkAuthStatus();
    
    // Configura os formulários
    setupAuthForms();
});

function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token && (window.location.pathname.includes('login.html') || 
                 window.location.pathname.includes('register.html'))) {
        // Se já logado e está nas páginas de auth, redireciona
        redirectToDashboard();
    }
}

function setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAuth('login');
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAuth('register');
        });
    }
}

async function handleAuth(action) {
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    
    if (action === 'register') {
        formData.name = document.getElementById('name').value;
    }
    
    try {
        showLoader(action);
        
        const res = await fetch(`/api/auth/${action}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            throw new Error(data.message || `${action} failed`);
        }
        
        // Salva o token e redireciona
        localStorage.setItem('token', data.token);
        redirectToDashboard();
        
    } catch (error) {
        showError(`${action}Error`, error.message);
    } finally {
        hideLoader(action);
    }
}

function redirectToDashboard() {
    // Verifica se é admin (você pode implementar essa lógica conforme sua API)
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    if (payload.isAdmin) {
        window.location.href = 'views/admin.html';
    } else {
        window.location.href = 'views/dashboard.html';
    }
}

function showLoader(action) {
    const loader = document.getElementById(`${action}Loader`);
    if (loader) loader.style.display = 'block';
    
    const btn = document.querySelector(`#${action}Form button`);
    if (btn) btn.disabled = true;
}

function hideLoader(action) {
    const loader = document.getElementById(`${action}Loader`);
    if (loader) loader.style.display = 'none';
    
    const btn = document.querySelector(`#${action}Form button`);
    if (btn) btn.disabled = false;
}

function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}