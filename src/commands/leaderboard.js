const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {getLeaderboard} = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("Obtén el top 10 usuarios del servidor"),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle(`🏆 Top 10 usuarios de ${interaction.guild.name}`)
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})


        try {
            const leaderboard = getLeaderboard.all(interaction.guild.id)
            let message = ""
            if (!leaderboard || leaderboard.length === 0) {
                message = "🏆 **No hay datos aún!** Chatea para aparecer 🎉"
            }
            else {
                message = (await Promise.all(leaderboard.map(async (row, i) => {
                        const user = await interaction.client.users.fetch(row.userID);
                        const emojis = ['🥇','🥈','🥉','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟']

                        return `${emojis[i]} | ${user.tag} - Nivel: ${row.level} - XP: ${row.xp}`
                    }
                ))).join('\n')
            }
            embed.setDescription(message);
            await interaction.reply({embeds: [embed]});
            logger.command(`/leaderboard`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/leaderboard`, interaction, "FAIL");
            errorEmbed.setDescription("Hubo un error al obtener el top 10 usuarios");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}