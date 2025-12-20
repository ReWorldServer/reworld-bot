const db  = require("better-sqlite3")("database.db");

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        userID TEXT,
        guildID TEXT,
        xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 0,
        warnings INTEGER DEFAULT 0,
        PRIMARY KEY (userID, guildID)
    );
`)

const getUser = db.prepare(`
    SELECT * FROM users WHERE userID = ? AND guildID = ?
`);

const setUser = db.prepare(`
    INSERT OR REPLACE INTO users (userID, guildID, xp, level, warnings) VALUES (?, ?, ?, ?, ?)
`);


const getLeaderboard = db.prepare(`
    SELECT userID, xp, level FROM users 
    WHERE guildID = ? 
    ORDER BY xp DESC 
    LIMIT 10
`);

module.exports = { getUser, setUser, getLeaderboard };