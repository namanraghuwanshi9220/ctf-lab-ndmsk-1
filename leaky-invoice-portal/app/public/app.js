// --- Utils ---
const jwtToken = localStorage.getItem('token');
let userData = null;

function parseJwt(token) {
    try { return JSON.parse(atob(token.split('.')[1])); } 
    catch (e) { return null; }
}

if (jwtToken) userData = parseJwt(jwtToken);

// --- Page Router ---
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Update Navbar if logged in (Home page)
    if (path === '/' || path === '/index.html') {
        if (jwtToken) {
            document.getElementById('navLogin').style.display = 'none';
            document.getElementById('navDash').style.display = 'inline-block';
        }
    }

    // Protect Dashboard Route
    if (path.includes('dashboard.html')) {
        if (!jwtToken) return window.location.href = '/login.html';
        
        document.getElementById('displayUser').innerText = userData.username;
        const roleBadge = document.getElementById('displayRole');
        roleBadge.innerText = userData.role;
        if(userData.role === 'admin') roleBadge.classList.add('admin');
    }

    // Auto redirect if visiting auth pages while logged in
    if (path.includes('login.html') || path.includes('register.html')) {
        if (jwtToken) window.location.href = '/dashboard.html';
    }

    // Execute page-specific functions
    if (path.includes('invoices.html')) loadPublicInvoices();
    
    // Bind Form Submits
    const loginForm = document.getElementById('loginForm');
    if(loginForm) loginForm.addEventListener('submit', login);

    const regForm = document.getElementById('regForm');
    if(regForm) regForm.addEventListener('submit', register);
});

// --- API Calls ---

async function loadPublicInvoices() {
    try {
        const res = await fetch('/api/public/invoices');
        const data = await res.json();
        document.getElementById('invoiceResult').innerText = JSON.stringify(data, null, 2);
        document.getElementById('invoiceResult').classList.remove('loader');
    } catch(err) {
        document.getElementById('invoiceResult').innerText = "Error loading data.";
    }
}

async function login(e) {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    const msg = document.getElementById('authMsg');
    
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    
    if (res.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/dashboard.html';
    } else {
        msg.innerText = data.error;
        msg.style.color = 'var(--danger)';
    }
}

async function register(e) {
    e.preventDefault();
    const u = document.getElementById('regUser').value;
    const p = document.getElementById('regPass').value;
    const msg = document.getElementById('authMsg');
    
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    
    if (res.ok) {
        msg.innerText = "Registration successful! Redirecting to login...";
        msg.style.color = '#10b981';
        setTimeout(() => window.location.href = '/login.html', 1500);
    } else {
        msg.innerText = data.error || "Registration failed";
        msg.style.color = 'var(--danger)';
    }
}

// VULNERABLE FUNCTION (Attacker intercepts this)
async function updateProfile() {
    const bio = document.getElementById('bioInput').value;
    const msg = document.getElementById('profileMsg');
    
    const res = await fetch(`/api/users/${userData.id}`, {
        method: 'PATCH',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + jwtToken
        },
        body: JSON.stringify({ bio: bio }) 
    });
    const data = await res.json();
    
    if(res.ok) {
        msg.innerText = "Profile updated successfully!";
        msg.style.color = '#10b981';
        if(data.role !== userData.role) {
            msg.innerText += " (System Note: Role changes require re-login)";
        }
    } else {
        msg.innerText = "Error updating profile.";
        msg.style.color = 'var(--danger)';
    }
}

async function getFlag() {
    const box = document.getElementById('flagResult');
    box.style.display = 'block';
    box.innerText = "Fetching securely...";
    
    const res = await fetch('/api/admin/flag', {
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });
    const data = await res.json();
    box.innerText = JSON.stringify(data, null, 2);
    
    if(!res.ok) box.style.color = 'var(--danger)';
    else box.style.color = '#10b981';
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
}
