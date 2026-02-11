let chart;

async function loadMonthChart(year) {
    const ctx = document.getElementById('chartMonth');

    // On récupère les données
    const response = await fetch(`${process.env.API_URL}/state/month?year=` + year , {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const data = await response.json();

    // On prépare deux tableaux vides pour les 12 mois
    const openValues = Array(12).fill(0);
    const tempValues = Array(12).fill(0);

    data.forEach(item => {
        if (item.mois >= 1 && item.mois <= 12) {
            openValues[item.mois - 1] = item.opened;
            tempValues[item.mois - 1] = item.avg_temp ? item.avg_temp.toFixed(1) : 0;
        }
    });

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'bar', // Type par défaut global
        data: {
            labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
            datasets: [
                {
                    label: 'Nombre d\'ouvertures',
                    data: openValues,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)', // Bleu
                    order: 2, // Pour que les barres soient derrière la ligne
                    yAxisID: 'y', // Axe de GAUCHE
                },
                {
                    label: 'Température Moyenne (°C)',
                    data: tempValues,
                    type: 'line', // On force ce dataset en LIGNE
                    borderColor: 'rgba(255, 99, 132, 1)', // Rouge
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    tension: 0.4, // Pour courber un peu la ligne
                    order: 1, // Pour que la ligne soit devant les barres
                    yAxisID: 'y1', // Axe de DROITE
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
                    title: {
                        display: true,
                        text: 'Nombre d\'ouvertures'
                    },
                    beginAtZero: true
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
                        drawOnChartArea: false, // Cache la grille pour l'axe de droite (plus lisible)
                    }
                }
            }
        }
    });
}