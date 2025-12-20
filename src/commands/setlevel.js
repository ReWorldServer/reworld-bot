const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {getUser, setUser} = require("../database");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("setlevel")
        .setDescription("Cambia el nivel de un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario del que solicita el nivel")
                .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName("nivel")
                .setDescription("Nivel nuevo del usuario")
                .setRequired(true)
        )
    ,
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");
        const level = interaction.options.getInteger("nivel")

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle(member.user.username)
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        if(!member){
            logger.command(`/setlevel ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(level < 0){
            logger.command(`/setlevel ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("El nivel debe ser mayor que 0");
            return interaction.reply({embeds: [errorEmbed]});
        }

        try {
            const dbUser = await getUser.get(member.id, interaction.guild.id) ??
                {userID: member.id, guildID: interaction.guild.id, xp: 0, level: 0, warnings: 0};


            await setUser.run(member.id, interaction.guild.id, 100 * (level - 1)*(level - 1)  , level, dbUser.warnings);
            embed.setDescription(`Su nivel ahora es ${level}`);
            await interaction.reply({embeds: [embed]});
            logger.command(`/setlevel ${member.user.username}`, interaction, "OK");
        } catch (error) {
            logger.error(error);
            logger.command(`/setlevel ${member.user.username}`, interaction, "FAIL");
            errorEmbed.setDescription("Hubo un error al establecer el nivel del usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}