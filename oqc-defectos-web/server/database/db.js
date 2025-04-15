const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'defectos.db');

// Crear conexión a la base de datos
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite');
        inicializarDB();
    }
});

function inicializarDB() {
    db.run(`CREATE TABLE IF NOT EXISTS defectos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fecha TEXT NOT NULL,
        codigo TEXT NOT NULL,
        defecto TEXT NOT NULL,
        ubicacion TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Error al crear tabla:', err.message);
        }
    });
}

// Promisify db methods
db.allAsync = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

db.runAsync = function (sql, params) {
    return new Promise((resolve, reject) => {
        this.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

module.exports = db;