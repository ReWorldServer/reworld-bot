const logger = require("../logger");
const {SlashCommandBuilder, MessageFlagsBitField} = require("discord.js");
module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Elimina mensajes recientes")
        .addIntegerOption(opt =>
            opt.setName("cantidad")
                .setDescription("Cantidad de mensajes a borrar")
                .setRequired(true)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger("cantidad");
        if (amount <= 0) {
            return interaction.reply({ content: "Por favor, ingresa un número mayor o igual que 0", flags: MessageFlagsBitField.Flags.Ephemeral });
        }
        try {
            const messages = await interaction.channel.messages.fetch({ limit: amount });
            await interaction.channel.bulkDelete(messages);
            await interaction.deferReply({  flags: MessageFlagsBitField.Flags.Ephemeral });
            await interaction.deleteReply();
            logger.command("/clear", interaction, "OK");
        } catch (err){
            logger.error(err);
            logger.command("/clear", interaction, "FAIL");
        }
    }
}