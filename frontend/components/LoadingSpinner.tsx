"use client";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2 mb-4">
          <img src="/logo.png" alt="Legal Connect" className="h-8 w-8" />
          <span className="font-semibold text-lg text-lctextprimary">Legal Connect</span>
        </div>

        {/* Animated dots */}
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full bg-lcaccent-client"
            style={{
              animation: 'pulse 1.4s infinite',
              animationDelay: '0s',
            }}
          />
          <div
            className="h-3 w-3 rounded-full bg-lcaccent-attorney"
            style={{
              animation: 'pulse 1.4s infinite',
              animationDelay: '0.2s',
            }}
          />
          <div
            className="h-3 w-3 rounded-full bg-lcaccent"
            style={{
              animation: 'pulse 1.4s infinite',
              animationDelay: '0.4s',
            }}
          />
        </div>

        {/* Loading text */}
        <p className="text-sm text-lctextsecondary mt-4">Loading...</p>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
}
