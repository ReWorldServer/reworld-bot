const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("unban")
        .setDescription("Elimina el ban a un usuario")
        .addStringOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario al que quitar el ban")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getUser("usuario");

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("✅ Usuario desbaneado")
            .setDescription(`${member.tag} deja de estar baneado del servidor`)
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/unban ${member.tag}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }

        if(!interaction.member || !interaction.member.permissions.has("BAN_MEMBERS")){
            logger.command(`/unban ${member.tag}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para desbanear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.guild.members.me || !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.BanMembers)){
            logger.command(`/unban ${member.tag}`, interaction, "FAIL");
            errorEmbed.setDescription("El bot no tiene permisos para desbanear miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        try {
            await interaction.guild.bans.remove(member.tag);
            await interaction.reply({embeds: [embed]});
            logger.command(`/unban ${member.tag}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/unban ${member.tag}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo desbanear al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}