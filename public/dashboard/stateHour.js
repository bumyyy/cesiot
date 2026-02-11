let chartHourInstance; // Variable pour stocker l'instance du graphique (pour pouvoir le détruire si on reload)

async function loadHourChart() {
    const ctx = document.getElementById('chartHour');

    const response = await fetch(`/state/hour`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();

    // On prépare les tableaux pour les 24 heures (0 à 23)
    const openValues = Array(24).fill(0);
    const tempValues = Array(24).fill(0);

    data.forEach(item => {
        if (
            item.heure !== undefined &&
            item.heure >= 0 &&
            item.heure < 24
        ) {
            // Remplissage des ouvertures
            openValues[item.heure] = item.opened || 0;
            // Remplissage de la température (arrondie)
            tempValues[item.heure] = item.avg_temp ? item.avg_temp.toFixed(1) : 0;
        }
    });

    // Si un graphique existe déjà, on le détruit pour éviter les bugs d'affichage
    if (chartHourInstance) {
        chartHourInstance.destroy();
    }

    chartHourInstance = new Chart(ctx, {
        type: 'bar', // Type principal
        data: {
            // Labels de 00h à 23h
            labels: ['00h', '01h', '02h', '03h', '04h', '05h', '06h', '07h', '08h', '09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h', '17h', '18h', '19h', '20h', '21h', '22h', '23h'],
            datasets: [
                {
                    label: 'Ouvertures',
                    data: openValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Bleu
                    order: 2, // Derrière la ligne
                    yAxisID: 'y', // Axe GAUCHE
                },
                {
                    label: 'Température (°C)',
                    data: tempValues,
                    type: 'line', // Ligne
                    borderColor: 'rgba(255, 159, 64, 1)', // Orange/Rouge
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    tension: 0.4, // Courbe lissée
                    pointRadius: 2,
                    order: 1, // Devant les barres
                    yAxisID: 'y1', // Axe DROITE
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Nombre d\'ouvertures'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Température (°C)'
                    },
                    grid: {
                        drawOnChartArea: false, // Cache la grille pour plus de clarté
                    }
                }
            }
        }
    });
}

// Lancer le chargement au démarrage
document.addEventListener("DOMContentLoaded", loadHourChart);