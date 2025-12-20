const winston = require("winston");
const { format } = require("winston");
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const customLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        command: 3,
        debug: 4
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        command: 'blue',
        debug: 'gray'
    }
};

const logger = winston.createLogger({
    levels: customLevels.levels,
    format: combine(
        timestamp(),
        myFormat
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/bot.log" })
    ]
});

logger.command = (command, interaction, status) => logger.info(`Command: ${command}, User: ${interaction.member.user.username}, Status: ${status}`);

module.exports = logger;
