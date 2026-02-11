async function initYearDropdown() {
    const select = document.getElementById('yearSelect');
    const currentYear = new Date().getFullYear();

    const response = await fetch(`/infos/years`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    });
    const years = await response.json();

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year.year;
        option.textContent = year.year;
        select.appendChild(option);
    });

    loadMonthChart(select.value);

    // Rechargement quand on change l'année
    select.addEventListener('change', () => {
        loadMonthChart(select.value);
    });
}

// attendre que le DOM soit prêt
document.addEventListener("DOMContentLoaded", initYearDropdown);
