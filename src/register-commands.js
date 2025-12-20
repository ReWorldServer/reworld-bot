require('dotenv').config();
const logger = require("./logger");
const {REST, Routes} = require("discord.js");
const fs = require("fs");
const path = require("path");

const commands = []
const commandsPath = path.join(__dirname, "commands");
const commandsFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

for (const file of commandsFiles) {
    const command = require(path.join(commandsPath, file));
    commands.push(command.data.toJSON());
    logger.info(`Cargando ${file}...`);
}

const rest = new REST({version: "10"}).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            {body: commands}
        );
        logger.info("¡Comandos cargados con éxito!");
    }
    catch (err) {
        logger.error(err);
    }
})();