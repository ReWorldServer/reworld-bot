const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("hi")
        .setDescription("¡Saluda a todo el mundo en el chat!"),
    async execute(interaction) {

        const messages = [
            `¡Hola!¡${interaction.member.user.username} ha saludado a todo el mundo!`,
            `¡Ha llegado ${interaction.member.user.username} al chat!`,
            `¡${interaction.member.user.username} os desea un gran día!`,
            `¡Atención todos, ${interaction.member.user.username} acaba de entrar al chat!`,
        ];

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle(messages[Math.floor(Math.random() * messages.length)])
            .setFooter({
                text: "ReWorldBot",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
};
