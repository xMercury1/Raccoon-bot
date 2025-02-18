const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");
const path = require("path");
const LavalinkPlayer = require("./lavalink");
require("dotenv").config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,  // Necesario para detectar mensajes
        GatewayIntentBits.GuildVoiceStates
    ]
});

// 🔹 Inicializar Lavalink antes de cargar comandos
client.lavalink = new LavalinkPlayer(client);
client.commands = new Collection();

// 🔹 Cargar comandos automáticamente
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    if (!command.data || !command.data.name) {
        console.warn(`⚠️  El comando en ${file} no tiene un nombre definido.`);
        continue;
    }
    client.commands.set(command.data.name, command);
}

// 🔹 Evento 'ready'
client.once("ready", async () => {
    console.log(`✅ Conectado como ${client.user.tag}`);
    client.lavalink.connect();  // 🔹 Iniciar conexión con Lavalink


    

    // Registrar los slash commands globalmente
    const commands = client.commands.map(cmd => cmd.data.toJSON());
    await client.application.commands.set(commands);
    console.log("✅ Slash commands registrados.");
});



// 🔹 Manejar interacciones
client.on("interactionCreate", async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction, client);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: "❌ Hubo un error ejecutando este comando.", ephemeral: true });
    }
});

client.login(process.env.TOKEN);
