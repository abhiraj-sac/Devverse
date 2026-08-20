import { io } from "socket.io-client";

const authSession = JSON.parse(
    localStorage.getItem("devhub_auth") || "null"
);

const socket = io(
    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
    {
        auth: {
            token: authSession?.accessToken,
        },
    }
);

export default socket;