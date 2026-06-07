"use client";

interface AppLoadingProps {
  className?: string;
}

export default function AppLoading({ className = "" }: AppLoadingProps) {
  return (
    <div className={`flex items-center justify-center py-6 ${className}`}>
      <style>{`
        @keyframes orbit-pulse {
          0%, 100% {
            transform: translateY(-8px);
          }
          50% {
            transform: translateY(-18px);
          }
        }
        .animate-orbit-pulse {
          animation: orbit-pulse 1.2s ease-in-out infinite;
        }
      `}</style>
      <div className="relative w-10 h-10 animate-[spin_2s_linear_infinite]">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 -ml-1 -mt-1"
            style={{
              transform: `rotate(${i * 90}deg)`,
            }}
          >
            <div className="w-2 h-2 bg-primary rounded-full animate-orbit-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}
