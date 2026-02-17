import { useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
      <div className="bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          Tailwind Test ✅
        </h1>

        <p className="text-slate-300 text-center mb-6">
          If this looks styled, Tailwind is working.
        </p>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCount((c) => c + 1)}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 transition font-semibold"
          >
            Count {count}
          </button>

          <button
            onClick={() => setCount(0)}
            className="px-5 py-2 rounded-lg border border-slate-600 hover:bg-slate-700 transition"
          >
            Reset
          </button>
        </div>

        <div className="mt-6 text-center">
          <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-green-600/20 text-green-300">
            Tailwind OK
          </span>
        </div>
      </div>
    </div>
  );
}
