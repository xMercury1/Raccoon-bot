const { Client } = require("pg");
require("dotenv").config();

// 🔹 Conectar a PostgreSQL en Railway
const db = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Necesario para Railway
});

db.connect()
    .then(() => console.log("✅ Conectado a la base de datos en Railway"))
    .catch(err => console.error("❌ Error conectando a la base de datos:", err));

// 🔹 Crear la tabla si no existe
db.query(`
    CREATE TABLE IF NOT EXISTS settings (
        guild_id TEXT PRIMARY KEY,
        music_channel TEXT
    )
`);

// 🔹 Guardar el canal de música
async function setMusicChannel(guildId, channelId) {
    await db.query(`
        INSERT INTO settings (guild_id, music_channel) VALUES ($1, $2)
        ON CONFLICT (guild_id) DO UPDATE SET music_channel = $2
    `, [guildId, channelId]);
}

// 🔹 Obtener el canal de música
async function getMusicChannel(guildId) {
    const res = await db.query("SELECT music_channel FROM settings WHERE guild_id = $1", [guildId]);
    return res.rows.length > 0 ? res.rows[0].music_channel : null;
}

module.exports = { setMusicChannel, getMusicChannel };
