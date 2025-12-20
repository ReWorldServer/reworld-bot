const logger = require("../logger");
const {SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("kick")
        .setDescription("Expulsa a un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario a expulsar")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("razón")
                .setDescription("Razón de la expulsión")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");
        const reason = interaction.options.getString("razón");

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("🛑 Usuario expulsado")
            .setDescription(`${member.user.username} ha sido expulsado del servidor`)
            .addFields(
                {name: "Razón", value: reason, inline: true},
                      {name: "Expulsado por", value: interaction.user.username, inline: true}
            )
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})


        if(!member){
            logger.command(`/kick ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!member.kickable){
            logger.command(`/kick ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo expulsar al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)){
            logger.command(`/kick ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para expulsar miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        try {
            await member.kick(reason);
            await interaction.reply({embeds: [embed]});
            logger.command(`/kick ${member.user.username} ${reason}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/kick ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo expulsar al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}