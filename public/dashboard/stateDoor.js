require('dotenv').config();

async function loadDoorChart() {
    const ctx = document.getElementById('chartDoor');

    const response = await fetch(`${process.env.API_URL}/state/door`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.map(item => item.localisation + " " + item.numero),
            datasets: [{
            label: 'Nombre de fois que chaque porte a été ouverte',
            data: data.map(item => item.opened),
            borderWidth: 1
            }]
        },
        options: {
            scales: {
            y: {
                beginAtZero: true
            }
            }
        }
    });

}

// attendre que le DOM soit prêt
document.addEventListener("DOMContentLoaded", loadDoorChart);
