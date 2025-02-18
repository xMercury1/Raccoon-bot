const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("giveaway")
        .setDescription("Inicia un sorteo")
        .addStringOption(option =>
            option.setName("premio")
                .setDescription("El premio del sorteo")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("duracion")
                .setDescription("Duración en minutos")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply(); // Evita el error de doble respuesta

        const premio = interaction.options.getString("premio");
        const duracion = interaction.options.getInteger("duracion") * 60000; // Convertir a milisegundos
        const embed = new EmbedBuilder()
            .setTitle("🎉 ¡Sorteo en curso!")
            .setDescription(`🎁 **Premio:** ${premio}\n⏳ **Duración:** ${interaction.options.getInteger("duracion")} minutos\n\n🎟️ Reacciona con 🎉 para participar.`)
            .setColor("Gold")
            .setFooter({ text: `Sorteo iniciado por ${interaction.user.tag}` });

        const giveawayMessage = await interaction.editReply({ embeds: [embed] }); // Editar la respuesta con el embed

        await giveawayMessage.react("🎉").catch(console.error); // Asegurar que pueda reaccionar

        setTimeout(async () => {
            const updatedMessage = await interaction.channel.messages.fetch(giveawayMessage.id);
            const reactions = updatedMessage.reactions.cache.get("🎉");

            if (!reactions || reactions.count <= 1) {
                return interaction.followUp("❌ No hubo suficientes participantes en el sorteo.");
            }

            const users = await reactions.users.fetch();
            const participants = users.filter(user => !user.bot).map(user => user.id);

            if (participants.length === 0) {
                return interaction.followUp("❌ No hubo suficientes participantes.");
            }

            const ganador = participants[Math.floor(Math.random() * participants.length)];
            interaction.followUp(`🎉 ¡Felicidades <@${ganador}>! Has ganado **${premio}**.`);
        }, duracion);
    }
};
