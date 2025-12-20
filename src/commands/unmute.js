const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("unmute")
        .setDescription("Elimina el estado Silenciado a un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario a desmutear")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("✅ Usuario desmuteado")
            .setDescription(`${member.user.username} ha sido desmuteado`)
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/unmute ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)){
            logger.command(`/unmute ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para desmutear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.guild.members.me || !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ModerateMembers)){
            logger.command(`/unmute ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("El bot no tiene permisos para desmutear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }

        let muteRole = interaction.guild.roles.cache.find(role => role.name === "Silenciado");
        if (!muteRole) {
            errorEmbed.setDescription("El rol 'Silenciado' no existe");
            logger.command(`/unmute ${member.user.username}`, interaction, "FAIL");
            return interaction.reply({ embeds: [errorEmbed] });
        }

        try {
            await member.roles.remove(muteRole);
            await interaction.reply({embeds: [embed]});
            logger.command(`/unmute ${member.user.username}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/unmute ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("Hubo un error al desmutear al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}