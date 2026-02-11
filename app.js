require('dotenv').config();
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const { WebSocketServer } = require('ws');
const mqtt = require('mqtt');
const cors = require('cors');
const dbManagment = require('./model/doorManagment.js');
const path = require('path');
const MQTT_URL = process.env.MQTT_URL;
const MQTT_USERNAME = process.env.MQTT_USERNAME;
const MQTT_PASSWORD = process.env.MQTT_PASSWORD;

const { getStateMonth, getStateHour, getStateDoor, getAllYears, getDoors } = require('./controllers/door');
const { login, authenticateJWT, authorizeAdmin, addUser, getAllUsers, deleteUser } = require('./controllers/auth');

const app = express();

// CONFIGURATION EXPRESS
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/verify', authenticateJWT, (req, res) => {
    res.json({ valid: true, user: req.user });
});
app.post('/login', login);
app.get('/users', authenticateJWT, getAllUsers);
app.post('/adduser',authenticateJWT, authorizeAdmin, addUser);
app.delete('/users/:id', authenticateJWT, authorizeAdmin, deleteUser);
app.get("/infos/doors", authenticateJWT, getDoors);
app.get("/infos/years", authenticateJWT, getAllYears);
app.get("/state/month", authenticateJWT, getStateMonth);
app.get("/state/hour", authenticateJWT, getStateHour);
app.get("/state/door", authenticateJWT, getStateDoor);

// CRÉATION DU SERVEUR
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on('connection', function connection(ws) {
  console.log('client WebSocket connecté');

  ws.send(JSON.stringify({ type: 'info', content: 'Bienvenue sur le serveur' }));

  ws.on('message', function message(data) {
    console.log('Reçu du front:', data.toString());
  });
});

// CONFIGURATION MQTT
const mqttClient = mqtt.connect(MQTT_URL, {
    username: MQTT_USERNAME, 
    password: MQTT_PASSWORD,
    port : 62555,
    rejectUnauthorized: false
}); 
mqttClient.on('connect', () => {
    console.log('Connecté au Broker MQTT');
    mqttClient.subscribe('#');
});

// PONT MQTT -> WEBSOCKET
mqttClient.on('message', async (topic, message) => {
    
    const msgString = JSON.parse(message.toString());
    console.log(`MQTT : ${topic} - ${msgString.state} - Temp: ${msgString.temperature}°C - Timestamp: ${msgString.timestamp}`);

    const parts = topic.split('/');
    if (parts.length < 4 || parts[1] !== 'door') {
        console.log("Format de topic ignoré");
        return;
    }

    const wsData = {
        door_id: await dbManagment.getOrCreateDoorId(parts[0], parseInt(parts[2])),
        location: parts[0],
        door_number: parseInt(parts[2]),
        temperature:parseFloat(msgString.temperature) || null,
        is_open: msgString.state,
        received_at: msgString.timestamp ? parseInt(msgString.timestamp) * 1000 : Date.now()
    };

    // Enregristrement dans la base de données
    dbManagment.saveToDb(wsData);

    // On renvoie ce message aux clients connectés au WebSocket
    wss.clients.forEach(client => {
        if (client.readyState === 1) client.send(JSON.stringify(wsData));
    });

});

// DÉMARRAGE DU SERVEUR SUR LE PORT 8080
server.listen(8080, () => {
    console.log('🚀 Serveur (API + WebSocket) démarré sur le port 8080');
});
