const items = [
  "Node.js server entry with nodemon for local backend development",
  "Express application exported from src/app.js",
  "Vite for frontend bundling and fast reloads",
  "React Router for route-driven console views",
  "Health endpoint exposed for UI-to-API connectivity"
];

export default function StackPage() {
  return (
    <div className="w-full bg-[#f4f2ee] text-black/90 font-sans pb-16 pt-6 flex-grow">
      <div className="max-w-[800px] mx-auto px-4">
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#0a66c2] m-0">System map</p>
            <h2 className="text-xl font-bold text-black/90 mt-1 m-0 font-sans">Stack layers</h2>
            <p className="text-xs text-black/60 mt-2 m-0 leading-relaxed">
              The repo is split into a backend service and a frontend control layer
              so each side can evolve independently.
            </p>
          </div>

          <ul className="flex flex-col gap-2 p-0 m-0 list-none">
            {items.map((item) => (
              <li key={item} className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 text-xs text-black/80 font-sans leading-relaxed">
                {item}
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <article className="bg-[#edf3f8] p-4 rounded-lg border border-transparent">
              <span className="block text-[10px] font-bold text-[#0a66c2] uppercase tracking-wider mb-1">backend/server.js</span>
              <strong className="block text-xs text-black/80 font-semibold leading-relaxed">Boots the Express process on port 5000.</strong>
            </article>
            <article className="bg-[#edf3f8] p-4 rounded-lg border border-transparent">
              <span className="block text-[10px] font-bold text-[#0a66c2] uppercase tracking-wider mb-1">backend/src/app.js</span>
              <strong className="block text-xs text-black/80 font-semibold leading-relaxed">Defines the root route and health response.</strong>
            </article>
            <article className="bg-[#edf3f8] p-4 rounded-lg border border-transparent">
              <span className="block text-[10px] font-bold text-[#0a66c2] uppercase tracking-wider mb-1">frontend/vite.config.js</span>
              <strong className="block text-xs text-black/80 font-semibold leading-relaxed">Proxies /api to the backend during development.</strong>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
