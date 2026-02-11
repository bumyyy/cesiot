const mysql = require('mysql2');

// CONFIGURATION
const db = mysql.createConnection({
     host: "localhost",
  user: "root",
  password: "1234",
  database: "cesiot"
});

// PARAMETRES DE GENERATION
const START_DATE = new Date('2023-01-01T00:00:00');
const END_DATE = new Date('2023-12-31T23:59:00');
const INTERVAL_MINUTES = 20; // Un relevé toutes les 20 min

// IDs des portes (basé sur l'étape 1 SQL)
const DOORS = {
    REFECTOIRE: [1, 2, 3], // IDs en base
    ACCUEIL: [4],
    SALLE_13: [5, 6]
};

db.connect((err) => {
    if (err) throw err;
    console.log("Connecté à la BDD. Génération en cours...");
    generateData();
});

function generateData() {
    let currentDate = new Date(START_DATE);
    let valuesBatch = [];
    const BATCH_SIZE = 5000; // Insertion par paquet pour la vitesse

    while (currentDate <= END_DATE) {
        const month = currentDate.getMonth() + 1; // 1-12
        const hour = currentDate.getHours();
        const minute = currentDate.getMinutes();
        
        // --- 1. Determiner la Saison ---
        // Hiver : Octobre (10) à Mars (3)
        const isWinter = (month >= 10 || month <= 3);
        
        // --- 2. Boucle sur chaque porte ---
        const allDoorIds = [...DOORS.REFECTOIRE, ...DOORS.ACCUEIL, ...DOORS.SALLE_13];
        
        allDoorIds.forEach(doorId => {
            let isOpen = false;
            let probability = 0;

            // --- 3. Logique d'ouverture (Règles horaires) ---
            
            // Règle globale : Fermé la nuit (20h - 6h)
            if (hour >= 6 && hour < 20) {
                
                // REFECTOIRE (Pics à 10h, 12h, 15h30)
                if (DOORS.REFECTOIRE.includes(doorId)) {
                    if (hour === 10 || hour === 12 || (hour === 15 && minute >= 30)) {
                        probability = 0.85; // 85% de chance d'ouverture
                    } else {
                        probability = 0.05; // Calme le reste du temps
                    }
                }
                
                // ACCUEIL (Tout le temps, pics 8h et 16h30)
                else if (DOORS.ACCUEIL.includes(doorId)) {
                    if (hour === 8 || (hour === 16 && minute >= 30)) {
                        probability = 0.90;
                    } else {
                        probability = 0.30; // Passages réguliers
                    }
                }
                
                // SALLE 13 (Très rare, ~2 fois par jour)
                else if (DOORS.SALLE_13.includes(doorId)) {
                    probability = 0.02; // 2% de chance (très faible sur une journée de 14h)
                }
            }

            // Tirage au sort de l'état
            isOpen = Math.random() < probability;

            // --- 4. Logique de Température ---
            let temperature = 21.0; // Base

            // Variation naturelle légère (bruit)
            temperature += (Math.random() - 0.5); 

            // Impact de l'ouverture
            if (isOpen) {
                if (isWinter) {
                    temperature -= (Math.random() * 4 + 2); // Chute de 2 à 6 degrés
                } else {
                    temperature += (Math.random() * 3 + 1); // Hausse de 1 à 4 degrés (été)
                }
            } else {
                // Si fermé mais heure de pointe (monde dans la pièce) => chauffe un peu
                if (probability > 0.5) temperature += 1.5;
            }

            // Formatter la date pour MySQL
            const sqlDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

            // Ajouter au tableau
            valuesBatch.push([doorId, sqlDate, parseFloat(temperature.toFixed(1)), isOpen]);
        });

        // --- 5. Insertion en base si le paquet est plein ---
        if (valuesBatch.length >= BATCH_SIZE) {
            insertBatch(valuesBatch);
            valuesBatch = []; // Vider
        }

        // Avancer le temps
        currentDate.setMinutes(currentDate.getMinutes() + INTERVAL_MINUTES);
    }

    // Insérer ce qui reste à la fin
    if (valuesBatch.length > 0) {
        insertBatch(valuesBatch, true);
    }
}

function insertBatch(data, isLast = false) {
    const sql = "INSERT INTO door_metrics (door_id, measured_at, temperature, is_open) VALUES ?";
    db.query(sql, [data], (err) => {
        if (err) throw err;
        process.stdout.write("."); // Barre de chargement visuelle
        if (isLast) {
            console.log("\n\n✅ TERMINÉ ! Données générées avec succès.");
            db.end();
        }
    });
}
