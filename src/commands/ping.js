const logger = require("../logger");
const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Obtiene el tiempo de respuesta del servidor"),
    async execute(interaction) {
        const start = performance.now();

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Pong!")
            .setDescription("Tiempo de respuesta: ???")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        await interaction.reply({embeds: [embed]});
        const end = performance.now();
        const ping = Math.round(end - start);
        embed.setDescription(`Tiempo de respuesta: ${ping}ms`);
        await interaction.editReply({embeds: [embed]});
        logger.command("/ping", interaction, "OK");
    }
}