let isUserRegistered = false;
let currentMode = 'reg'; 
let pendingTabId = null;
let pendingButton = null;

// Твоя ПРАВИЛЬНА адреса бекенду на Railway
const API_URL = 'https://havrs-finding-production.up.railway.app';

/**
 * Перевірка зв'язку з сервером при завантаженні сторінки
 */
async function checkServerStatus() {
    try {
        const response = await fetch(API_URL + '/');
        const text = await response.text();
        console.log("✅ Статус сервера:", text);
    } catch (err) {
        console.error("❌ Сервер недоступний:", err);
    }
}
checkServerStatus();

/**
 * Керування вкладками
 */
function handleTabClick(btnElement, tabId) {
    if (!isUserRegistered) {
        pendingTabId = tabId;
        pendingButton = btnElement;
        document.getElementById('auth-modal').style.display = 'flex';
        return; 
    }
    openTab(btnElement, tabId);
}

function openTab(btnElement, tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    
    const targetTab = document.getElementById(tabId);
    if (targetTab) {
        targetTab.classList.add('active-tab');
        btnElement.classList.add('active');
    }
}

/**
 * Перемикання Реєстрація / Вхід
 */
function switchAuth(mode) {
    currentMode = mode;
    const title = document.getElementById('auth-title');
    const subtitle = document.getElementById('auth-subtitle');
    const nickGroup = document.getElementById('nick-group');
    const submitBtn = document.getElementById('submit-btn');

    if (mode === 'reg') {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        title.textContent = 'Registration';
        subtitle.textContent = 'Join to find your perfect squad';
        if (nickGroup) nickGroup.style.display = 'block';
        submitBtn.textContent = 'Register & Enter';
    } else {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-register').classList.remove('active');
        title.textContent = 'Welcome Back';
        subtitle.textContent = 'Login to access game lobbies';
        if (nickGroup) nickGroup.style.display = 'none';
        submitBtn.textContent = 'Login & Enter';
    }
}

/**
 * ВІДПРАВКА ФОРМИ НА СЕРВЕР
 */
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const nickname = document.getElementById('nickname') ? document.getElementById('nickname').value : "";
    const errorEl = document.getElementById('error-msg');
    const submitBtn = document.getElementById('submit-btn');

    if (errorEl) errorEl.style.display = 'none';
    submitBtn.textContent = "Connecting...";

    const path = currentMode === 'reg' ? 'register' : 'login';
    const finalUrl = `${API_URL}/${path}`;

    const body = currentMode === 'reg' 
        ? { email, password, username: nickname } 
        : { email, password };

    try {
        const res = await fetch(finalUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (res.ok) {
            isUserRegistered = true;
            
            // Відображення імені гравця
            const displayName = nickname || data.user?.username || "Player";
            const playerDisplay = document.getElementById('player-display');
            if (playerDisplay) {
                playerDisplay.innerHTML = `Player: <strong>${displayName}</strong>`;
            }

            document.getElementById('settings-btn').style.display = 'inline-block';
            document.getElementById('auth-modal').style.display = 'none';
            
            if (pendingTabId && pendingButton) openTab(pendingButton, pendingTabId);
            
            alert(currentMode === 'reg' ? "Registration successful!" : "Welcome back!");
        } else {
            if (errorEl) {
                errorEl.textContent = "❌ " + (data.detail || "Error");
                errorEl.style.display = 'block';
            }
        }
    } catch (err) {
        if (errorEl) {
            errorEl.textContent = "❌ Server is offline. Try to refresh the page (Ctrl+F5).";
            errorEl.style.display = 'block';
        }
        console.error("Fetch error:", err);
    } finally {
        submitBtn.textContent = currentMode === 'reg' ? 'Register & Enter' : 'Login & Enter';
    }
});

// Закриття модалки
window.onclick = function(event) {
    const modal = document.getElementById('auth-modal');
    if (event.target == modal) modal.style.display = 'none';
};