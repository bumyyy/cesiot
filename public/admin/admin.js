const token = localStorage.getItem('token');

if (!token) window.location.href = '/login';
if(localStorage.getItem('user')) {
    const user = JSON.parse(localStorage.getItem('user'));
    if(user.role !== 'admin') {
        alert("Accès refusé: Vous n'avez pas les droits Admin !");
        window.location.href = '/home';
    }
} else {
    alert("Accès refusé: Vous n'avez pas les droits Admin !");
    window.location.href = '/home';
}

async function loadUsers() {
    try {
        const response = await fetch('http://127.0.0.1:8080/users', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        
        if(!response.ok) throw new Error("Non autorisé");

        const users = await response.json();
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        console.log("Utilisateurs récupérés :", users);

        users.forEach(user => {
            // Badge couleur selon le rôle
            const roleBadge = user.role === 'admin' 
                ? '<span class="badge bg-danger">Admin</span>' 
                : '<span class="badge bg-info text-dark">User</span>';

            const row = `
                <tr>
                    <td class="ps-4 text-muted">#${user.id}</td>
                    <td class="fw-bold">${user.username}</td>
                    <td>${roleBadge}</td>
                    <td class="text-end pe-4">
                        <button onclick="deleteUser(${user.id})" class="btn btn-outline-danger btn-sm">
                            <i class="bi bi-trash"></i> Supprimer
                        </button>
                    </td>
                </tr>
            `;
            tbody.innerHTML += row;
        });

    } catch (error) {
        console.error(error);
    }
}

document.getElementById('addUserForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const role = document.getElementById('newRole').value;

    const res = await fetch('http://127.0.0.1:8080/adduser', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token 
        },
        body: JSON.stringify({ username, password, role })
    });

    if (res.ok) {
        alert('Utilisateur créé !');
        document.getElementById('addUserForm').reset();
        loadUsers(); // Recharger le tableau
    } else {
        const err = await res.json();
        alert('Erreur: ' + err.message);
    }
});

async function deleteUser(id) {
    if(!confirm("Voulez-vous vraiment supprimer cet utilisateur ?")) return;

    const res = await fetch(`http://127.0.0.1:8080/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
    });

    if (res.ok) {
        loadUsers();
    } else {
        alert("Impossible de supprimer.");
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login';
}

// Lancer au démarrage
loadUsers();