// Obtener duración en minutos desde parámetros del comando
const duracion = interaction.options.getInteger('duracion') || 1; // default 1 min si no viene

const duracionMs = duracion * 60 * 1000; // convertir a milisegundos

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
