document.querySelector('.auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('calcToken', data.token); // Store security session
            window.location.href = 'index.html'; // Direct user to the actual calculator
        } else {
            alert(data.error || "Login failed");
        }
    } catch (error) {
        alert("Server connection failed. Make sure the server is running on port 5000.");
    }
});
