const con = require('../database/db.js');

module.exports = {
    
    saveToDb: async function(wsData) {
        const sqlInsert = "INSERT INTO door_metrics (door_id, temperature, is_open) VALUES (?, ?, ?)";
        await query(sqlInsert, [wsData.door_id, wsData.temperature, wsData.is_open]);
    },

    getOrCreateDoorId: async function(locationName, doorNumber) {
        let locationId = await getLocationId(locationName);
        if (!locationId) {
            const resLoc = await query("INSERT INTO location (doorLocation) VALUES (?)", [locationName]);
            locationId = resLoc.insertId;
        }
        let doorId = await getDoorId(locationId, doorNumber);
        if (!doorId) {
            const resDoor = await query("INSERT INTO door (id_location, doorNumber) VALUES (?, ?)", [locationId, doorNumber]);
            doorId = resDoor.insertId;
        }
        return doorId;
    },

}

async function getLocationId(name) {
        const rows = await query("SELECT id FROM location WHERE doorLocation = ?", [name]);
        return rows.length > 0 ? rows[0].id : null;
}

async function getDoorId(locId, num) {
    const rows = await query("SELECT id FROM door WHERE id_location = ? AND doorNumber = ?", [locId, num]);
    return rows.length > 0 ? rows[0].id : null;
}



async function query(sql, args) {
    return new Promise((resolve, reject) => {
        con.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}