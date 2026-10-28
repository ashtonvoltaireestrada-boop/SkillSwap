import { io } from "socket.io-client";
import { API_BASE_URL } from "@/config";

// Strips '/api' so it connects directly to the root WebSocket server on Render
const SOCKET_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  transports: ["websocket", "polling"],
  extraHeaders: {
    "bypass-tunnel-reminder": "true",
  },
});