const con = require('../database/db.js');
const bcrypt = require('bcrypt');

module.exports = {
    
    checkPassword: async function(username) {
        const sqlFind = "SELECT * FROM users WHERE username = ?";
        return await query(sqlFind, [username]);
    },

    addUser: async function(username, password, role) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const sql = "INSERT INTO users (username, password, role) VALUES (?, ?, ?)";
        return await query(sql, [username, hash, role]);
    },

    getAllUsers: async function() {
        const sqlFind = "SELECT * FROM users";
        return await query(sqlFind);
    },

    deleteUser: async function(id) {
        const sqlDelete = "DELETE FROM users WHERE id = ?";
        return await query(sqlDelete, [id]);
    }
}

async function query(sql, args) {
    return new Promise((resolve, reject) => {
        con.query(sql, args, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}