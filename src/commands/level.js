const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {getUser} = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("level")
        .setDescription("Obtén el nivel de un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario del que solicita el nivel")
                .setRequired(false)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario") ?? interaction.member;

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle(member.user.username)
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/level ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        try {
            const dbUser = await getUser.get(member.id, interaction.guild.id) ??
                                                {userID: member.id, guildID: interaction.guild.id, xp: 0, level: 0};
            embed.addFields({
                name: "XP",
                value: `${dbUser.xp}`,
            },{
                name: "Nivel",
                value: `${dbUser.level}`,
            })
            await interaction.reply({embeds: [embed]});
            logger.command(`/level ${member.user.username}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/level ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("Hubo un error al obtener el nivel del usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}