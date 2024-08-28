import express from "express";
import path from "path";

import { fileURLToPath } from 'url';
import WebSocket from 'ws';
const PORT = 4000;

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());


// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// WebSocket client to communicate with the WebSocket server
const ws = new WebSocket('ws://localhost:3000');

ws.on('open', function open() {
    console.log('Connected to WebSocket server');
});

ws.on('error', function error(err) {
    console.error('WebSocket error:', err);
});

app.post('/add-todo', (req, res) => {
    const todo = req.body.todo;
    console.log("About to save a todo...");
    
    // Notify WebSocket server when the client is open
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
            action: 'notify',
            channel: 'todos',
            content: { 
                title: todo,
                completed: false
            }
        }));
        
    } else {
        console.error('WebSocket is not open, unable to send message');
    }

    res.status(200).send('Todo added');
});

app.listen(PORT, () => {
    console.log(`Todo app running on http://localhost:${PORT}`);
});

