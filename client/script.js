function calculate(expression) {
    if (!expression) return "";
    try {
        let exp = expression;
        exp = exp.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(exp);

        if (result !== undefined && result !== null && !isNaN(result)) {
            saveToHistory(expression, result);
        }
        return result;
    } catch (error) {
        return "Error";
    }
}

// Intercept calculation to push straight to the server
async function saveToHistory(expression, result) {
    const token = localStorage.getItem('calcToken');
    if (!token) return; // If guest, don't save remotely

    try {
        await fetch('http://localhost:5000/api/history', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ expression, result })
        });
        renderHistory();
    } catch (err) {
        console.error("Failed to save history:", err);
    }
}

// Fetch history from database on load
async function renderHistory() {
    const container = document.getElementById('history-result');
    if (!container) return;

    const token = localStorage.getItem('calcToken');
    if (!token) {
        container.innerHTML = '<div class="empty-history">Log in to view history</div>';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/history', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyData = await response.json();

        if (!response.ok) {
            container.innerHTML = `<div class="empty-history">${historyData.error || 'Session expired. Please log in again.'}</div>`;
            return;
        }

        if (historyData.length === 0) {
            container.innerHTML = '<div class="empty-history">No calculations yet</div>';
            return;
        }

        container.innerHTML = historyData.map(item => `
            <div class="history-item" onclick="insertHistoryValue('${item.result}')">
                <div class="history-expr">${item.expression}</div>
                <div class="history-res">= ${item.result}</div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<div class="empty-history">Error loading history</div>';
    }
}

function viewHistory() {
    const panel = document.getElementById('history-panel');
    const toggleBtn = document.getElementById('history-toggle');
    if (panel) {
        const isCollapsed = panel.classList.toggle('collapsed');
        if (toggleBtn) {
            if (isCollapsed) {
                toggleBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> View History';
            } else {
                toggleBtn.innerHTML = '<i class="fa-solid fa-xmark"></i> Hide History';
            }
        }
    }
}

async function clearHistory() {
    const token = localStorage.getItem('calcToken');
    if (!token) return;

    try {
        // Suggested: Implement app.delete('/api/history') in server.js to delete history entries for this user
        await fetch('http://localhost:5000/api/history', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
    } catch (err) {
        console.error("Failed to contact clear history endpoint:", err);
    }
    renderHistory();
}

function insertHistoryValue(value) {
    const form = document.getElementById('calc-form');
    if (form && form.display) {
        form.display.value = value;
    }
}

async function loadProfile() {
    const token = localStorage.getItem('calcToken');
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const logoutBtn = document.querySelector('.logout-btn');

    if (!token) {
        if (nameEl) nameEl.textContent = "Guest User";
        if (emailEl) emailEl.innerHTML = '<a href="login.html" style="color: #b76eff; text-decoration: none; font-weight: 500;">Log in here</a>';
        if (logoutBtn) logoutBtn.style.display = 'none';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profile = await response.json();

        if (response.ok) {
            if (nameEl) nameEl.textContent = `${profile.name} ${profile.surname}`;
            if (emailEl) emailEl.textContent = profile.email;
            if (logoutBtn) logoutBtn.style.display = 'flex';
        } else {
            // Token expired or invalid
            localStorage.removeItem('calcToken');
            if (nameEl) nameEl.textContent = "Guest User";
            if (emailEl) emailEl.innerHTML = '<a href="login.html" style="color: #b76eff; text-decoration: none; font-weight: 500;">Log in here</a>';
            if (logoutBtn) logoutBtn.style.display = 'none';
        }
    } catch (err) {
        if (nameEl) nameEl.textContent = "Offline Profile";
        if (emailEl) emailEl.textContent = "Error loading profile details";
    }
}

function logout() {
    localStorage.removeItem('calcToken');
    window.location.href = 'login.html';
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    loadProfile();
});
