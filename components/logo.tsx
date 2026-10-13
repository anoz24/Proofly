export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Proofly"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="13" fill="#1F4FE0" />
      <path
        d="M14 25.5 L21 32.5"
        stroke="#9CC7FF"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21 32.5 L34 16.5"
        stroke="#FFFFFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function LogoMarkInverted({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Proofly"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="48" height="48" rx="13" fill="#FFFFFF" />
      <path
        d="M14 25.5 L21 32.5"
        stroke="#4F8CFF"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M21 32.5 L34 16.5"
        stroke="#1F4FE0"
        strokeWidth="4.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({
  size = 36,
  tone = "light",
}: {
  size?: number;
  tone?: "light" | "dark";
}) {
  const proofColor = tone === "dark" ? "text-white" : "text-midnight";
  const lyColor = tone === "dark" ? "text-sky" : "text-proof";
  return (
    <span className="inline-flex items-center gap-3">
      {tone === "dark" ? (
        <LogoMarkInverted size={size} />
      ) : (
        <LogoMark size={size} />
      )}
      <span
        className={`font-display font-semibold leading-none tracking-[-0.03em] ${proofColor}`}
        style={{ fontSize: size * 0.78 }}
      >
        proof<span className={lyColor}>ly</span>
      </span>
    </span>
  );
}
