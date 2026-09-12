interface UserInitialsProps {
  name: string;
  className?: string;
}

export default function UserInitials({
  name,
  className = "",
}: UserInitialsProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className={`w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-primary-3 flex items-center justify-center text-white text-base sm:text-lg font-semibold shrink-0 shadow-xs animate-in fade-in duration-200 ${className}`}
    >
      {initials || "U"}
    </div>
  );
}
