const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("Crea una encuesta con opciones de votación y tiempo límite")
        .addStringOption(option =>
            option.setName("pregunta")
                .setDescription("La pregunta de la encuesta")
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName("opciones")
                .setDescription("Las opciones separadas por comas (ej: Sí,No,Tal vez)")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("duracion")
                .setDescription("Duración en minutos")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply(); // Evita que la interacción expire

        const pregunta = interaction.options.getString("pregunta");
        const opciones = interaction.options.getString("opciones").split(",");
        const duracion = interaction.options.getInteger("duracion") * 60000; // Convertir minutos a milisegundos

        if (opciones.length < 2 || opciones.length > 10) {
            return interaction.editReply({ content: "❌ Debes proporcionar entre 2 y 10 opciones.", flags: 64});
        }

        const emojis = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

        const embed = new EmbedBuilder()
            .setTitle("📊 Encuesta")
            .setDescription(`**${pregunta}**\n\n${opciones.map((op, i) => `${emojis[i]} ${op}`).join("\n")}`)
            .setColor("Random")
            .setFooter({ text: `Encuesta creada por ${interaction.user.tag}. Finaliza en ${interaction.options.getInteger("duracion")} minutos.` });

        const pollMessage = await interaction.editReply({ embeds: [embed] }); // Editar la respuesta para obtener un mensaje válido

        // Añadir reacciones para la votación
        for (let i = 0; i < opciones.length; i++) {
            await pollMessage.react(emojis[i]).catch(console.error);
        }

        // Evitar que los usuarios voten más de una vez
        const filter = (reaction, user) => !user.bot;
        const collector = pollMessage.createReactionCollector({ filter, time: duracion });

        collector.on("collect", async (reaction, user) => {
            const userReactions = pollMessage.reactions.cache.filter(r => r.users.cache.has(user.id));
            if (userReactions.size > 1) {
                userReactions.forEach(async (r) => {
                    if (r.emoji.name !== reaction.emoji.name) {
                        await r.users.remove(user.id);
                    }
                });
            }
        });

        // Finalizar la encuesta después del tiempo configurado
        setTimeout(async () => {
            const updatedMessage = await interaction.channel.messages.fetch(pollMessage.id);
            const reactionCounts = opciones.map((_, i) => updatedMessage.reactions.cache.get(emojis[i])?.count || 0);

            const maxVotes = Math.max(...reactionCounts);
            const winners = opciones.filter((_, i) => reactionCounts[i] === maxVotes);

            const resultEmbed = new EmbedBuilder()
                .setTitle("📊 Resultado de la Encuesta")
                .setDescription(`**${pregunta}**\n\n🗳️ **Ganador:** ${winners.join(", ")} con **${maxVotes - 1} votos**.\n\n📢 ¡Gracias por participar!`)
                .setColor("Green");

            interaction.followUp({ embeds: [resultEmbed] });
        }, duracion);
    }
};
