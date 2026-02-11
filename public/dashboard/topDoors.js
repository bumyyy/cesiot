async function loadTopDoors() {
    const listContainer = document.getElementById('topDoorList');

    try {
        // 1. Récupération des données
        const response = await fetch(`${process.env.API_URL}/state/door` , {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
        const data = await response.json();

        data.sort((a, b) => b.opened - a.opened);

        const topDoors = data.slice(0, 5);

        let htmlContent = '';

        topDoors.forEach((door, index) => {
            let badgeClass = 'bg-light text-secondary border';
            let icon = '';

            if (index === 0) {
                badgeClass = 'bg-warning text-dark border-warning'; // Or
            } else if (index === 1) {
                badgeClass = 'bg-secondary text-white border-secondary'; // Argent
            } else if (index === 2) {
                badgeClass = 'bg-danger text-white border-danger'; // Bronze
            }

            htmlContent += `
                <li class="list-group-item d-flex justify-content-between align-items-center py-3">
                    <div class="d-flex align-items-center">
                        <span class="badge ${badgeClass} rounded-pill me-3 d-flex justify-content-center align-items-center" style="width: 50px; height: 25px;">
                            ${icon} <span class="${icon ? 'ms-1' : ''}">#${index + 1}</span>
                        </span>
                        
                        <div class="d-flex flex-column">
                            <span class="fw-bold text-dark">${door.localisation}</span>
                            <small class="text-muted" style="font-size: 0.8em;">Porte n°${door.numero}</small>
                        </div>
                    </div>

                    <div class="text-end">
                        <span class="fw-bold fs-5 text-primary">${door.opened}</span>
                        <small class="text-muted d-block" style="font-size: 0.7em;">ouvertures</small>
                    </div>
                </li>
            `;
        });

        listContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Erreur lors du chargement des top portes:", error);
        listContainer.innerHTML = '<li class="list-group-item text-danger text-center">Erreur de chargement des données.</li>';
    }
}

document.addEventListener("DOMContentLoaded", loadTopDoors);