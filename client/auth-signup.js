document.querySelector('.auth-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop standard form reload
    
    const name = document.getElementById('name').value;
    const surname = document.getElementById('surname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if(password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, surname, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert(data.message || "Sign up successful!");
            window.location.href = 'login.html'; // Redirect manually on success
        } else {
            alert(data.error || "Signup failed");
        }
    } catch (error) {
        alert("Server connection failed. Make sure the server is running on port 5000.");
    }
});
