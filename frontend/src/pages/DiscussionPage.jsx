

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthSession } from "../services/authApi";

const DiscussionPage = () => {
        console.log("🔥 DISCUSSION PAGE LOADED");
    const [discussions, setDiscussions] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");
    
    const navigate = useNavigate();
    const authSession = getAuthSession();
    const token = authSession?.accessToken;
    console.log("AUTH SESSION:", authSession);
console.log("TOKEN:", token);

    const fetchDiscussions = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await fetch(
                "/api/v1/discussions",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch discussions"
                );
            }

            setDiscussions(data.discussions || []);
        } catch (error) {
            console.error("Fetch Discussions Error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDiscussions();
    }, []);

    const handleCreateDiscussion = async (e) => {
        e.preventDefault();

        if (!title.trim()) {
            return;
        }

        try {
            setCreating(true);
            setError("");

            const response = await fetch(
                "/api/v1/discussions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        title: title.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to create discussion"
                );
            }

            setTitle("");

            await fetchDiscussions();
        } catch (error) {
            console.error("Create Discussion Error:", error);
            setError(error.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto px-6 py-8">

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[var(--text-main)]">
                    Community
                </h1>

                <p className="mt-1 text-[var(--text-soft)]">
                    Discuss ideas, projects and technology.
                </p>
            </div>

            {/* Create Discussion */}
            <form
                onSubmit={handleCreateDiscussion}
                className="mb-8 p-5 rounded-xl border border-[var(--border)]"
            >
                <h2 className="text-lg font-semibold mb-4">
                    Start a discussion
                </h2>

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="What do you want to discuss?"
                        className="flex-1 px-4 py-3 rounded-lg border border-[var(--border)] bg-transparent outline-none"
                    />

                    <button
                        type="submit"
                        disabled={creating}
                        className="px-5 py-3 rounded-lg bg-[var(--accent)] text-white font-semibold disabled:opacity-50"
                    >
                        {creating ? "Creating..." : "Create"}
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <p className="mb-5 text-red-500">
                    {error}
                </p>
            )}

            {/* Discussions */}
            <div>
                <h2 className="text-xl font-semibold mb-4">
                    Discussions
                </h2>

                {loading ? (
                    <p className="text-[var(--text-soft)]">
                        Loading discussions...
                    </p>
                ) : discussions.length === 0 ? (
                    <p className="text-[var(--text-soft)]">
                        No discussions yet.
                    </p>
                ) : (
                    <div className="space-y-3">
    {discussions.map((discussion) => (
        <div
            key={discussion._id}
            onClick={() =>
                navigate(`/community/${discussion._id}`)
            }
            className="p-5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] transition-colors cursor-pointer"
        >
            <h3 className="text-lg font-semibold">
                {discussion.title}
            </h3>

            <p className="text-sm text-[var(--text-soft)] mt-2">
                Started by{" "}
                {discussion.createdBy?.fullName ||
                    discussion.createdBy?.username ||
                    "User"}
            </p>
        </div>
    ))}
</div>
                )}
            </div>
        </div>
    );
};

export default DiscussionPage;