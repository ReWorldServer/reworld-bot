const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Banea a un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario a banear")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("razón")
                .setDescription("Razón del baneo")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");
        const reason = interaction.options.getString("razón");

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("🛑 Usuario baneado")
            .setDescription(`${member.user.username} ha sido baneado del servidor`)
            .addFields(
                {name: "Razón", value: reason, inline: true},
                {name: "Baneado por", value: interaction.user.username, inline: true}
            )
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!member.bannable){
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo banear al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.member || !interaction.member.permissions.has("BAN_MEMBERS")){
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para banear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.guild.members.me || !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)){
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("El bot no tiene permisos para banear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        try {
            await member.ban({reason: reason});
            await interaction.reply({embeds: [embed]});
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/ban ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo banear al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}