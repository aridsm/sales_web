interface UserInitialsProps {
  name: string;
}

export default function UserInitials({ name }: UserInitialsProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="w-14 h-14 rounded-full bg-primary-3 flex items-center justify-center text-white text-lg font-semibold shrink-0 shadow-xs animate-in fade-in duration-200">
      {initials || "U"}
    </div>
  );
}
