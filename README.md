 Architecture technique

 2. Architecture technique
a) Backend

    Langage/Technologie :
        Node.js avec Express (léger, adapté pour API REST/WebSocket).
    Base de données :
        SQL(PostgreSQL) pour données structurées (logs RFID, alertes et intrusion).
        Nom de la BD:sensor_dashboard
        Les Tables:
    CREATE TABLE intrusions (
    id SERIAL PRIMARY KEY,\\ Colonne qui sert d'identifiant unique pour chaque intrusion.
    timestamp TIMESTAMP,  \\ Stocke la date et l'heure de l'intrusion (ex. : 2025-06-27 12:03:00).
    location VARCHAR(100), \\ Stocke l'emplacement de l'intrusion (ex. : "Salon", "Entrée")
    type VARCHAR(50),  \\ Indique le type d'intrusion (ex. : "Mouvement", "Porte ouverte").
    severity INT  \\ Représente la gravité de l'intrusion (ex. : 1 pour faible, 5 pour critique).
);

CREATE TABLE gas_levels (
    id SERIAL PRIMARY KEY, \\ Identifiant unique auto-incrémenté, similaire à intrusions
    timestamp TIMESTAMP,  \\ Date et heure de la mesure (ex. : pour suivre les variations dans le temps).
    sensor_id VARCHAR(50),   \\  identifie le capteur spécifique (ex. : "Sensor01", "Sensor02")
    gas_type VARCHAR(20),  \\  Spécifie le type de gaz (ex. : "CO2", "CH4").
    value FLOAT   \\ Stocke la valeur mesurée (ex. : 15.5 ppm)
);

CREATE TABLE rfid_logs (
    id SERIAL PRIMARY KEY,   \\ Identifiant unique auto-incrémenté.
    timestamp TIMESTAMP,    \\ Date et heure de la lecture RFID.
    card_id VARCHAR(50),   \\ dentifie la carte RFID scannée (ex. : "CARD123").
    status VARCHAR(20),   \\ Indique l'état de la lecture (ex. : "Validé", "Rejeté").
    reader_id VARCHAR(50)   \\ Identifie le lecteur RFID (ex. : "Reader01").
);

    API :
        REST pour récupérer les données historiques (ex. : /api/intrusion, /api/gas).
        WebSocket pour mises à jour en temps réel.
    Collecte des données :
        Protocole MQTT pour récupérer les données des capteurs IoT.
        Intégration des lecteurs RFID via API ou SDK fourni par le fabricant.

b) Frontend

    Framework :
        React  pour une interface dynamique et réactive.
    Bibliothèques de visualisation :
        Chart.js pour graphiques (lignes, barres, jauges).
    UI/UX :
        Framework CSS comme Tailwind CSS ou Bootstrap pour un design responsive.
        Composants comme tableaux, cartes, et alertes visuelles.

c) Infrastructure

    Hébergement :
  
