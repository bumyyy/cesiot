// Sécurité basique Front-end
const token = localStorage.getItem('token');

if (!token) {
    // Pas de token ? Hop, retour à la case départ
    window.location.href = '/login';
} else {
    // Si tu veux appeler ton API protégée (ex: /) pour vérifier le token
    fetch('http://127.0.0.1:8080/verify', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token // C'est ici qu'on utilise le JWT
        }
    })
    .then(res => {
        if (res.status === 401 || res.status === 403) {
            // Token expiré ou invalide
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return res.json();
    })
    .then(data => {
        console.log("Utilisateur vérifié :", data.user);
    });
}

// Fonction de déconnexion (à lier à un bouton)
function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}