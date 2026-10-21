interface LogoProps {
  className?: string;
}

export function Logo({ className = 'w-9 h-6 text-white' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 41 22"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Main peak right slope & cap */}
      <path d="M22 0L37 17H29L22 7L16 17H12L20 4L22 0Z" />
      {/* Main peak inner shadow / ridge line */}
      <path d="M22 7L27 17H32L24 5L22 7Z" opacity="0.4" />
      {/* Secondary left peak */}
      <path d="M9 7L15 17H7L4 17L9 7Z" />
      {/* Far left ridgelet */}
      <path d="M2 14L4 17H0L2 14Z" opacity="0.6" />
    </svg>
  );
}
