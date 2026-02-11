require('dotenv').config();

async function initDoors() {
    const tbody = document.getElementById('liveStatusTable');

    const res = await fetch(`${process.env.API_URL}/infos/doors`, {
        headers: {'Authorization': 'Bearer ' + token}
    });
    const doors = await res.json();

    doors.forEach(data => {


        updateTable(data);
    });
}

initDoors();

const socket = new WebSocket(process.env.WS_URL);

socket.addEventListener('message', event => {
    try {
        const data = JSON.parse(event.data);
        if (!data.type || data.type !== 'info') {

            //On recoit un message de mise à jour d'état de porte
            let row = document.getElementById(`row-door-${data.door_id}`);
            row.lastData = Date.now();

            updateTable(data);
        }
    } catch (error) {
        console.error('Erreur :', error);
    }
});

function updateTable(data) {
    const tbody = document.getElementById('liveStatusTable');
    let row = document.getElementById(`row-door-${data.door_id}`);

    // CRÉATION AUTOMATIQUE SI INEXISTANT
    if (!row) {
        row = document.createElement('tr');
        row.id = `row-door-${data.door_id}`;
        const locationDisplay = data.location ? data.location.charAt(0).toUpperCase() + data.location.slice(1) : 'Inconnu';

        if (data.door_number != undefined && data.door_number !== null) {

            row.innerHTML = `
            <td class="ps-4 fw-bold">${locationDisplay}</td>
            <td>Porte ${data.door_number || '?'}</td>
            <td><span class="badge bg-secondary status-badge">En attente...</span></td>
            <td class="temp-display text-muted">--</td>
            <td class="text-muted small time-display">À l'instant</td>
        `;
            row.lastData = data.timestamp;
        }

        tbody.appendChild(row);
        row.style.animation = "fadeIn 1s";
    }

    const lastDataTmp = (Date.now() - new Date(row.lastData * 1000).getTime()) / 1000;

    if (lastDataTmp > 5000) {
        badge.className = 'badge bg-secondary status-badge';
        row.querySelector('.time-display').textContent = displayTimeSince(lastDataTmp);
    }

    if (data.is_open !== null && data.is_open !== undefined) {
        const badge = row.querySelector('.status-badge');

        const isOpen = data.is_open === '1' ? false : true;

        if (isOpen) {
            badge.className = 'badge bg-danger pulse-danger status-badge';
            badge.textContent = 'Ouverte (Alerte)';
        } else {
            badge.className = 'badge bg-success status-badge';
            badge.textContent = 'Fermée';
        }
    }

    if (data.temperature !== null && data.temperature !== undefined) {
        const tempCell = row.querySelector('.temp-display');
        const temp = parseFloat(data.temperature);

        let colorClass = 'text-dark';
        let icon = 'bi-thermometer-half';

        if (temp < 19) {
            colorClass = 'text-primary';
            icon = 'bi-thermometer-snow';
        } else if (temp > 28) {
            colorClass = 'text-danger';
            icon = 'bi-thermometer-sun';
        }

        tempCell.className = `fw-bold temp-display ${colorClass}`;
        tempCell.innerHTML = `<i class="bi ${icon}"></i> ${temp.toFixed(1)}°C`;
    }

    if (data.timestamp) { // timestamp UNIX en secondes
        const date = new Date(data.timestamp * 1000); // convertir en ms
        const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
        row.querySelector('.time-display').textContent = displayTimeSince(diffInSeconds);
        ;
    }

}

function displayTimeSince(diffInSeconds) {
    let displayText;
    if (diffInSeconds < 60) {
        displayText = `il y a ${diffInSeconds} seconde${diffInSeconds > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        displayText = `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
        const hours = Math.floor(diffInSeconds / 3600);
        displayText = `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    }
    return displayText
}

setInterval(() => {


    // const badge = row.querySelector('.status-badge');
    // if (badge) {
    //     badge.className = 'badge bg-secondary status-badge'; // gris
    //     //badge.textContent = 'Inactif';
    // }
    // const tempCell = row.querySelector('.temp-display');
    // if (tempCell) tempCell.className = 'fw-bold temp-display text-muted';

    // });
}, 1000);
