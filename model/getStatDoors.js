const con = require('../database/db.js');

module.exports = {

    // get the number of times each door was closed per month
    getStateMonth: function(year, callback) {
        con.query(`
            SELECT 
                MONTH(measured_at) AS mois,
                SUM(is_open = 0) AS opened,
                AVG(temperature) AS avg_temp
            FROM door_metrics
            WHERE YEAR(measured_at) = ?
            GROUP BY mois
            HAVING opened > 0;
        `, [year], function(err, results) {
        if (err) return callback(err);
        callback(null, results);
        });
    },

    // get the number of times each door was opened per hour
    getStateHour: function(callback) {
        con.query(`
            SELECT 
                HOUR(measured_at) AS heure,
                SUM(is_open = 0) AS opened,
                AVG(temperature) AS avg_temp
            FROM door_metrics
            GROUP BY heure
            HAVING opened > 0;
        `, function(err, results) {
        if (err) return callback(err);
        callback(null, results);
        });
    },

    //get the number of time each door was opened per door
    getStateDoor: function(callback) {
        con.query(`
            SELECT
                l.doorLocation AS localisation,
                d.doorNumber AS numero,
                SUM(m.is_open = 0) AS opened
            FROM door_metrics m
            INNER JOIN door d ON m.door_id = d.id
            INNER JOIN location l ON d.id_location = l.id
            GROUP BY d.id
            HAVING opened > 0;
        `, function(err, results) {
        if (err) return callback(err);
        callback(null, results);
        });
    },

     // get the number of times each door was closed per month
    getAllYears: function(callback) {
        con.query(`
            SELECT DISTINCT YEAR(measured_at) AS year
            FROM door_metrics
            ORDER BY year DESC;
        `, function(err, results) {
        if (err) return callback(err);
        callback(null, results);
        });
    },

    getDoors: function(callback) {
        con.query(`
            SELECT d.id as door_id, l.doorLocation as location, d.doorNumber as door_number,
                   m.temperature, m.is_open, UNIX_TIMESTAMP(m.measured_at) as timestamp
            FROM door d
            JOIN location l ON l.id = d.id_location
            LEFT JOIN door_metrics m ON m.id = (
                SELECT id FROM door_metrics
                WHERE door_id = d.id
                ORDER BY measured_at DESC
                LIMIT 1
            )
        `, function(err, results) {
        if (err) return callback(err);
        callback(null, results);
        });
    },

}