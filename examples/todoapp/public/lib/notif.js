class NotificationManager {
  constructor(apiKey, socket) {
    this.apiKey = apiKey;
    this.ws = socket;
    this.notificationContainer = document.getElementById('notification-container');
    this.notificationList = document.getElementById('notification-list');

    this.ws.addEventListener('open', () => {
      console.log('Connected to WebSocket server');
      this.fetchUnreadNotifications();
    });

    this.ws.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      console.log("ws:message:data", data);
      if (data.unreadNotifications) {
        console.log("Rendering unread notifs");
        this.renderNotifications(data.unreadNotifications);
      } else {
        console.log("Adding new notif:", data);
        this.addNotification(data);
      }
    });
  }

  fetchUnreadNotifications() {
    this.ws.send(JSON.stringify({
      action: 'getUnread',
      api_key: this.apiKey,
    }));
  }

  addNotification(notification) {
    const notificationItem = this.createNotificationElement(notification);
    this.notificationList.appendChild(notificationItem);
  }

  renderNotifications(notifications) {
    this.notificationList.innerHTML = ''; // Clear the list first
    notifications.forEach((notification) => {
      const notificationItem = this.createNotificationElement(notification);
      this.notificationList.appendChild(notificationItem);
    });
  }

  createNotificationElement(notification) {
    const notificationItem = document.createElement('div');
    notificationItem.className = `notification-item ${notification.readStatus ? 'read' : 'unread'}`;

    // Handle JSON content
    let content;
    try {
      // Try to parse the content as JSON
      const parsedContent = JSON.parse(notification.content);
      content = this.formatJsonContent(parsedContent);
    } catch (e) {
      // If parsing fails, treat it as a plain string
      content = notification.content;
    }

    notificationItem.innerHTML = content;

    notificationItem.dataset.id = notification.id;

    notificationItem.addEventListener('click', () => {
      this.markAsRead(notification.id, notificationItem);
    });

    return notificationItem;
  }

  formatJsonContent(content) {
    // This function formats JSON content into a readable string or HTML
    let formattedContent = '';
    
    // Example: Let's assume content has title and message fields
    if (content.title) {
      formattedContent += `<strong>${content.title}</strong><br>`;
    }
    if (content.message) {
      formattedContent += `<p>${content.message}</p>`;
    }
    
    // Customize further based on your JSON structure
    return formattedContent;
  }

  markAsRead(notificationId, notificationItem) {
    this.ws.send(JSON.stringify({
      action: 'markRead',
      api_key: this.apiKey,
      notificationId: notificationId,
    }));

    // Update the UI immediately without altering the content
    notificationItem.classList.remove('unread');
    notificationItem.classList.add('read');
  }
}

