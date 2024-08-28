# Notification as a Service (NaaS)

Notification as a Service (NaaS) is a lightweight service that allows any application to subscribe to channels, send updates, and receive real-time notifications. The service is built using `uWebSockets.js` for WebSocket communication and Prisma ORM with SQLite for data persistence.

## Features

- **Subscribe**: Clients can subscribe to specific channels to receive notifications.
- **Notify**: Send notifications to all subscribers of a particular channel.
- **Real-Time Updates**: Clients receive updates in real-time as soon as they are broadcasted to a channel.
- **Custom Data Handling**: Any type of data can be passed and received as part of notifications.
- **App Registration**: Only registered apps can use the NaaS, and usage is tracked for rate limiting and potential future billing.


# Start the notification server
```
npm run dev
```

# Start the todo app server
```javascript
npm run demo
```

# Enjoy
Open two browser window and enjoy your hard work :) 

