import { io } from "socket.io-client";
import { getAuthSession } from "./authApi";

const authSession = getAuthSession();

const socket = io("http://localhost:5000", {
    auth: {
        token: authSession?.accessToken,
    },
});

export default socket;