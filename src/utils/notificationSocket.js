import { Client } from "@stomp/stompjs";
import { WS_URL } from "./mediaUrl";

const EVENT_REALTIME = "mc-notification-realtime";
const EVENT_CHANGED = "mc-notifications-changed";

let stompClient = null;
let subscribedUserId = null;

/**
 * Démarre (ou réutilise) la connexion STOMP pour les notifications temps réel.
 */
export function startNotificationSocket(userId) {
  if (!userId) return;

  const token = localStorage.getItem("token");
  if (!token) return;

  if (stompClient?.active && subscribedUserId === userId) {
    return;
  }

  stopNotificationSocket();

  subscribedUserId = userId;
  stompClient = new Client({
    brokerURL: `${WS_URL}?token=${encodeURIComponent(token)}`,
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      stompClient.subscribe(`/topic/notifications/${userId}`, (frame) => {
        try {
          const notification = JSON.parse(frame.body);
          window.dispatchEvent(
            new CustomEvent(EVENT_REALTIME, { detail: notification })
          );
          window.dispatchEvent(new Event(EVENT_CHANGED));
        } catch (error) {
          console.error(error);
        }
      });
    },
  });

  stompClient.activate();
}

export function stopNotificationSocket() {
  if (stompClient) {
    try {
      stompClient.deactivate();
    } catch {
      // ignore
    }
  }
  stompClient = null;
  subscribedUserId = null;
}

export function notifyNavbarRefresh() {
  window.dispatchEvent(new Event(EVENT_CHANGED));
}

export { EVENT_REALTIME, EVENT_CHANGED };
