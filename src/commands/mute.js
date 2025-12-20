const logger = require("../logger");
const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, MessageFlagsBitField} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("mute")
        .setDescription("Silencia a un usuario")
        .addUserOption(opt =>
            opt.setName("usuario")
                .setDescription("Usuario a silenciar")
                .setRequired(true)
        )
        .addStringOption(opt =>
            opt.setName("tiempo")
                .setDescription("Tiempo de silencio en minutos")
                .setRequired(false)
        ),
    async execute(interaction) {
        const member = interaction.options.getMember("usuario");
        const time = interaction.options.getString("tiempo") ?? "30";

        const embed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("⚠️ Usuario silenciado")
            .setDescription(`${member.user.username} ha sido silenciado`)
            .addFields(
                {name: "Duración", value: time, inline: true},
                {name: "Silenciado por", value: interaction.user.username, inline: true}
            )
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})

        const errorEmbed = new EmbedBuilder()
            .setColor("#FED766")
            .setTitle("Error")
            .setFooter({text: "ReWorldBot", iconURL: interaction.client.user.displayAvatarURL()})


        if(isNaN(parseInt(time))) {
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "FAIL");
            return interaction.reply({content: "Error: El tiempo en minutos debe ser un número entero", flags: MessageFlagsBitField.Flags.Ephemeral});
        }
        if(!member){
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "FAIL");
            errorEmbed.setDescription("No se encontró al usuario");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.member || !interaction.member.permissions.has(PermissionsBitField.Flags.MuteMembers)){
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "FAIL");
            errorEmbed.setDescription("No tienes permisos para silenciar miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }
        if(!interaction.guild.members.me || !interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.MuteMembers)){
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "FAIL");
            errorEmbed.setDescription("El bot no tiene permisos para silenciar miembros");
            return interaction.reply({embeds: [errorEmbed]});
        }

        let muteRole = interaction.guild.roles.cache.find(role => role.name === "Silenciado");
        if (!muteRole) {
            try {
                muteRole = await interaction.guild.roles.create({
                    name: "Silenciado",
                    color: "#3e3e3e",
                    permissions: []
                });
                interaction.guild.channels.cache.each(async (channel) => {
                    await channel.permissionOverwrites.edit(muteRole, {
                        [PermissionsBitField.Flags.SendMessages]: false,
                        [PermissionsBitField.Flags.Speak]: false
                    });
                });
            } catch (err) {
                errorEmbed.setDescription("No se pudo crear el rol 'Silenciado'.");
                logger.error(err);
                return interaction.reply({ embeds: [errorEmbed] });
            }
        }

        try {
            await member.roles.add(muteRole);
            await interaction.reply({embeds: [embed]});
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "OK");

            const muteDuration = parseInt(time) * 60 * 1000;
            if (muteDuration > 0) {
                setTimeout(async () => {
                    await member.roles.remove(muteRole);
                }, muteDuration);
            }

        } catch (error) {
            logger.error(error);
            logger.command(`/mute ${member.user.username} ${time}`, interaction, "FAIL");
            errorEmbed.setDescription("Hubo un error al silenciar al usuario");
            await interaction.reply({embeds: [errorEmbed]});
        }
    }
}