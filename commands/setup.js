const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { setMusicChannel } = require("../database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("Configura un canal para los comandos de música.")
        .addChannelOption(option =>
            option.setName("canal")
                .setDescription("Selecciona el canal de música.")
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const canal = interaction.options.getChannel("canal");

        if (!canal.isTextBased()) {
            return interaction.reply({ content: "❌ Debes seleccionar un canal de texto.", ephemeral: true });
        }

        // 🔹 Guardar en PostgreSQL
        await setMusicChannel(interaction.guild.id, canal.id);

        interaction.reply(`✅ El canal de música ha sido establecido en <#${canal.id}> y se guardará permanentemente.`);
    }
};
