export function getUserInitials(name?: string | null): string {
  if (!name) return "U";
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return initials || "U";
}

export function getUserColor(name?: string | null): string {
  if (!name) return "bg-primary-3 text-white";
  const colors = [
    "bg-red-500 text-white",
    "bg-orange-500 text-white",
    "bg-amber-500 text-white",
    "bg-emerald-500 text-white",
    "bg-teal-500 text-white",
    "bg-cyan-500 text-white",
    "bg-sky-500 text-white",
    "bg-blue-500 text-white",
    "bg-indigo-500 text-white",
    "bg-violet-500 text-white",
    "bg-purple-500 text-white",
    "bg-fuchsia-500 text-white",
    "bg-pink-500 text-white",
    "bg-rose-500 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}
