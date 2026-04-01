const jwtToken = localStorage.getItem('token');
const currentUserId = localStorage.getItem('userId');

document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path === '/' || path === '/index.html') {
        if (jwtToken) {
            document.getElementById('navLogin').style.display = 'none';
            document.getElementById('navDash').style.display = 'inline-block';
        }
    }

    if (path.includes('dashboard.html')) {
        if (!jwtToken) return window.location.href = '/login.html';
        
        // Load profile based on URL parameter or current user ID
        const urlParams = new URLSearchParams(window.location.search);
        const targetId = urlParams.get('id') || currentUserId;
        loadProfile(targetId);
    }

    if (path.includes('announcements.html')) loadAnnouncements();

    const loginForm = document.getElementById('loginForm');
    if(loginForm) loginForm.addEventListener('submit', login);

    const regForm = document.getElementById('regForm');
    if(regForm) regForm.addEventListener('submit', register);
});

async function loadAnnouncements() {
    const res = await fetch('/api/announcements');
    const data = await res.json();
    const box = document.getElementById('notices');
    box.innerHTML = '';
    data.forEach(item => {
        box.innerHTML += `
            <div class="announcement">
                <h4>${item.title}</h4>
                <small>Date: ${item.date} | Posted by: ${item.author} (ID: ${item.author_id})</small>
            </div>
        `;
    });
}

async function register(e) {
    e.preventDefault();
    const payload = {
        name: document.getElementById('regName').value,
        course: document.getElementById('regCourse').value,
        username: document.getElementById('regUser').value,
        password: document.getElementById('regPass').value
    };
    
    const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await res.json();
    const msg = document.getElementById('authMsg');
    
    if (res.ok) {
        msg.innerText = "Enrollment successful! Redirecting to login...";
        msg.style.color = '#10b981';
        setTimeout(() => window.location.href = '/login.html', 1500);
    } else {
        msg.innerText = data.error;
        msg.style.color = '#ef4444';
    }
}

async function login(e) {
    e.preventDefault();
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, password: p })
    });
    const data = await res.json();
    const msg = document.getElementById('authMsg');
    
    if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.id);
        window.location.href = `/dashboard.html?id=${data.id}`;
    } else {
        msg.innerText = data.error;
        msg.style.color = '#ef4444';
    }
}

async function loadProfile(id) {
    const res = await fetch(`/api/profile?id=${id}`, {
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });
    const data = await res.json();
    const box = document.getElementById('profileData');
    const tauntBox = document.getElementById('tauntMsg');
    
    if (res.ok) {
        box.innerText = JSON.stringify(data, null, 2);
    } else {
        box.innerText = "Error: " + data.error;
        box.style.color = '#ef4444';
        if(data.taunt) tauntBox.innerText = `[System Log]: ${data.taunt}`;
    }
}

// VULNERABLE FUNCTION
async function generateIDCard() {
    const box = document.getElementById('idCardResult');
    box.style.display = 'block';
    box.innerText = "Generating...";

    // Attacker will intercept this and change currentUserId to '1'
    const res = await fetch(`/api/generate-id-card?user=${currentUserId}`, {
        headers: { 'Authorization': 'Bearer ' + jwtToken }
    });
    const data = await res.json();
    box.innerText = JSON.stringify(data, null, 2);
}

function logout() {
    localStorage.clear();
    window.location.href = '/';
}
