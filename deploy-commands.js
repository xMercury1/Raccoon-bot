const { REST, Routes } = require('discord.js');
require('dotenv').config(); // Cargar variables de entorno

const commands = [
    {
        name: "ping",
        description: "Responde con Pong!",
    },
    {
        name: "play",
        description: "Reproduce música en un canal de voz",
        options: [
            {
                name: "query",
                type: 3, // STRING
                description: "La canción que deseas reproducir",
                required: true
            }
        ]
    }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
    try {
        console.log("🔄 Registrando comandos de aplicación globales...");

        // 🚀 Registra los comandos globalmente
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("✅ Comandos registrados globalmente.");
    } catch (error) {
        console.error("❌ Error registrando comandos:", error);
    }
})();
