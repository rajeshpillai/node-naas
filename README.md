# Notification as a Service (NaaS)

Notification as a Service (NaaS) is a lightweight service that allows any application to subscribe to channels, send updates, and receive real-time notifications. The service is built using `uWebSockets.js` for WebSocket communication and can handle various types of data being passed between the server and clients.

## Features

- **Subscribe**: Clients can subscribe to specific channels to receive notifications.
- **Notify**: Send notifications to all subscribers of a particular channel.
- **Real-Time Updates**: Clients receive updates in real-time as soon as they are broadcasted to a channel.
- **Custom Data Handling**: Any type of data can be passed and received as part of notifications.

## Project Structure

```bash
.
├── server.js                # Express server for the Todo app
├── notification-server.js   # WebSocket server for NaaS
├── public
│   ├── index.html           # Frontend for the Todo app
│   └── styles.css           # Styles for the Todo app
└── README.md                # Project documentation

