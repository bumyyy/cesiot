require('dotenv').config();

const loginForm = document.getElementById('loginForm');
    const errorAlert = document.getElementById('errorAlert');

    loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // SUCCÈS : 
            // A. On cache l'erreur si elle était là
            errorAlert.classList.add('d-none');
            
            // B. On stocke le Token dans le navigateur
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({ username: username, role: data.user.role }));

            // C. Redirection vers le Dashboard (index.html)
            console.log("Connexion réussie, redirection...");
            if(data.user && data.user.role === 'admin') {
                window.location.href = '/admin'; 
            } else {
            window.location.href = '/home'; 
            }

        } else {
            // ERREUR (401, etc)
            showError(data.message || 'Erreur de connexion');
        }

    } catch (error) {
        console.error('Erreur réseau:', error);
        showError('Impossible de joindre le serveur.');
    }
    });

    function showError(msg) {
    errorAlert.textContent = msg;
    errorAlert.classList.remove('d-none');
}