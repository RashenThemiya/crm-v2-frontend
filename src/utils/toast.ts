export function toast(msg: string, isError?: boolean) {
  const el = document.createElement("div");
  el.textContent = msg;
  el.className = [
    "fixed z-[9999] left-1/2 top-6 -translate-x-1/2",
    "rounded-xl px-4 py-2 text-sm font-semibold shadow-lg border",
    isError
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-sky-50 text-sky-800 border-sky-200",
  ].join(" ");
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
}
