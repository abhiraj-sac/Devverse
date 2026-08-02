import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
  updateProfile as updateProfileRequest,
} from "../services/authApi";
import { getPosts } from "../services/postApi";

const defaultAvatar =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB9Cs3FnKmxvQzkJNuY_KMFgDQJIQ6iGRe0rTmqzaCCCxNexZe1OCgxF5kfCqnTpbQD3Om9UO4c8xVu1eB0R2Vb4-tqGzhiKVGopUwu5zlNvnpcwEyYefOhnbj4XCWbzC8umzJMQCtDhVWMjGSOQO70z3eQGWLI63o7LuhkupRBTqjQP6ZAPvL5o0hbUD4qlFxb9-fhANySuXcas2cTldpEC8pwr6TiF1iJYVIUv7Cfv1uRIH55TPX7fSwH7YAetDi1HFjptzqTbCY";

const buildInitialForm = (user) => ({
  fullName: user?.fullName || "",
  username: user?.username || "",
  bio: user?.bio || "",
  headline: user?.headline || "",
  location: user?.location || "",
  website: user?.website || "",
  github: user?.github || "",
  availability: user?.availability || "Open to collaborate",
  skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => getAuthSession());
  const [formData, setFormData] = useState(() => buildInitialForm(getAuthSession()?.user));
  const [status, setStatus] = useState({
    loading: false,
    error: "",
    success: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  const user = session?.user;
  const displayName = formData.fullName.trim() || user?.fullName || user?.username || "Developer";

  useEffect(() => {
    if (!user) return;

    const loadUserPosts = async () => {
      setPostsLoading(true);
      try {
        const response = await getPosts(1, 50);
        if (response?.posts) {
          const filtered = response.posts.filter(
            (post) =>
              post.title?.toLowerCase() === displayName.toLowerCase() ||
              post.title?.toLowerCase() === user.username.toLowerCase()
          );
          setUserPosts(filtered);
        }
      } catch (err) {
        console.error("Failed to load user posts:", err);
      } finally {
        setPostsLoading(false);
      }
    };

    loadUserPosts();
  }, [displayName, user?.username]);

  if (!user) {
    navigate("/login");
    return null;
  }

  const previewProfile = {
    fullName: formData.fullName.trim() || user.fullName || "",
    username: formData.username.trim() || user.username || "",
    bio: formData.bio.trim() || user.bio || "",
    headline: formData.headline.trim() || user.headline || "",
    location: formData.location.trim() || user.location || "",
    website: formData.website.trim() || user.website || "",
    github: formData.github.trim() || user.github || "",
    availability: formData.availability.trim() || user.availability || "",
    skills: formData.skills
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean),
  };

  const focusAreas = previewProfile.skills.slice(0, 4);
  const skillsToRender =
    previewProfile.skills.length > 0
      ? previewProfile.skills
      : ["React", "Next.js", "Rust", "GraphQL", "Docker"];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleLogout = () => {
    clearAuthSession();
    navigate("/login");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({
      loading: true,
      error: "",
      success: "",
    });

    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const response = await updateProfileRequest(payload, session.accessToken);
      saveAuthSession(response.data);
      setSession(response.data);
      setFormData(buildInitialForm(response.data.user));
      setStatus({
        loading: false,
        error: "",
        success: "Profile updated successfully.",
      });
      setTimeout(() => {
        setIsEditing(false);
        setStatus((prev) => ({ ...prev, success: "" }));
      }, 1000);
    } catch (error) {
      setStatus({
        loading: false,
        error: error.message || "Unable to update profile.",
        success: "",
      });
    }
  };

  const profileCardClass = "feed-card p-5";
  const inputClass =
    "w-full rounded-2xl border border-[var(--line-soft)] bg-[var(--bg-panel)] px-4 py-3 text-xs text-[var(--text-main)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(255,90,31,0.12)]";

  if (isEditing) {
    return (
      <section className="feed-shell min-h-screen font-sans pt-6 pb-16">
        <div className="mx-auto max-w-[1128px] px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <aside className={`${profileCardClass} col-span-12 lg:col-span-4`}>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--line-soft)] px-4 py-2 text-xs font-semibold text-[var(--text-soft)] transition-colors hover:bg-[var(--accent-tint)] hover:text-[var(--text-main)] cursor-pointer bg-[var(--bg-panel)]"
            >
              <span className="material-symbols-outlined text-[16px]">west</span>
              Back to Profile
            </button>

            <div className="mt-5 border-t border-[var(--line-soft)] pt-5">
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold feed-highlight">
                Profile Studio
              </p>
              <h1 className="mt-2 text-xl font-bold leading-tight text-[var(--ink-dark)]">
                Shape your developer identity
              </h1>
            </div>

            <div className="feed-card overflow-hidden mt-6 p-0">
              <div className="feed-banner h-20" />
              <div className="px-4 pb-4">
                <div className="-mt-8 flex items-end justify-between gap-2">
                  <img
                    src={defaultAvatar}
                    alt={displayName}
                    className="feed-avatar-ring h-16 w-16 rounded-full object-cover bg-white"
                  />
                  <div className="rounded-full border border-[rgba(255,90,31,0.18)] bg-[var(--accent-tint)] px-3 py-1 text-[10px] font-bold feed-highlight">
                    {previewProfile.availability || "Open to collaborate"}
                  </div>
                </div>

                <h2 className="mt-3 text-base font-bold text-[var(--text-main)]">{displayName}</h2>
                <p className="text-xs feed-highlight font-semibold">@{previewProfile.username}</p>
                <p className="mt-2 text-xs text-[var(--text-soft)] line-clamp-2">
                  {previewProfile.headline ||
                    previewProfile.bio ||
                    "Add your role, stack, and what you are building next."}
                </p>

                <div className="mt-4">
                  <p className="text-[10px] uppercase font-bold text-[var(--text-dim)] tracking-wider">
                    Focus areas
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {(focusAreas.length ? focusAreas : ["react", "node", "ui systems"]).map((skill) => (
                      <span key={skill} className="feed-chip rounded-full px-2.5 py-1 text-[10px] font-semibold">
                        #{skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className={`${profileCardClass} col-span-12 lg:col-span-8`}>
            <div className="flex flex-col gap-3 border-b border-[var(--line-soft)] pb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] uppercase font-bold tracking-[0.2em] feed-highlight">
                  Edit Profile
                </p>
                <h2 className="mt-1 text-lg font-bold text-[var(--text-main)]">
                  Make your profile feel like you
                </h2>
                <p className="text-xs text-[var(--text-soft)]">
                  Update your intro, links, skills, and availability so your DevHub profile works
                  like a live builder card.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[rgba(177,71,34,0.2)] px-4 py-2 text-xs font-bold text-[#b14722] transition-colors hover:bg-[var(--accent-tint)] bg-[var(--bg-panel)] cursor-pointer"
              >
                Logout
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <section className="rounded-[24px] border border-[var(--line-soft)] bg-[#fff8f2] p-4">
                  <p className="text-xs font-bold text-[var(--text-soft)] border-b border-[var(--line-soft)] pb-2 uppercase tracking-wider">
                    Identity
                  </p>
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Full name</span>
                      <input
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Ada Lovelace"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Username</span>
                      <input
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="ada_codes"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Headline</span>
                      <input
                        name="headline"
                        value={formData.headline}
                        onChange={handleChange}
                        placeholder="Frontend engineer crafting developer tools"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Bio</span>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        rows="3"
                        maxLength={160}
                        placeholder="Share what you build..."
                        className={`${inputClass} resize-none`}
                      />
                    </label>
                  </div>
                </section>

                <section className="rounded-[24px] border border-[var(--line-soft)] bg-[#fff8f2] p-4">
                  <p className="text-xs font-bold text-[var(--text-soft)] border-b border-[var(--line-soft)] pb-2 uppercase tracking-wider">
                    Presence
                  </p>
                  <div className="mt-4 grid gap-3">
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Location</span>
                      <input
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Bengaluru, India"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">
                        Portfolio / website
                      </span>
                      <input
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://your-site.dev"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">GitHub</span>
                      <input
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="github.com/your-handle"
                        className={inputClass}
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1 block text-xs text-[var(--text-soft)]">Availability</span>
                      <input
                        name="availability"
                        value={formData.availability}
                        onChange={handleChange}
                        placeholder="Open to freelance and collabs"
                        className={inputClass}
                      />
                    </label>
                  </div>
                </section>
              </div>

              <section className="rounded-[24px] border border-[var(--line-soft)] bg-[#fff8f2] p-4">
                <h3 className="text-sm font-bold text-[var(--text-main)]">
                  Highlight the tools you want to be known for
                </h3>
                <p className="text-xs text-[var(--text-soft)] mt-1">
                  Separate skills with commas, for example `react, rust, node`.
                </p>
                <textarea
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  rows="3"
                  placeholder="react, node.js, express, mongodb, design systems"
                  className={`${inputClass} mt-4 resize-none`}
                />
              </section>

              {(status.error || status.success) && (
                <div
                  className={
                    status.error
                      ? "rounded-2xl border border-[rgba(177,71,34,0.2)] bg-[#fff1eb] p-3 text-xs font-semibold text-[#b14722]"
                      : "rounded-2xl border border-[rgba(255,90,31,0.18)] bg-[var(--accent-tint)] p-3 text-xs font-semibold feed-highlight"
                  }
                >
                  {status.error || status.success}
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-[var(--line-soft)] pt-5 md:flex-row md:items-center md:justify-between">
                <p className="text-[11px] text-[var(--text-dim)] m-0">
                  Your updates will be reflected in your active DevHub session immediately.
                </p>
                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-full border border-[var(--line-soft)] px-5 py-2 text-xs font-bold text-[var(--text-soft)] transition-colors hover:bg-[var(--accent-tint)] bg-[var(--bg-panel)] cursor-pointer font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="feed-primary-button rounded-full px-6 py-2 text-xs font-bold transition-opacity disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer font-sans border-none"
                  >
                    {status.loading ? "Saving..." : "Save profile"}
                  </button>
                </div>
              </div>
            </form>
          </main>
        </div>
      </section>
    );
  }

  return (
    <div className="feed-shell w-full font-sans pb-16 pt-6">
      <div className="max-w-[1128px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="feed-card overflow-hidden">
              <div className="feed-banner h-44 w-full" />

              <div className="relative px-6 pb-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between -mt-14 mb-4 gap-4">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-3 text-center md:text-left">
                    <img
                      src={defaultAvatar}
                      alt={displayName}
                      className="feed-avatar-ring h-28 w-28 rounded-full object-cover bg-white relative z-10"
                    />
                    <div className="mb-1">
                      <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 justify-center md:justify-start m-0">
                        {displayName}
                      </h2>
                      <p className="feed-highlight font-semibold text-sm m-0">@{previewProfile.username}</p>
                    </div>
                  </div>

                  <div className="flex gap-2.5 mb-1 justify-center">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full border border-[var(--line-soft)] hover:bg-[var(--accent-tint)] text-[var(--text-soft)] hover:text-[var(--text-main)] font-bold px-4 py-2 transition-all text-xs flex items-center gap-1.5 cursor-pointer font-sans bg-[var(--bg-panel)]"
                    >
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                      Edit Profile
                    </button>
                    <button className="feed-primary-button font-bold px-5 py-2 rounded-full transition-all text-xs cursor-pointer border-none font-sans">
                      Follow
                    </button>
                  </div>
                </div>

                <div className="mt-4 border-t border-[rgba(230,217,201,0.7)] pt-4 text-center md:text-left">
                  <p className="text-sm text-[var(--text-soft)] max-w-3xl leading-relaxed m-0">
                    {previewProfile.headline ||
                      previewProfile.bio ||
                      "Add your role, stack, and what you are building next."}
                  </p>

                  {previewProfile.location && (
                    <p className="text-xs text-[var(--text-dim)] mt-2 flex items-center justify-center md:justify-start gap-1">
                      <span className="material-symbols-outlined text-sm leading-none">location_on</span>
                      {previewProfile.location}
                    </p>
                  )}

                  <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-4">
                    {skillsToRender.map((skill) => (
                      <span key={skill} className="feed-chip px-3 py-1 rounded-full text-xs font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-around md:justify-start gap-8 border-t border-[rgba(230,217,201,0.7)] pt-4 mt-5 text-center text-xs">
                  <div>
                    <div className="text-lg font-bold text-[var(--text-main)]">{142 + userPosts.length}</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-0.5">
                      Posts
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[var(--text-main)]">2.4k</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-0.5">
                      Likes
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[var(--text-main)]">1.1k</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-0.5">
                      Followers
                    </div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-[var(--text-main)]">480</div>
                    <div className="text-[10px] text-[var(--text-dim)] uppercase tracking-wider font-semibold mt-0.5">
                      Following
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-[var(--line-soft)] mt-2">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab("projects")}
                  className={`pb-2.5 font-bold text-sm transition-all bg-transparent border-none cursor-pointer ${
                    activeTab === "projects"
                      ? "feed-highlight border-b-2 border-[var(--accent)]"
                      : "text-[var(--text-soft)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`pb-2.5 font-bold text-sm transition-all bg-transparent border-none cursor-pointer ${
                    activeTab === "posts"
                      ? "feed-highlight border-b-2 border-[var(--accent)]"
                      : "text-[var(--text-soft)] hover:text-[var(--text-main)]"
                  }`}
                >
                  Recent Posts
                </button>
              </div>
            </div>

            {activeTab === "projects" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="feed-card feed-card-hover p-5 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-[var(--accent-tint)] p-2 rounded-2xl feed-highlight">
                        <span className="material-symbols-outlined text-[20px]">widgets</span>
                      </div>
                      <a href="#" className="text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                      </a>
                    </div>
                    <h4 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors m-0">
                      TurboCache
                    </h4>
                    <p className="text-xs text-[var(--text-soft)] mt-2 leading-relaxed m-0">
                      A distributed Redis wrapper for Rust applications with zero-copy serialization.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-5 pt-3 border-t border-[rgba(230,217,201,0.7)] text-[11px] text-[var(--text-soft)]">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#e59b2a]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      1.2k
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[var(--accent)]"></span>
                      Rust
                    </span>
                  </div>
                </div>

                <div className="feed-card feed-card-hover p-5 flex flex-col justify-between transition-all group">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="bg-[var(--accent-tint)] p-2 rounded-2xl feed-highlight">
                        <span className="material-symbols-outlined text-[20px]">account_tree</span>
                      </div>
                      <a href="#" className="text-[var(--text-soft)] hover:text-[var(--accent)] transition-colors">
                        <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                      </a>
                    </div>
                    <h4 className="text-base font-bold text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors m-0">
                      GQL-Gen
                    </h4>
                    <p className="text-xs text-[var(--text-soft)] mt-2 leading-relaxed m-0">
                      Type-safe GraphQL client generator for Next.js 14 and App Router.
                    </p>
                  </div>
                  <div className="flex items-center gap-4 mt-5 pt-3 border-t border-[rgba(230,217,201,0.7)] text-[11px] text-[var(--text-soft)]">
                    <span className="flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[14px] text-[#e59b2a]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        star
                      </span>
                      840
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#1f1a17]"></span>
                      TypeScript
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {postsLoading ? (
                  <p className="text-xs text-[var(--text-soft)] italic">Loading posts...</p>
                ) : userPosts.length > 0 ? (
                  userPosts.map((post) => (
                    <div key={post._id} className="feed-card p-4">
                      <div className="flex items-center gap-2 mb-2 text-xs text-[var(--text-soft)]">
                        <span className="font-bold text-[var(--text-main)]">@{user.username}</span>
                        <span>&bull;</span>
                        <span>{new Date(post.createdAt || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-[var(--text-main)] whitespace-pre-line leading-relaxed m-0">
                        {post.body}
                      </p>
                      <div className="flex gap-4 mt-4 pt-2 border-t border-[rgba(230,217,201,0.7)] text-xs text-[var(--text-dim)]">
                        <span>{post.likes?.length || 0} Likes</span>
                        <span>{post.comments?.length || 0} Comments</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-[var(--text-dim)] border border-dashed border-[var(--line-soft)] rounded-[24px] bg-[var(--bg-panel)]">
                    <span className="material-symbols-outlined text-3xl">post_add</span>
                    <p className="mt-2 text-xs">No recent posts found.</p>
                  </div>
                )}
              </div>
            )}

            <footer className="mt-6 pt-4 border-t border-[var(--line-soft)] flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-[var(--text-dim)]">
              <div>
                <span className="font-bold text-[var(--text-main)] text-xs">DevHub</span>
                <p className="mt-1 m-0">© 2026 DevHub Corporation. Built for developers.</p>
              </div>
              <div className="flex gap-4">
                <a href="#" className="feed-footer-link hover:underline">
                  Privacy
                </a>
                <a href="#" className="feed-footer-link hover:underline">
                  Terms
                </a>
                <a href="#" className="feed-footer-link hover:underline">
                  API
                </a>
                <a href="#" className="feed-footer-link hover:underline">
                  GitHub
                </a>
              </div>
            </footer>
          </div>

          <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
            <div className={profileCardClass}>
              <h3 className="text-sm font-bold text-[var(--text-main)] mb-4">Activity</h3>
              <div className="relative pl-6 border-l border-[var(--line-soft)] space-y-5">
                <div className="relative">
                  <span className="absolute -left-[30px] top-1 bg-[var(--accent)] w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                  <div className="text-xs font-bold text-[var(--text-main)]">Pushed to turbocache-rs</div>
                  <div className="text-[10px] text-[var(--text-dim)] mt-0.5">4 commits yesterday</div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[30px] top-1 bg-[#c9b8a7] w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                  <div className="text-xs font-bold text-[var(--text-main)]">Starred react-query</div>
                  <div className="text-[10px] text-[var(--text-dim)] mt-0.5">3 days ago</div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[30px] top-1 bg-[#c9b8a7] w-2.5 h-2.5 rounded-full border-2 border-white"></span>
                  <div className="text-xs font-bold text-[var(--text-main)]">
                    Published v1.2.0 of gql-gen
                  </div>
                  <div className="text-[10px] text-[var(--text-dim)] mt-0.5">1 week ago</div>
                </div>
              </div>
            </div>

            <div className={`${profileCardClass} feed-toolbar`}>
              <h3 className="text-[10px] font-bold text-[var(--text-dim)] uppercase tracking-wider m-0">
                DevScore
              </h3>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-[var(--text-main)]">2,840</span>
                <span className="bg-[var(--accent-tint)] feed-highlight text-[10px] px-2 py-0.5 rounded-full font-bold">
                  TOP 1%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
