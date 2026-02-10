const mysql = require('mysql');

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "cesiot"
});

con.connect(err => {
  if (err) throw err;
  console.log("Connected to MySQL!");
});

module.exports = con;