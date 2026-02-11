// Sécurité basique Front-end
const token = localStorage.getItem('token');

if (!token) {
    window.location.href = '/login';
} else {
    fetch(`${process.env.API_URL}/verify`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token 
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