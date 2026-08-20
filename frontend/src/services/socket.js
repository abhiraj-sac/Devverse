import { io } from "socket.io-client";

const authSession = JSON.parse(
    localStorage.getItem("devhub_auth") || "null"
);

const SOCKET_URL =
    import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const socket = io(SOCKET_URL, {
    auth: {
        token: authSession?.accessToken,
    },
});

export default socket;