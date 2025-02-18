const { Manager } = require("erela.js");

class LavalinkPlayer {
    constructor(client) {
        this.client = client;
        this.manager = new Manager({
            nodes: [
                {
                    "identifier": "AjieDev - Lavalink [Non SSL]",
                    "password": "https://dsc.gg/ajidevserver",
                    "host": "lava-v3.ajieblogs.eu.org",
                    "port": 80,
                    "secure": false
                  }
            ],
            send(id, payload) {
                const guild = client.guilds.cache.get(id);
                if (guild) guild.shard.send(payload);
            }
        });

        this.manager.on("nodeConnect", node => console.log(`✅ Conectado a Lavalink: ${node.options.identifier}`));
        this.manager.on("nodeError", (node, error) => console.error(`❌ Error en ${node.options.identifier}:`, error));

        client.on("raw", d => this.manager.updateVoiceState(d));
    }

    connect() {
        this.manager.init(this.client.user.id);
    }
}

module.exports = LavalinkPlayer;
