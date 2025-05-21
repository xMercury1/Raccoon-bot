const { EmbedBuilder } = require('discord.js');

module.exports = {
  data: {
    name: 'poll',
    description: 'Crea una encuesta rápida',
    options: [
      {
        name: 'pregunta',
        description: 'La pregunta de la encuesta',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'opciones',
        description: 'Opciones separadas por coma',
        type: 3, // STRING
        required: true,
      },
      {
        name: 'duracion',
        description: 'Duración en minutos (default 1)',
        type: 4, // INTEGER
        required: false,
      },
    ],
  },

  async execute(interaction) {
    const duracion = interaction.options.getInteger('duracion') || 1; // min
    const duracionMs = duracion * 60 * 1000; // pasar a milisegundos

    const pregunta = interaction.options.getString('pregunta');
    const opcionesRaw = interaction.options.getString('opciones');

    // Separo las opciones y corto a máximo 10 para no tener problema con emojis
    const opciones = opcionesRaw.split(',').map(op => op.trim()).slice(0, 10);

    const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

    let description = opciones
      .map((opcion, i) => `${emojis[i]} ${opcion}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle(`📊 Encuesta: ${pregunta}`)
      .setDescription(description)
      .setColor('Blue');

    const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });

    // Reacciona con los emojis para que la gente vote
    for (let i = 0; i < opciones.length; i++) {
      await pollMessage.react(emojis[i]);
    }

    // Espera la duración de la encuesta para mostrar resultados
    setTimeout(async () => {
      const updatedMessage = await interaction.channel.messages.fetch(pollMessage.id);

      const reactionCounts = [];

      for (let i = 0; i < opciones.length; i++) {
        const reaction = updatedMessage.reactions.cache.get(emojis[i]);
        if (reaction) {
          await reaction.users.fetch();
          const count = reaction.count - (reaction.users.cache.has(interaction.client.user.id) ? 1 : 0);
          reactionCounts.push(count);
        } else {
          reactionCounts.push(0);
        }
      }

      const maxVotes = Math.max(...reactionCounts);

      if (maxVotes === 0) {
        const noVotesEmbed = new EmbedBuilder()
          .setTitle("📊 Resultado de la Encuesta")
          .setDescription(`**${pregunta}**\n\n🕊️ No hubo votos. ¡Más suerte la próxima!`)
          .setColor("Grey");

        return interaction.followUp({ embeds: [noVotesEmbed] });
      }

      const winners = opciones.filter((_, i) => reactionCounts[i] === maxVotes);

      const resultEmbed = new EmbedBuilder()
        .setTitle("📊 Resultado de la Encuesta")
        .setDescription(`**${pregunta}**\n\n🗳️ **Ganador:** ${winners.join(", ")} con **${maxVotes} voto(s)**.\n\n📢 ¡Gracias por participar!`)
        .setColor("Green");

      interaction.followUp({ embeds: [resultEmbed] });
    }, duracionMs);
  },
};
