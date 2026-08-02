import { useEffect, useState } from "react";
import { NavLink, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import StackPage from "./pages/StackPage.jsx";
import StatusPage from "./pages/StatusPage.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import { clearAuthSession, getAuthSession } from "./services/authApi";

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authSession, setAuthSession] = useState(() => getAuthSession());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const isAuthPage = location.pathname === "/register" || location.pathname === "/login";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setAuthSession(getAuthSession());
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    if (location.pathname !== "/") {
      navigate(val ? `/?search=${encodeURIComponent(val)}` : "/");
    } else {
      if (val) {
        setSearchParams({ search: val });
      } else {
        setSearchParams({});
      }
    }
  };

  const handleLogout = () => {
    clearAuthSession();
    setAuthSession(null);
    setShowProfileMenu(false);
    navigate("/login");
  };

  const username = authSession?.user?.username || "developer";
  const displayName = authSession?.user?.fullName || username.charAt(0).toUpperCase() + username.slice(1);

  return (
    <div className="app-frame min-h-screen bg-[var(--bg-main)] flex flex-col font-sans">
      {/* GLOBAL HEADER HEADER */}
      {!isAuthPage && (
        authSession?.user ? (
          /* 1. LOGGED-IN LINKEDIN TOP NAV */
          <header className="sticky top-0 z-50 bg-[rgba(255,253,249,0.96)] border-b border-[var(--line-soft)] shadow-sm backdrop-blur w-full">
            <div className="max-w-[1128px] mx-auto px-4 h-14 flex items-center justify-between">
              {/* Logo & Search */}
              <div className="flex items-center gap-3 flex-grow md:flex-grow-0">
                <div 
                  onClick={() => navigate("/")}
                  className="feed-dark-pill font-bold text-xl rounded-xl w-9 h-9 flex items-center justify-center cursor-pointer select-none"
                >
                  D
                </div>
                
                {/* Search Input Container */}
                <div className="relative flex-grow md:flex-grow-0 max-w-xs">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)] text-[20px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={handleSearchChange}
                    className="w-full bg-[var(--accent-tint)] border border-transparent rounded-full pl-10 pr-4 py-2 text-sm text-[var(--text-main)] placeholder-[var(--text-dim)] outline-none focus:bg-white focus:border-[var(--accent)] focus:ring-2 focus:ring-[rgba(255,90,31,0.14)] transition-all duration-200"
                  />
                </div>
              </div>

              {/* Navigation Items (Desktop & Tablet) */}
              <div className="hidden md:flex items-center gap-6">
                <NavLink 
                  to="/" 
                  className={({ isActive }) =>
                    isActive
                      ? "flex flex-col items-center text-[var(--accent)] border-b-2 border-[var(--accent)] px-1 py-1 font-semibold transition-colors"
                      : "flex flex-col items-center text-[var(--text-soft)] hover:text-[var(--text-main)] px-1 py-1 transition-colors"
                  }
                >
                  <span className="material-symbols-outlined text-[24px]">home</span>
                  <span className="text-[12px] font-normal font-sans block mt-0.5">Home</span>
                </NavLink>
                <NavLink 
                  to="/stack" 
                  className={({ isActive }) =>
                    isActive
                      ? "flex flex-col items-center text-[var(--accent)] border-b-2 border-[var(--accent)] px-1 py-1 font-semibold transition-colors"
                      : "flex flex-col items-center text-[var(--text-soft)] hover:text-[var(--text-main)] px-1 py-1 transition-colors"
                  }
                >
                  <span className="material-symbols-outlined text-[24px]">explore</span>
                  <span className="text-[12px] font-normal font-sans block mt-0.5">Explore</span>
                </NavLink>
                <NavLink 
                  to="/stack" 
                  className={({ isActive }) =>
                    isActive
                      ? "flex flex-col items-center text-[var(--accent)] border-b-2 border-[var(--accent)] px-1 py-1 font-semibold transition-colors"
                      : "flex flex-col items-center text-[var(--text-soft)] hover:text-[var(--text-main)] px-1 py-1 transition-colors"
                  }
                >
                  <span className="material-symbols-outlined text-[24px]">terminal</span>
                  <span className="text-[12px] font-normal font-sans block mt-0.5">Projects</span>
                </NavLink>
                <NavLink 
                  to="/search" 
                  className={({ isActive }) =>
                    isActive
                      ? "flex flex-col items-center text-[var(--accent)] border-b-2 border-[var(--accent)] px-1 py-1 font-semibold transition-colors"
                      : "flex flex-col items-center text-[var(--text-soft)] hover:text-[var(--text-main)] px-1 py-1 transition-colors"
                  }
                >
                  <span className="material-symbols-outlined text-[24px]">groups</span>
                  <span className="text-[12px] font-normal font-sans block mt-0.5">Community</span>
                </NavLink>
                
                {/* Me Dropdown */}
                <div className="relative border-l border-[var(--line-soft)] pl-4">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex flex-col items-center text-[var(--text-soft)] hover:text-[var(--text-main)] focus:outline-none cursor-pointer bg-transparent border-none"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Cs3FnKmxvQzkJNuY_KMFgDQJIQ6iGRe0rTmqzaCCCxNexZe1OCgxF5kfCqnTpbQD3Om9UO4c8xVu1eB0R2Vb4-tqGzhiKVGopUwu5zlNvnpcwEyYefOhnbj4XCWbzC8umzJMQCtDhVWMjGSOQO70z3eQGWLI63o7LuhkupRBTqjQP6ZAPvL5o0hbUD4qlFxb9-fhANySuXcas2cTldpEC8pwr6TiF1iJYVIUv7Cfv1uRIH55TPX7fSwH7YAetDi1HFjptzqTbCY"
                      alt={username}
                      className="w-[24px] h-[24px] rounded-full object-cover"
                    />
                    <span className="text-[12px] font-normal font-sans flex items-center mt-0.5">
                      Me <span className="material-symbols-outlined text-[12px] ml-0.5 leading-none">arrow_drop_down</span>
                    </span>
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[rgba(255,253,249,0.98)] border border-[var(--line-soft)] rounded-2xl shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-[rgba(230,217,201,0.65)]">
                        <p className="font-semibold text-sm text-[var(--text-main)] truncate m-0">{displayName}</p>
                        <p className="text-xs text-[var(--text-dim)] truncate m-0">@{username}</p>
                      </div>
                      <button
                        onClick={() => { setShowProfileMenu(false); navigate("/profile"); }}
                        className="w-full text-left px-4 py-2 text-sm text-[var(--text-soft)] hover:bg-[var(--accent-tint)] hover:text-[var(--text-main)] flex items-center gap-2 border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span className="material-symbols-outlined text-sm">person</span>
                        View Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-[#b14722] hover:bg-[var(--accent-tint)] flex items-center gap-2 border-none bg-transparent cursor-pointer font-sans"
                      >
                        <span className="material-symbols-outlined text-sm">logout</span>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Mobile Profile Trigger */}
              <div className="md:hidden relative">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="w-8 h-8 rounded-full overflow-hidden border border-[var(--line-soft)] focus:outline-none bg-transparent"
                >
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9Cs3FnKmxvQzkJNuY_KMFgDQJIQ6iGRe0rTmqzaCCCxNexZe1OCgxF5kfCqnTpbQD3Om9UO4c8xVu1eB0R2Vb4-tqGzhiKVGopUwu5zlNvnpcwEyYefOhnbj4XCWbzC8umzJMQCtDhVWMjGSOQO70z3eQGWLI63o7LuhkupRBTqjQP6ZAPvL5o0hbUD4qlFxb9-fhANySuXcas2cTldpEC8pwr6TiF1iJYVIUv7Cfv1uRIH55TPX7fSwH7YAetDi1HFjptzqTbCY"
                    alt={username}
                    className="w-full h-full object-cover"
                  />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-[rgba(255,253,249,0.98)] border border-[var(--line-soft)] rounded-2xl shadow-lg py-1 z-50">
                    <div className="px-4 py-2 border-b border-[rgba(230,217,201,0.65)]">
                      <p className="font-semibold text-sm text-[var(--text-main)] truncate m-0">{displayName}</p>
                      <p className="text-xs text-[var(--text-dim)] truncate m-0">@{username}</p>
                    </div>
                    <button
                      onClick={() => { setShowProfileMenu(false); navigate("/profile"); }}
                      className="w-full text-left px-4 py-2 text-sm text-[var(--text-soft)] hover:bg-[var(--accent-tint)] hover:text-[var(--text-main)] flex items-center gap-2 border-none bg-transparent cursor-pointer font-sans"
                    >
                      <span className="material-symbols-outlined text-sm">person</span>
                      Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-[#b14722] hover:bg-[var(--accent-tint)] flex items-center gap-2 border-none bg-transparent cursor-pointer font-sans"
                    >
                      <span className="material-symbols-outlined text-sm">logout</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>
        ) : (
          /* 2. UNAUTHENTICATED LINKEDIN-STYLE LANDING HEADER */
          <header className="sticky top-0 z-50 bg-[rgba(255,253,249,0.96)] border-b border-[var(--line-soft)] shadow-sm backdrop-blur w-full">
            <div className="max-w-[1128px] mx-auto px-4 h-16 flex items-center justify-between">
              <div className="flex items-center cursor-pointer select-none" onClick={() => navigate("/")}>
                <div className="feed-dark-pill font-bold text-xl rounded-xl w-9 h-9 flex items-center justify-center mr-2">
                  D
                </div>
                <span className="font-bold text-xl text-[var(--accent)] font-sans">DevHub</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/login")}
                  className="bg-transparent border-none text-[var(--text-soft)] hover:text-[var(--text-main)] font-bold px-4 py-2 hover:bg-[rgba(31,26,23,0.05)] rounded-full transition-colors cursor-pointer text-sm font-sans"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-transparent border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent-tint)] font-bold px-5 py-2 rounded-full transition-all cursor-pointer text-sm font-sans"
                >
                  Join Now
                </button>
              </div>
            </div>
          </header>
        )
      )}

      {/* Main Content frame */}
      <main className="flex-grow w-full flex flex-col">
        <Routes>
          <Route path="/" element={authSession?.user ? <FeedPage /> : <HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/stack" element={<StackPage />} />
          <Route path="/search" element={<StatusPage />} />
          <Route path="/profile" element={authSession?.user ? <ProfilePage /> : <LoginPage />} />
        </Routes>
      </main>
    </div>
  );
}
