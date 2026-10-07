export default function AppLogo({
  className = "w-8 h-8",
  color = "var(--primary, #2563eb)",
  bgColor,
  iconColor,
  showBackground = false,
}: {
  className?: string;
  color?: string;
  bgColor?: string;
  iconColor?: string;
  showBackground?: boolean;
}) {
  const activeColor = iconColor || color;

  if (showBackground) {
    return (
      <svg
        className={className}
        viewBox="0 0 480 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          width="480"
          height="480"
          rx="96"
          fill={bgColor || "var(--primary, #2563eb)"}
        />
        <g transform="scale(0.65) translate(129, 129)">
          <path
            d="M160 160h160v160H160zM0 320h160v160H0zM0 0h160v160H0zM320 320h160v160H320zM320 0h160v160H320z"
            fill={activeColor === "var(--primary, #2563eb)" ? "#ffffff" : activeColor}
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      className={className}
      viewBox="0 0 480 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M160 160h160v160H160zM0 320h160v160H0zM0 0h160v160H0zM320 320h160v160H320zM320 0h160v160H320z"
        fill={activeColor}
      />
    </svg>
  );
}
