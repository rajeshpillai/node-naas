import fs from "fs";
import uWS from "uWebSockets.js";
import path from "path";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = uWS.App();

import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const activeSockets = [];

// ROOM CODE -->
let channels = {};

async function authenticate(apiKey) {
    const app = await prisma.App.findUnique({
        where: { apiKey },
    });
    return app;
}


function subscribe(ws, channelName) {
    if (!channels[channelName]) {
        channels[channelName] = [];
    }
    channels[channelName].push(ws);
}

function unsubscribe(ws, channelName) {
    if (channels[channelName]) {
        channels[channelName] = channels[channelName].filter(client => client !== ws);
        if (channels[channelName].length === 0) {
            delete channels[channelName];
        }
    }
}

function broadcastToChannel(channelName, message) {
    console.log("broadcast:", channels[channelName]);
    if (channels[channelName]) {
        for (let client of channels[channelName]) {
            console.log("Sending message: ", message);
            client.send(JSON.stringify(message));
        }
    }
}
// END ROOM <--

// Default route for http
app.get('/*', (res, req) => {
    const fileBuffer = fs.readFileSync(__dirname + '/index.html');
    res.writeHeader('Content-Type', 'text/html');
    res.end(fileBuffer);
});

// Default route for socket
app.ws('/*', {
    open: (ws) => {
        console.log('Client connected');
    },
    message: async (ws, message, isBinary) => {
        const data = JSON.parse(Buffer.from(message).toString());

        console.log("Message received: ", data);

        if (!data.api_key) {
            console.log("Unauthorized!!!");
            ws.send(JSON.stringify({ error: 'Unauthorized' }));
            ws.close();
            return;
        }
        // Authenticate the client
        const app = await authenticate(data.api_key);
        if (!app) {
            console.log("Unauthorized!!!");
            ws.send(JSON.stringify({ error: 'Unauthorized' }));
            ws.close();
            return;
        }
 
        // Check rate limits
        //  if (app.notifications >= app.rateLimit) {
        //      ws.send(JSON.stringify({ error: 'Rate limit exceeded' }));
        //      return;
        //  }

        switch(data.action) {
            case 'subscribe':
                console.log(`Subscribing to channel ${data.channel}`);
                if (!data.api_key) {
                    console.log("Unauthorized!!!");
                    ws.send(JSON.stringify({ error: 'Unauthorized' }));
                    ws.close();
                    return;
                }
                subscribe(ws, data.channel);
                ws.currentChannel = data.channel; // Store the current channel in the WebSocket object
                ws.appId = app.id;
                break;
            case 'unsubscribe':
                console.log(`Unsubscribing from channel ${data.channel}`);
                unsubscribe(ws, data.channel);
                delete ws.currentChannel;
                break;
            case 'update':
                console.log("UPDATE: (TODO: VERIFY)");
                if (ws.currentChannel) {
                    console.log(`Updating channel ${ws.currentChannel} with message: ${data.content}`);
                    broadcastToChannel(ws.currentChannel, data.content);
                }
                break;
            case 'notify':
                console.log("ws:notify:event:ws:cc<->data.currentChannel", ws.currentChannel, data.channel);
                if (data.channel) {
                    broadcastToChannel(data.channel, data.content);

                    // Log the notification
                    await prisma.notification.create({
                        data: {
                            appId: app.id,
                            channel: data.channel,
                            content: JSON.stringify(data.content),
                        },
                    });

                    // Increment notifications count
                    await prisma.app.update({
                        where: { id: app.id },
                        data: { notifications: app.notifications + 1 },
                    });
                }
                break;
            default:
                console.log('Unknown action');
        }
    },
    close: (ws) => {
        if (ws.currentChannel) {
            unsubscribe(ws, ws.currentChannel);
        }
        console.log('Client disconnected');
    }
}).listen(PORT, (token) => {
    if (token) {
        console.log(`Notification service started on port ${PORT}. Open multiple browser tabs to test the service!`);
    } else {
        console.log('Failed to start Notification service');
    }
});

