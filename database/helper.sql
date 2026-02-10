CREATE TABLE location (
    id INT AUTO_INCREMENT PRIMARY KEY,
    doorLocation VARCHAR(255) NOT NULL
);

CREATE TABLE door (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_location INT NOT NULL,
    doorNumber INT NOT NULL,
    CONSTRAINT fk_location_door
        FOREIGN KEY (id_location) REFERENCES location(id)
);

CREATE TABLE door_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    door_id INT NOT NULL,
    measured_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    temperature FLOAT,
    is_open BOOLEAN,
    FOREIGN KEY (door_id) REFERENCES door(id)
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin' ou 'user'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE door_metrics;
TRUNCATE TABLE door;
TRUNCATE TABLE location;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO location (id, doorLocation) VALUES 
(1, 'Refectoire'),
(2, 'Accueil'),
(3, 'Salle 13');

INSERT INTO door (id_location, doorNumber) VALUES (1, 1), (1, 2), (1, 3);
INSERT INTO door (id_location, doorNumber) VALUES (2, 1);
INSERT INTO door (id_location, doorNumber) VALUES (3, 1), (3, 2);