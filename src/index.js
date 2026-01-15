const Discord = require("discord.js");
const logger = require("./logger.js");
const client = new Discord.Client({ intents: ["Guilds", "GuildMessages", "MessageContent", "GuildMembers"] });
const {getUser, setUser} = require("./database");
const {startWebSocket, sendToHytale} = require("./hytale_sync");
require("dotenv").config();

client.on("clientReady", () => {
    logger.info(`Bot conectado como ${client.user.tag}`);
});

const xpCooldowns = new Map();
const LEVEL_ROLES = {
    5: "1440682493924610118",
    10: "1440682625177092177",
    15: "1440682774116827136",
    20: "1440682843939278858",
    25: "1440682917750767797",
    30: "1440683449261232161",
    35: "1440683528474853456",
    40: "1440683671798677586",
    45: "1440683738139725834",
    50: "1440683883468427335"
};
client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;

    const userID = message.author.id;
    const guildID = message.guild.id;
    const now = Date.now();
    const cooldownMilliseconds = 60000;

    const lastXpTime = xpCooldowns.get(userID);
    if (lastXpTime && (now - lastXpTime) < cooldownMilliseconds) {
        return;
    }
    let user = getUser.get(userID, guildID) ?? {userID, guildID, xp: 0, level: 0};
    xpCooldowns.set(userID, now);

    setTimeout(() => {
        xpCooldowns.delete(userID);
    }, cooldownMilliseconds);

    user.xp += Math.floor(Math.random() * 11) + 5;
    logger.info(`${message.author.tag} ahora tiene ${user.xp} xp`);
    const newLevel = Math.floor(Math.sqrt(user.xp / 100) + 1);
    if (newLevel > user.level){
        user.level = newLevel;
        const levelsChannel = client.channels.cache.get(process.env.LEVEL_CHANNEL);
        if (levelsChannel) {
            await levelsChannel.send(`〔🌍〕${message.author} ha subido al nivel **${newLevel}**. Enhorabuena!`);
        }
        logger.info(`${message.author.tag} ha subido al nivel ${user.level}`);
    }
    setUser.run(userID, guildID, user.xp, user.level, user.warnings);

    const member = message.guild.members.cache.get(userID);
    if (member) {
        if (LEVEL_ROLES[newLevel]) {
            try {
                await member.roles.add(LEVEL_ROLES[newLevel]);
                for (let i = 5; i < newLevel; i += 5) {
                    if (LEVEL_ROLES[i] && LEVEL_ROLES[i] !== LEVEL_ROLES[newLevel]) {
                        try {
                            await member.roles.remove(LEVEL_ROLES[i]);
                        } catch (error) {}
                    }
                }
                logger.info(`✅ Rol nivel ${newLevel} asignado a ${message.author.tag}`);
            } catch (error) {
                logger.error(`Error asignando rol nivel ${newLevel}:`, error);
            }

        }
    }

    sendToHytale({
        source: "discord",
        author: message.author.username,
        message: message.content,
    });
});

const MEMBER_ROLE_ID = process.env.MEMBER_ROLE;

client.on("guildMemberAdd", async (member) => {
    try {
        const welcomeChannel = client.channels.cache.get(process.env.WELCOME_CHANNEL);
        if(welcomeChannel) {
            await welcomeChannel.send(`¡Bienvenido a ReWorld, ${member.user.username}, te esperan aventuras fascinantes! 🌍⚔️`);
        }

        await member.roles.add(MEMBER_ROLE_ID);
    } catch (error) {
        logger.error(error);
    }
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = require(`./commands/${interaction.commandName}.js`);
    if (!command || !command.data || !command.data.name){
        logger.error(`Comando desconocido: ${command.data.name}`);
        return;
    }
    try {
        await command.execute(interaction);
    } catch (error) {
        logger.error(error);
        await interaction.reply({content: "Error", flags: "ephemeral"})
    }
})

client.login(process.env.TOKEN);
startWebSocket()