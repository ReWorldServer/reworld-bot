const WebSocket = require("ws");
const logger = require("./logger");
//const config = require("./config.json");

let hytaleSocket = null;

function startWebSocket(onHytaleMessage) {
    const wss = new WebSocket.Server({ port: process.env.WEBSOCKET_PORT });

    console.log(`[WS] Servidor WebSocket en puerto ${process.env.WEBSOCKET_PORT}`);

    wss.on("connection", (ws) => {
        logger.info("[WS] Hytale conectado");
        hytaleSocket = ws;

        ws.on("message", (data) => {
            try {
                const payload = JSON.parse(data);

                //if (payload.token !== config.secret) return;

                if (payload.source === "hytale") {
                    onHytaleMessage(payload);
                }
            } catch (err) {
                logger.error("[WS] JSON inválido", err);
            }
        });

        ws.on("close", () => {
            logger.info("[WS] Hytale desconectado");
            hytaleSocket = null;
        });
    });
}

function sendToHytale(data) {
    if (!hytaleSocket || hytaleSocket.readyState !== WebSocket.OPEN) return;
    hytaleSocket.send(JSON.stringify(data));
}

module.exports = {
    startWebSocket,
    sendToHytale
};
