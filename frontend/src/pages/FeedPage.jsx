import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getAuthSession } from "../services/authApi";
import { createComment, createPost, getPosts, likePost, unlikePost } from "../services/postApi";

const normalizeComments = (comments = []) =>
  Array.isArray(comments)
    ? comments.map((comment) => ({
        id: comment._id || comment.id || `${comment.user}-${comment.body}`,
        user: comment.user || "developer",
        body: comment.body || "",
      }))
    : [];

export default function FeedPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const authSession = getAuthSession();
  const username = authSession?.user?.username || "developer";
  const userBio = authSession?.user?.bio || "Building tools and sharing ideas";
  const displayName =
    authSession?.user?.fullName || username.charAt(0).toUpperCase() + username.slice(1);

  const [posts, setPosts] = useState([]);
  const [newPostText, setNewPostText] = useState("");
  const [activeCommentPostId, setActiveCommentPostId] = useState(null);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [sort, setSort] = useState("latest");
  // const [page, setPage] = useState(1);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef(null);

  const search = searchParams.get("search") || "";

  const formatTime = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diff = Math.floor((now - created) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} day ago`;
    return created.toLocaleDateString();
  };

const loadPosts = useCallback(
  async (currentCursor = null, reset = false) => {
    if (loading) return;
    if (!reset && !hasMore) return;

    setLoading(true);

    try {
      const response = await getPosts({
        cursor: currentCursor,
        limit: 5,
        search,
        sort,
      });

      const backendPosts = response.posts.map((post) => {
        const normalizedComments = normalizeComments(post.comments);

        return {
          id: post._id,
          author: post.title,
          handle: "@dev_member",
          time: post.createdAt,
          avatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAl8Tr-b7rkNigRE1UnhaBQhjKDIyNG8jIh7YIxFQcYysPdHSomYxYS80xW1bnFszVacYc5BbOVp6FQCx8jVDMVbGvmvhJyhVrGZlVgVZeJ1gewI6A8Y3BEToZ1qHyFMRVir_zGvICmD0Nu1Z9oOINvWqadSdAJYPgEhkzbi_xKZi84jqmciul3wWa-8fKwl4fiU-YK5sFQf8kIwB4dImRxBkrqhWEMSwT32mHnzdqqz8O7ulzlhvAvR6hMM9h7wFiiGCl07dX7a8",
          text: post.body,
          likes: post.likes?.length || 0,
          comments: normalizedComments.length,
          commentList: normalizedComments,
          isLiked:
            post.likes?.some((like) => like.user === username) || false,
        };
      });

      if (reset) {
        setPosts(backendPosts);
      } else {
        setPosts((prev) => [...prev, ...backendPosts]);
      }

      setCursor(response.nextCursor);

      if (!response.nextCursor) {
        setHasMore(false);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  },
  [loading, hasMore, search, sort, username]
);
useEffect(() => {
  loadPosts(null, true);
}, []);

useEffect(() => {
  setCursor(null);
  setHasMore(true);

  loadPosts(null, true);
}, [search, sort]);

  const lastPostRef = useCallback(
  (node) => {
    if (loading) return;

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadPosts(cursor, false);
      }
    });

    if (node) {
      observer.current.observe(node);
    }
  },
  [loading, hasMore, cursor, loadPosts]
);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const titleVal = username.charAt(0).toUpperCase() + username.slice(1);

    try {
      const response = await createPost({
        title: titleVal,
        body: newPostText,
      });

      if (response?.post) {
        setPosts((current) => [
          {
            id: response.post._id,
            author: titleVal,
            handle: `@${username}`,
            time: "Just now",
            avatar:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuAl8Tr-b7rkNigRE1UnhaBQhjKDIyNG8jIh7YIxFQcYysPdHSomYxYS80xW1bnFszVacYc5BbOVp6FQCx8jVDMVbGvmvhJyhVrGZlVgVZeJ1gewI6A8Y3BEToZ1qHyFMRVir_zGvICmD0Nu1Z9oOINvWqadSdAJYPgEhkzbi_xKZi84jqmciul3wWa-8fKwl4fiU-YK5sFQf8kIwB4dImRxBkrqhWEMSwT32mHnzdqqz8O7ulzlhvAvR6hMM9h7wFiiGCl07dX7a8",
            text: response.post.body,
            likes: 0,
            comments: 0,
            commentList: [],
            isLiked: false,
          },
          ...current,
        ]);
        setNewPostText("");
      }
    } catch (err) {
      console.error("Failed to create post on backend:", err);
    }
  };

  const handleLikePost = async (postId) => {
    const activeSession = getAuthSession();
    const user = activeSession?.user?.username;

    if (!user || typeof postId !== "string") {
      return;
    }

    const targetPost = posts.find((post) => post.id === postId);
    const isLiked = targetPost?.isLiked === true;

    try {
      const response = isLiked
        ? await unlikePost({ post: postId, user })
        : await likePost({ post: postId, user });

      if (response?.post) {
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: response.post.likes?.length ?? post.likes,
                  isLiked: response.liked ?? !isLiked,
                }
              : post
          )
        );
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleCommentPost = (postId) => {
    setActiveCommentPostId((current) => (current === postId ? null : postId));
  };

  const handleCommentDraftChange = (postId, value) => {
    setCommentDrafts((current) => ({
      ...current,
      [postId]: value,
    }));
  };

  const handleSubmitComment = async (postId) => {
    const activeSession = getAuthSession();
    const user = activeSession?.user?.username;
    const commentText = commentDrafts[postId]?.trim();

    if (!user || typeof postId !== "string" || !commentText) {
      return;
    }

    try {
      const response = await createComment({
        post: postId,
        user,
        body: commentText,
      });

      if (response?.post) {
        const updatedComments = normalizeComments(response.post.comments);
        setPosts((current) =>
          current.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: updatedComments.length,
                  commentList: updatedComments,
                }
              : post
          )
        );
      }

      setCommentDrafts((current) => ({
        ...current,
        [postId]: "",
      }));
      setActiveCommentPostId(null);
    } catch (err) {
      console.error("Failed to create comment:", err);
    }
  };

  return (
    <div className="feed-shell w-full font-sans pb-16 pt-6">
      <div className="max-w-[1128px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <aside className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-4">
            <div className="feed-card overflow-hidden">
              <div className="feed-banner h-20"></div>
              <div className="flex justify-center -mt-[38px] px-3">
                <div className="feed-avatar-ring w-[76px] h-[76px] rounded-full overflow-hidden bg-white">
                  <img
                    className="w-full h-full object-cover"
                    alt={username}
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Cs3FnKmxvQzkJNuY_KMFgDQJIQ6iGRe0rTmqzaCCCxNexZe1OCgxF5kfCqnTpbQD3Om9UO4c8xVu1eB0R2Vb4-tqGzhiKVGopUwu5zlNvnpcwEyYefOhnbj4XCWbzC8umzJMQCtDhVWMjGSOQO70z3eQGWLI63o7LuhkupRBTqjQP6ZAPvL5o0hbUD4qlFxb9-fhANySuXcas2cTldpEC8pwr6TiF1iJYVIUv7Cfv1uRIH55TPX7fSwH7YAetDi1HFjptzqTbCY"
                  />
                </div>
              </div>
              <div className="px-4 py-4 border-b border-[var(--line-soft)] text-center">
                <h2
                  onClick={() => navigate("/profile")}
                  className="font-semibold text-[16px] text-[var(--text-main)] hover:underline cursor-pointer"
                >
                  {displayName}
                </h2>
                <p className="text-[12px] text-[var(--text-soft)] mt-1 line-clamp-2">{userBio}</p>
              </div>
              <div className="py-3 text-[12px] text-[var(--text-soft)]">
                <div className="feed-muted-link px-4 py-2 flex justify-between items-center cursor-pointer transition-colors">
                  <span>Profile viewers</span>
                  <span className="font-semibold feed-highlight">142</span>
                </div>
                <div className="feed-muted-link px-4 py-2 flex justify-between items-center cursor-pointer transition-colors">
                  <span>Post impressions</span>
                  <span className="font-semibold feed-highlight">1,024</span>
                </div>
              </div>
              <div
                className="feed-muted-link px-4 py-3 border-t border-[var(--line-soft)] flex items-center gap-2 text-[12px] font-semibold cursor-pointer transition-colors"
                onClick={() => navigate("/profile")}
              >
                <span className="material-symbols-outlined text-[18px]">bookmark</span>
                My items
              </div>
            </div>

            <div className="feed-card hidden md:flex p-4 flex-col gap-2 text-[12px] text-[var(--text-soft)]">
              <p className="font-semibold text-[var(--text-main)] text-[11px] uppercase tracking-[0.18em]">
                Recent
              </p>
              <a href="#" className="feed-muted-link flex items-center gap-1 p-2 rounded-xl transition-colors">
                <span className="text-[var(--text-dim)]">#</span> rustlang
              </a>
              <a href="#" className="feed-muted-link flex items-center gap-1 p-2 rounded-xl transition-colors">
                <span className="text-[var(--text-dim)]">#</span> typescript
              </a>
              <a href="#" className="feed-muted-link flex items-center gap-1 p-2 rounded-xl transition-colors">
                <span className="text-[var(--text-dim)]">#</span> nextjs
              </a>
              <hr className="border-[var(--line-soft)] my-1" />
              <button
                onClick={() => navigate("/profile")}
                className="feed-highlight hover:underline font-semibold text-left bg-transparent border-none cursor-pointer"
              >
                View Profile Details
              </button>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-8 lg:col-span-6 h-screen overflow-y-auto px-2 feed-scroll">
            <div className="feed-card p-4">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <img
                    className="w-full h-full object-cover"
                    alt="user avatar"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl8Tr-b7rkNigRE1UnhaBQhjKDIyNG8jIh7YIxFQcYysPdHSomYxYS80xW1bnFszVacYc5BbOVp6FQCx8jVDMVbGvmvhJyhVrGZlVgVZeJ1gewI6A8Y3BEToZ1qHyFMRVir_zGvICmD0Nu1Z9oOINvWQqadSdAJYPgEhkzbi_xKZi84jqmciul3wWa-8fKwl4fiU-YK5sFQf8kIwB4dImRxBkrqhWEMSwT32mHnzdqqz8O7ulzlhvAvR6hMM9h7wFiiGCl07dX7a8"
                  />
                </div>
                <form onSubmit={handleCreatePost} className="flex-grow">
                  <textarea
                    className="feed-input w-full rounded-2xl text-sm placeholder-[var(--text-dim)] resize-none min-h-[88px] outline-none p-4"
                    placeholder="What are you building today?"
                    rows="3"
                    value={newPostText}
                    onChange={(e) => setNewPostText(e.target.value)}
                  />
                  <div className="flex justify-between items-center pt-3 border-t border-[rgba(230,217,201,0.7)] mt-2">
                    <div className="flex gap-1 text-[var(--text-soft)]">
                      <button
                        type="button"
                        className="feed-muted-link flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors feed-highlight font-semibold text-xs cursor-pointer border-none bg-transparent"
                        title="Photo"
                      >
                        <span className="material-symbols-outlined text-[18px]">image</span>
                        <span className="hidden sm:inline">Photo</span>
                      </button>
                      <button
                        type="button"
                        className="feed-muted-link flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-[#7b5c2e] font-semibold text-xs cursor-pointer border-none bg-transparent"
                        title="Video"
                      >
                        <span className="material-symbols-outlined text-[18px]">video_library</span>
                        <span className="hidden sm:inline">Video</span>
                      </button>
                      <button
                        type="button"
                        className="feed-muted-link flex items-center gap-1.5 px-3 py-2 rounded-xl transition-colors text-[#b86b24] font-semibold text-xs cursor-pointer border-none bg-transparent"
                        title="Event"
                      >
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                        <span className="hidden sm:inline">Event</span>
                      </button>
                    </div>

                    <button
                      type="submit"
                      disabled={!newPostText.trim()}
                      className="feed-primary-button px-5 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
                    >
                      Post
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="feed-card feed-toolbar px-4 py-3 mt-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-main)]">Feed sorting</p>
                  <p className="text-xs text-[var(--text-dim)]">
                    Choose how posts are ordered in your feed.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <label htmlFor="feed-sort" className="text-xs font-medium text-[var(--text-soft)]">
                    Sort by
                  </label>
                  <select
                    id="feed-sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    aria-label="Sort feed posts"
                    className="min-w-[150px] rounded-xl border border-[var(--line-soft)] bg-[var(--bg-panel)] px-3 py-2 text-sm text-[var(--text-main)] font-medium outline-none cursor-pointer focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(255,90,31,0.15)]"
                  >
                    <option value="latest">Latest</option>
                    <option value="oldest">Oldest</option>
                    <option value="likes">Most Liked</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-4">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  ref={index === posts.length - 1 ? lastPostRef : null}
                  className="feed-card feed-card-hover p-4 transition-shadow duration-200"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 cursor-pointer">
                      <img className="w-full h-full object-cover" alt={post.author} src={post.avatar} />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-sm text-[var(--text-main)] hover:text-[var(--accent)] hover:underline cursor-pointer">
                            {post.author}
                          </h3>
                          <p className="text-xs text-[var(--text-soft)] flex items-center gap-1.5">
                            <span>{post.handle}</span>
                            <span>&bull;</span>
                            <span>{formatTime(post.time)}</span>
                            <span>&bull;</span>
                            <span className="material-symbols-outlined text-[14px]">public</span>
                          </p>
                        </div>
                        <button className="text-[var(--text-soft)] hover:text-[var(--text-main)] rounded-full p-1 hover:bg-[var(--accent-tint)] transition-colors cursor-pointer border-none bg-transparent">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[var(--text-main)] mb-3 whitespace-pre-line leading-relaxed">
                    {post.text}
                  </p>

                  {post.code && (
                    <div className="bg-[#fdf8f2] rounded-2xl overflow-hidden mb-3 border border-[var(--line-soft)]">
                      <div className="flex justify-between items-center px-4 py-2 bg-[var(--accent-tint)] border-b border-[var(--line-soft)] text-xs text-[var(--text-soft)]">
                        <span className="font-semibold">{post.code.filename}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(post.code.content);
                          }}
                          className="flex items-center gap-1 text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <span className="material-symbols-outlined text-sm">content_copy</span>
                          <span>Copy</span>
                        </button>
                      </div>
                      <pre className="p-4 font-mono text-xs text-[#2b2b2b] overflow-x-auto bg-[#fffdf9]">
                        <code>{post.code.content}</code>
                      </pre>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-2 text-[12px] text-[var(--text-soft)] border-b border-[rgba(230,217,201,0.7)] mb-2">
                    <div className="flex items-center gap-1">
                      <span className="inline-flex">
                        <span className="feed-reaction-dot w-4 h-4 rounded-full flex items-center justify-center text-[8px] z-10 border border-white">
                          👍
                        </span>
                        {post.likes > 2 && (
                          <span className="w-4 h-4 bg-[#1f1a17] text-white rounded-full flex items-center justify-center text-[8px] -ml-1.5 border border-white z-0">
                            ❤
                          </span>
                        )}
                      </span>
                      <span className="ml-1 hover:text-[var(--accent)] hover:underline cursor-pointer">
                        {post.likes} reactions
                      </span>
                    </div>
                    <button
                      onClick={() => handleCommentPost(post.id)}
                      className="hover:text-[var(--accent)] hover:underline cursor-pointer border-none bg-transparent text-[var(--text-soft)]"
                    >
                      {post.comments} comments
                    </button>
                  </div>

                  <div className="flex justify-between items-center text-[var(--text-soft)] font-semibold text-sm">
                    <button
                      type="button"
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center justify-center gap-2 hover:bg-[var(--accent-tint)] py-2 rounded-xl flex-1 cursor-pointer transition-colors border-none bg-transparent ${post.isLiked ? "text-[var(--accent)]" : ""}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">thumb_up</span>
                      <span>Like</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCommentPost(post.id)}
                      className="flex items-center justify-center gap-2 hover:bg-[var(--accent-tint)] py-2 rounded-xl flex-1 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[20px]">comment</span>
                      <span>Comment</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 hover:bg-[var(--accent-tint)] py-2 rounded-xl flex-1 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[20px]">share</span>
                      <span>Repost</span>
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center gap-2 hover:bg-[var(--accent-tint)] py-2 rounded-xl flex-1 cursor-pointer transition-colors border-none bg-transparent"
                    >
                      <span className="material-symbols-outlined text-[20px]">send</span>
                      <span>Send</span>
                    </button>
                  </div>

                  {activeCommentPostId === post.id ? (
                    <div className="mt-3 border-t border-[rgba(230,217,201,0.7)] pt-3 flex flex-col gap-3">
                      <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <img
                            className="w-full h-full object-cover"
                            alt="avatar"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAl8Tr-b7rkNigRE1UnhaBQhjKDIyNG8jIh7YIxFQcYysPdHSomYxYS80xW1bnFszVacYc5BbOVp6FQCx8jVDMVbGvmvhJyhVrGZlVgVZeJ1gewI6A8Y3BEToZ1qHyFMRVir_zGvICmD0Nu1Z9oOINvWQqadSdAJYPgEhkzbi_xKZi84jqmciul3wWa-8fKwl4fiU-YK5sFQf8kIwB4dImRxBkrqhWEMSwT32mHnzdqqz8O7ulzlhvAvR6hMM9h7wFiiGCl07dX7a8"
                          />
                        </div>
                        <div className="flex-grow flex flex-col gap-2">
                          <textarea
                            className="feed-input w-full min-h-[50px] rounded-2xl px-3 py-2 text-xs outline-none resize-none"
                            placeholder="Add a comment..."
                            value={commentDrafts[post.id] || ""}
                            onChange={(e) => handleCommentDraftChange(post.id, e.target.value)}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveCommentPostId(null)}
                              className="px-3 py-1 text-xs font-semibold text-[var(--text-soft)] hover:bg-[var(--accent-tint)] rounded-full transition-colors border-none bg-transparent"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSubmitComment(post.id)}
                              className="feed-primary-button px-3 py-1 text-xs font-bold rounded-full transition-colors border-none"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </div>

                      {post.commentList?.length ? (
                        <div className="space-y-3 mt-1">
                          {post.commentList.map((comment) => (
                            <div key={comment.id} className="flex gap-2 items-start">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-[#efe4d8] flex-shrink-0">
                                <span className="material-symbols-outlined text-[32px] text-[#9e8a75]">
                                  account_circle
                                </span>
                              </div>
                              <div className="feed-comment-box rounded-2xl p-3 text-xs flex-grow shadow-sm">
                                <p className="font-semibold text-[var(--text-main)] mb-1">@{comment.user}</p>
                                <p className="text-[var(--text-soft)]">{comment.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-[var(--text-soft)] italic text-center py-2">
                          No comments yet. Be the first to comment.
                        </p>
                      )}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </main>

          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-4">
            <div className="feed-card p-4">
              <div className="flex items-center justify-between mb-3 border-b border-[rgba(230,217,201,0.7)] pb-2">
                <h2 className="font-bold text-sm text-[var(--text-main)]">DevHub News</h2>
                <span className="material-symbols-outlined text-[var(--text-dim)] text-sm">info</span>
              </div>
              <ul className="flex flex-col gap-3 text-xs">
                <li className="feed-muted-link p-2 rounded-xl cursor-pointer transition-colors">
                  <h4 className="font-semibold text-[var(--text-main)] flex items-start gap-1">
                    <span className="feed-news-dot font-bold text-sm leading-none">&bull;</span>
                    Rust 2026 Roadmap Released
                  </h4>
                  <p className="text-[var(--text-dim)] pl-3">2d ago &bull; 14,043 readers</p>
                </li>
                <li className="feed-muted-link p-2 rounded-xl cursor-pointer transition-colors">
                  <h4 className="font-semibold text-[var(--text-main)] flex items-start gap-1">
                    <span className="feed-news-dot font-bold text-sm leading-none">&bull;</span>
                    Vite vs Turbopack in DevHub
                  </h4>
                  <p className="text-[var(--text-dim)] pl-3">3d ago &bull; 8,432 readers</p>
                </li>
                <li className="feed-muted-link p-2 rounded-xl cursor-pointer transition-colors">
                  <h4 className="font-semibold text-[var(--text-main)] flex items-start gap-1">
                    <span className="feed-news-dot font-bold text-sm leading-none">&bull;</span>
                    Wasm-based Microfrontends
                  </h4>
                  <p className="text-[var(--text-dim)] pl-3">5d ago &bull; 4,128 readers</p>
                </li>
              </ul>
            </div>

            <div className="feed-card p-4">
              <h2 className="font-bold text-sm text-[var(--text-main)] mb-3">Add to your feed</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Devon Webb"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCx0fwapccQIMUyEXTzjFNb5huPqk_EryuGlvfU1sMpviOyEKqLaZ3zmfUBue5-IRUDnF6kVYeVYMU_Ppmr8gG6XpFg_3fh94Eb_6_5DoSivukexLCaZWEc2aE95U7xIUUBINfHf7xahb9MAIOLCET-cYqmtecpd_SAUFEGij-v-Qmk7ucft_QOZUdVTq6afR0R0wAK5ZoleU9IbFVnUGSHSA_c6djgsftF2FDDsGBf7YMAiolV7-nNnP1egNHRNmItYHtqpnnCTZ8"
                    />
                  </div>
                  <div className="flex-grow overflow-hidden text-xs">
                    <p className="font-bold text-[var(--text-main)] truncate">Devon Webb</p>
                    <p className="text-[var(--text-dim)] truncate">@dwebb_core</p>
                    <button className="feed-secondary-button mt-1 px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all cursor-pointer bg-transparent">
                      <span className="material-symbols-outlined text-xs">add</span> Follow
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <img
                      className="w-full h-full object-cover"
                      alt="Jamie Park"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDoTLqFWwoBXvcTvDc035igytJe_gj41BxhyW421kW4NpOoGaPN1dOUA7frxirkQeyJfUlU8nDSiMDBf2XC1SvRG5Va667HVSZKkHB8wqyDImHegGTMy3pbTbFjsTfVe9MSICUCC9GVaL-4oHsOADOhdIcnuNomVrfza_1MnEgMapTw3Qv44FAaobQFYKHTfskoKoAVF1u1oY5W61hBzc_uAkU9qwEthcnpT3uQi21Urt59QQjx83mMjYKvbPYfDLED-H5ec7q1QWE"
                    />
                  </div>
                  <div className="flex-grow overflow-hidden text-xs">
                    <p className="font-bold text-[var(--text-main)] truncate">Jamie Park</p>
                    <p className="text-[var(--text-dim)] truncate">@jamie_scripts</p>
                    <button className="feed-secondary-button mt-1 px-3 py-1 rounded-full font-bold flex items-center gap-1 transition-all cursor-pointer bg-transparent">
                      <span className="material-symbols-outlined text-xs">add</span> Follow
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="feed-card p-4 text-xs">
              <h2 className="font-bold text-sm text-[var(--text-main)] mb-3">Top Projects</h2>
              <div className="flex flex-col gap-3">
                <div className="feed-muted-link p-3 rounded-2xl border border-[rgba(230,217,201,0.7)] cursor-pointer transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="feed-project-link font-semibold hover:underline">PrismORM</h3>
                    <span className="flex items-center text-[var(--text-dim)] font-sans text-[10px]">
                      ★ 4.2k
                    </span>
                  </div>
                  <p className="text-[var(--text-soft)] line-clamp-2">
                    High-performance Rust ORM with migrations.
                  </p>
                </div>

                <div className="feed-muted-link p-3 rounded-2xl border border-[rgba(230,217,201,0.7)] cursor-pointer transition-colors">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="feed-project-link font-semibold hover:underline">FluxUI</h3>
                    <span className="flex items-center text-[var(--text-dim)] font-sans text-[10px]">
                      ★ 1.8k
                    </span>
                  </div>
                  <p className="text-[var(--text-soft)] line-clamp-2">
                    Motion-driven Tailwind components.
                  </p>
                </div>
              </div>
            </div>

            <footer className="text-center text-[11px] text-[var(--text-dim)] mt-2 flex flex-col gap-2">
              <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 px-2">
                <a className="feed-footer-link hover:underline" href="#">
                  About
                </a>
                <a className="feed-footer-link hover:underline" href="#">
                  Accessibility
                </a>
                <a className="feed-footer-link hover:underline" href="#">
                  Help Center
                </a>
                <a className="feed-footer-link hover:underline" href="#">
                  Privacy &amp; Terms
                </a>
                <a className="feed-footer-link hover:underline" href="#">
                  API
                </a>
                <a className="feed-footer-link hover:underline" href="#">
                  GitHub
                </a>
              </div>
              <p className="mt-1 font-semibold flex items-center justify-center gap-1">
                <span className="feed-highlight font-bold text-xs">DevHub</span> Corporation © 2026
              </p>
            </footer>
          </aside>
        </div>
      </div>

      <nav className="feed-mobile-nav md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center py-2 z-50">
        <a className="active flex flex-col items-center gap-0.5" href="#">
          <span className="material-symbols-outlined text-[22px]">home</span>
          <span className="text-[10px] font-semibold">Home</span>
        </a>
        <a
          className="flex flex-col items-center gap-0.5"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/stack");
          }}
        >
          <span className="material-symbols-outlined text-[22px]">explore</span>
          <span className="text-[10px]">Explore</span>
        </a>
        <a className="flex flex-col items-center gap-0.5 relative" href="#">
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <div className="absolute top-0 right-1 w-2 h-2 bg-[var(--accent)] rounded-full border border-white"></div>
          <span className="text-[10px]">Alerts</span>
        </a>
        <a
          className="flex flex-col items-center gap-0.5"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate("/profile");
          }}
        >
          <span className="material-symbols-outlined text-[22px]">account_circle</span>
          <span className="text-[10px]">Me</span>
        </a>
      </nav>
    </div>
  );
}
