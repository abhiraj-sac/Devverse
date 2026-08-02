import { useEffect, useState } from "react";

export default function StatusPage() {
  const [state, setState] = useState({
    loading: true,
    checkedAt: "",
    error: "",
    data: null
  });

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();

        if (!cancelled) {
          setState({
            loading: false,
            checkedAt: new Date().toLocaleTimeString(),
            error: "",
            data
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            loading: false,
            checkedAt: new Date().toLocaleTimeString(),
            error: error.message || "Unable to reach the backend.",
            data: null
          });
        }
      }
    }

    loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full bg-[#f4f2ee] text-black/90 font-sans pb-16 pt-6 flex-grow">
      <div className="max-w-[800px] mx-auto px-4">
        <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#0a66c2] m-0">Live signal</p>
            <h2 className="text-xl font-bold text-black/90 mt-1 m-0 font-sans">Backend status</h2>
            <p className="text-xs text-black/60 mt-2 m-0 leading-relaxed">
              This view pulls live data from the Express API so the frontend stays
              tied to the backend rather than a static mock.
            </p>
          </div>

          {state.loading && (
            <p className="text-xs text-black/60 italic my-4 text-center">Checking backend...</p>
          )}

          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 text-xs">
              <strong className="text-red-800 font-bold block mb-1">Connection error</strong>
              <p className="text-red-700 m-0">{state.error}</p>
            </div>
          )}

          {state.data && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-[#edf3f8] border border-transparent rounded-lg p-4 flex flex-col gap-3">
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                  <span className="text-xs text-black/60">Name</span>
                  <strong className="text-xs text-black/95 font-bold">{state.data.name}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                  <span className="text-xs text-black/60">Status</span>
                  <strong className="text-xs text-emerald-800 font-bold">{state.data.status}</strong>
                </div>
                <div className="flex justify-between items-center border-b border-gray-200/50 pb-2">
                  <span className="text-xs text-black/60">Port</span>
                  <strong className="text-xs text-black/95 font-bold">{state.data.port}</strong>
                </div>
                <div className="flex justify-between items-center pb-1">
                  <span className="text-xs text-black/60">Checked at</span>
                  <strong className="text-xs text-black/95 font-bold">{state.checkedAt || state.data.timestamp}</strong>
                </div>
              </div>

              <div className="bg-[#f8f9fa] border border-gray-200 rounded-lg p-4">
                <span className="block text-[10px] font-bold text-black/45 uppercase tracking-wider mb-2">Raw payload</span>
                <pre className="font-mono text-[10px] text-black/80 bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap word-break break-all">
                  {JSON.stringify(state.data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
