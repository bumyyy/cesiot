async function initYearDropdown() {
    const currentYear = new Date().getFullYear();

    loadMonthChart(currentYear);
}

// attendre que le DOM soit prêt
document.addEventListener("DOMContentLoaded", initYearDropdown);
