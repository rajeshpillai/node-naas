const fs = require('fs');
const uWS = require('uWebSockets.js');
const app = uWS.App();

const PORT = 3000;
const activeSockets = [];

// ROOM CODE -->
let channels = {};

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
    if (channels[channelName]) {
        for (let client of channels[channelName]) {
            client.send(message);
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
    message: (ws, message, isBinary) => {
        const data = JSON.parse(Buffer.from(message).toString());

        switch(data.action) {
            case 'subscribe':
                console.log(`Subscribing to channel ${data.channel}`);
                subscribe(ws, data.channel);
                ws.currentChannel = data.channel; // Store the current channel in the WebSocket object
                break;
            case 'unsubscribe':
                console.log(`Unsubscribing from channel ${data.channel}`);
                unsubscribe(ws, data.channel);
                delete ws.currentChannel;
                break;
            case 'update':
                if (ws.currentChannel) {
                    console.log(`Updating channel ${ws.currentChannel} with message: ${data.content}`);
                    broadcastToChannel(ws.currentChannel, data.content);
                }
                break;
            case 'notify':
                console.log(`Notifying clients in channel ${data.channel} with message: ${data.content}`);
                broadcastToChannel(data.channel, data.content);
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

