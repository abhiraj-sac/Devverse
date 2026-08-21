import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socket from "../services/socket";
import { getAuthSession } from "../services/authApi";

const DiscussionRoomPage = () => {
    const { discussionId } = useParams();

    const [messages, setMessages] = useState([]);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    const authSession = getAuthSession();

    const userId =
        authSession?.user?.userId ||
        authSession?.user?._id ||
        authSession?.user?.id ||
        authSession?.userId;

    const token = authSession?.accessToken;

    const currentUser =
        authSession?.user?.fullName ||
        authSession?.user?.username ||
        "You";

    const fetchMessages = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                `${import.meta.env.VITE_API_BASE_URL}/discussions/${discussionId}/messages`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch messages"
                );
            }

            setMessages(data.messages || []);
        } catch (error) {
            console.error("Fetch Messages Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!discussionId) return;

        fetchMessages();

        console.log("Joining discussion:", discussionId);

        socket.emit("joinDiscussion", discussionId);

        const handleNewMessage = (message) => {
            setMessages((prev) => [...prev, message]);
        };

        const handleMessageError = (error) => {
            console.error("Message Error:", error);
            setError(error.message || "Failed to send message");
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("messageError", handleMessageError);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messageError", handleMessageError);
        };
    }, [discussionId]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!content.trim()) return;

        if (!userId) {
            setError("User ID not found. Please login again.");
            return;
        }

        setSending(true);
        setError("");

        socket.emit("sendMessage", {
            discussionId,
            senderId: userId,
            content: content.trim(),
        });

        setContent("");
        setSending(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const getSenderName = (message) => {
        if (
            message.senderId?._id &&
            message.senderId._id === userId
        ) {
            return currentUser;
        }

        return (
            message.senderId?.fullName ||
            message.senderId?.username ||
            "Developer"
        );
    };

    const getInitial = (message) => {
        const name = getSenderName(message);
        return name.charAt(0).toUpperCase();
    };

    const isOwnMessage = (message) => {
        return (
            message.senderId?._id === userId ||
            message.senderId === userId
        );
    };

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[var(--bg-main)] text-[var(--text-main)]">

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">

                {/* ================= HEADER ================= */}
                <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-sm mb-5">

                    {/* subtle background glow */}
                    <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-[var(--accent)] opacity-[0.07] blur-3xl" />

                    <div className="relative px-6 py-5 flex items-center justify-between">

                        <div className="flex items-center gap-4">

                            <div className="w-12 h-12 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg">
                                <span className="material-symbols-outlined text-white text-[25px]">
                                    forum
                                </span>
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                        Discussion Room
                                    </h1>

                                    <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-green-500/10 text-green-600 border border-green-500/20">
                                        Live
                                    </span>
                                </div>

                                <p className="text-sm text-[var(--text-soft)] mt-1">
                                    Connect, discuss and build together
                                </p>
                            </div>

                        </div>

                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-main)] border border-[var(--border)]">

                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />

                            <span className="text-xs font-medium text-[var(--text-main)]">
                                Community
                            </span>

                        </div>

                    </div>

                    {/* Discussion ID */}
                    <div className="border-t border-[var(--border)] px-6 py-3 bg-[var(--bg-main)]/40">
                        <div className="flex items-center gap-2">

                            <span className="material-symbols-outlined text-[17px] text-[var(--text-soft)]">
                                tag
                            </span>

                            <span className="text-xs text-[var(--text-soft)]">
                                Room ID
                            </span>

                            <code className="text-xs font-mono text-[var(--text-main)] bg-[var(--bg-card)] border border-[var(--border)] px-2 py-1 rounded-md">
                                {discussionId}
                            </code>

                        </div>
                    </div>

                </div>

                {/* ================= ERROR ================= */}
                {error && (
                    <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-600">

                        <span className="material-symbols-outlined text-[20px]">
                            error
                        </span>

                        <span className="text-sm font-medium">
                            {error}
                        </span>

                    </div>
                )}

                {/* ================= CHAT ================= */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-sm">

                    {/* Chat heading */}
                    <div className="px-5 sm:px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">

                        <div>
                            <h2 className="font-semibold text-[var(--text-main)]">
                                Conversation
                            </h2>

                            <p className="text-xs text-[var(--text-soft)] mt-0.5">
                                {messages.length}{" "}
                                {messages.length === 1
                                    ? "message"
                                    : "messages"}
                            </p>
                        </div>

                        <span className="material-symbols-outlined text-[var(--text-soft)]">
                            more_horiz
                        </span>

                    </div>

                    {/* ================= MESSAGE AREA ================= */}
                    <div className="h-[500px] sm:h-[560px] overflow-y-auto px-4 sm:px-6 py-6 space-y-5">

                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center">

                                <div className="w-8 h-8 rounded-full border-2 border-[var(--border)] border-t-[var(--accent)] animate-spin" />

                                <p className="mt-4 text-sm font-medium text-[var(--text-soft)]">
                                    Loading conversation...
                                </p>

                            </div>
                        ) : messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center">

                                <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-4">

                                    <span className="material-symbols-outlined text-[30px] text-[var(--accent)]">
                                        chat
                                    </span>

                                </div>

                                <h3 className="text-lg font-semibold text-[var(--text-main)]">
                                    Start the conversation
                                </h3>

                                <p className="max-w-sm mt-2 text-sm leading-6 text-[var(--text-soft)]">
                                    Be the first one to share an idea,
                                    ask a question or start a discussion.
                                </p>

                            </div>
                        ) : (
                            messages.map((message, index) => {

                                const own = isOwnMessage(message);

                                return (
                                    <div
                                        key={
                                            message._id ||
                                            `${message.createdAt}-${index}`
                                        }
                                        className={`flex gap-3 ${
                                            own
                                                ? "justify-end"
                                                : "justify-start"
                                        }`}
                                    >

                                        {!own && (
                                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center">

                                                <span className="text-sm font-bold text-[var(--accent)]">
                                                    {getInitial(message)}
                                                </span>

                                            </div>
                                        )}

                                        <div
                                            className={`max-w-[80%] sm:max-w-[65%] ${
                                                own
                                                    ? "items-end"
                                                    : "items-start"
                                            } flex flex-col`}
                                        >

                                            <div className="flex items-center gap-2 mb-1.5">

                                                <span className="text-xs font-semibold text-[var(--text-main)]">
                                                    {getSenderName(message)}
                                                </span>

                                                <span className="text-[10px] text-[var(--text-soft)]">
                                                    {message.createdAt
                                                        ? new Date(
                                                              message.createdAt
                                                          ).toLocaleTimeString(
                                                              [],
                                                              {
                                                                  hour: "2-digit",
                                                                  minute: "2-digit",
                                                              }
                                                          )
                                                        : ""}
                                                </span>

                                            </div>

                                            <div
                                                className={`px-4 py-3 rounded-2xl text-sm leading-6 ${
                                                    own
                                                        ? "bg-[var(--accent)] text-white rounded-br-md shadow-sm"
                                                        : "bg-[var(--bg-main)] text-[var(--text-main)] border border-[var(--border)] rounded-bl-md"
                                                }`}
                                            >
                                                {message.content}
                                            </div>

                                        </div>

                                        {own && (
                                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[var(--accent)] flex items-center justify-center">

                                                <span className="text-sm font-bold text-white">
                                                    {getInitial(message)}
                                                </span>

                                            </div>
                                        )}

                                    </div>
                                );
                            })
                        )}

                    </div>

                    {/* ================= COMPOSER ================= */}
                    <div className="border-t border-[var(--border)] p-4 sm:p-5 bg-[var(--bg-main)]/30">

                        <form
                            onSubmit={handleSendMessage}
                            className="flex items-end gap-3"
                        >

                            <div className="flex-1 relative">

                                <textarea
                                    value={content}
                                    onChange={(e) =>
                                        setContent(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    rows={1}
                                    placeholder="Write something to the community..."
                                    className="w-full resize-none px-4 py-3.5 pr-12 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-main)] placeholder:text-[var(--text-soft)] outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/10 transition-all text-sm"
                                />

                                <span className="material-symbols-outlined absolute right-3 bottom-3.5 text-[19px] text-[var(--text-soft)] pointer-events-none">
                                    edit
                                </span>

                            </div>

                            <button
                                type="submit"
                                disabled={
                                    sending ||
                                    !content.trim()
                                }
                                className="flex-shrink-0 w-12 h-12 rounded-xl bg-[var(--accent)] text-white flex items-center justify-center shadow-md hover:brightness-95 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <span className="material-symbols-outlined text-[21px]">
                                    send
                                </span>
                            </button>

                        </form>

                        <div className="flex items-center justify-between mt-2 px-1">

                            <span className="text-[10px] text-[var(--text-soft)]">
                                Press Enter to send · Shift + Enter for new line
                            </span>

                            <span className="text-[10px] text-[var(--text-soft)]">
                                {content.length}/1000
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default DiscussionRoomPage;