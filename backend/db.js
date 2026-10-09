
require("dotenv").config();

const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "2001",
    database: "expense_tracker_db",
    waitForConnections: true,
    connectionLimit: 10
});

db.getConnection((error, connection) => {
    if (error) {
        console.error("MySQL connection failed:", error.message);
        return;
    }

    console.log("MySQL connected successfully!");
    connection.release();
});

module.exports = db.promise();