import { useNavigate } from "react-router-dom";

const audienceGroups = [
  "Software engineers",
  "Frontend and backend teams",
  "Open-source contributors",
  "Student developers",
];

const featureCards = [
  {
    title: "Build a profile with range",
    description:
      "Show project work, technical writing, and the kind of progress updates that make your work feel real.",
  },
  {
    title: "Share work without the noise",
    description:
      "Post milestones, ideas, and lessons learned in a space designed for builders instead of generic social clutter.",
  },
  {
    title: "Discover teams by craft",
    description:
      "Browse React, Node.js, AI, cloud, and systems communities through cleaner stack-based exploration.",
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <section className="linkedin-home">
      <div className="linkedin-home-shell">
        <section className="linkedin-home-hero">
          <div className="linkedin-home-copy">
            <span className="linkedin-eyebrow">DevHub for modern builders</span>
            <h1>Show what you are building in a space that feels like yours.</h1>
            <p>
              DevHub mixes project discovery, thoughtful posting, and a profile that highlights
              momentum, not just job history.
            </p>
            <div className="linkedin-home-actions">
              <button className="btn btn-solid" onClick={() => navigate("/register")}>
                Join now
              </button>
              <button className="btn btn-outline" onClick={() => navigate("/login")}>
                Sign in
              </button>
            </div>
          </div>

          <div className="linkedin-home-panel">
            <div className="linkedin-home-panel-card linkedin-home-panel-featured">
              <span className="panel-kicker-lite">Now trending</span>
              <strong>Find your people</strong>
              <p>See who is building in your stack and start conversations that lead to projects.</p>
            </div>
            <div className="linkedin-home-audience">
              {audienceGroups.map((group) => (
                <button
                  key={group}
                  className="linkedin-topic-pill"
                  onClick={() => navigate("/register")}
                  type="button"
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="linkedin-home-stats">
          <article>
            <strong>50K+</strong>
            <span>Developer profiles</span>
          </article>
          <article>
            <strong>1M+</strong>
            <span>Shared updates</span>
          </article>
          <article>
            <strong>200K+</strong>
            <span>Project showcases</span>
          </article>
        </section>

        <section className="linkedin-home-features">
          <div className="linkedin-section-heading">
            <span className="linkedin-eyebrow">Why DevHub feels different</span>
            <h2>A sharper, more personal home for developer work</h2>
            <p>
              The layout stays professional, but the voice is more editorial, more product-minded,
              and less like a direct copy of someone else.
            </p>
          </div>

          <div className="linkedin-feature-grid">
            {featureCards.map((card) => (
              <article key={card.title} className="linkedin-feature-card">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="linkedin-home-cta">
          <div>
            <span className="linkedin-eyebrow">Start your setup</span>
            <h2>Create a profile that highlights your work, not just your resume.</h2>
            <p>
              Sign up to publish updates, organize your stack, and make your progress easier to discover.
            </p>
          </div>
          <button className="btn btn-solid" onClick={() => navigate("/register")}>
            Create account
          </button>
        </section>
      </div>
    </section>
  );
}
