const logger = require("../logger");
const {SlashCommandBuilder, EmbedBuilder, PermissionsBitField} = require("discord.js");
const {getUser, setUser} = require("../database");
const banCommand = require("./ban.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Advierte a un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario a advertir")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("razón")
                .setDescription("Razón de la advertencia")
                .setRequired(true)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");
        const reason = interaction.options.getString("razón");

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("⚠️ Usuario advertido")
            .setDescription(`${member.user.username} ha sido advertido`)
            .addFields(
                {name: "Razón", value: reason, inline: true},
            )
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/warn ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)){
            logger.command(`/warn ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para advertir miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        try {
            const user = getUser.get(member.user.id, interaction.guild.id) ??
                {userID: member.user.id, guildID: interaction.guild.id, xp: 0, level: 0}
            setUser.run(user.userID, user.guildID, user.xp, user.level, user.warnings + 1)
            if (user.warnings + 1 >= 3){
                await banCommand.execute(interaction);
            }
            else {
                await interaction.reply({embeds: [embed]});
                logger.command(`/warn ${member.user.username} ${reason}`, interaction, "OK");
            }
        } catch (error) {
            logger.error(error);
            logger.command(`/warn ${member.user.username} ${reason}`, interaction, "FAIL");
            errorEmbed.setDescription("No se pudo advertir al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}