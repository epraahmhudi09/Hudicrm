interface LogoProps {
  variant?: "light" | "dark";
  showTagline?: boolean;
  className?: string;
}

export default function Logo({
  variant = "light",
  showTagline = true,
  className = "",
}: LogoProps) {
  const textColor = variant === "light" ? "text-white" : "text-amtel-600";
  const taglineColor = variant === "light" ? "text-white/85" : "text-ink-500";
  const swooshColor = variant === "light" ? "#ffffff" : "#dc2626";

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <svg
        width="34"
        height="34"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M3 29C10 27 15 23 19 16C21.5 11.5 23.5 7 27 3C24 12 24 20 27 29C22 25 17 25 12 27C9 28.2 6 28.8 3 29Z"
          fill={swooshColor}
        />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`text-2xl font-extrabold tracking-tight ${textColor}`}>
          mtel
        </span>
        {showTagline && (
          <span className={`text-[10px] italic font-medium ${taglineColor} -mt-0.5`}>
            friendly calling partner
          </span>
        )}
      </div>
    </div>
  );
}
