const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("avatar")
        .setDescription("Muestra la foto de perfil de un usuario")
        .addUserOption(option =>
            option
                .setName("usuario")
                .setDescription("Usuario cuyo avatar mostrar (opcional)")
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("usuario") ?? interaction.user;

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle(`🖼️ Avatar de ${targetUser.username}`)
            .setImage(targetUser.displayAvatarURL({
                size: 512,
                dynamic: true
            }))
            .setFooter({
                text: "ReWorldBot",
                iconURL: interaction.client.user.displayAvatarURL()
            });

        await interaction.reply({ embeds: [embed] });
    }
};
