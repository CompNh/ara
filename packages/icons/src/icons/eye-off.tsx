import type { IconProps } from "../types.js";

export const EyeOff = ({ title, ...props }: IconProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
    {...props}
  >
    {title ? <title>{title}</title> : null}

    <path
      d="M10.73 5.08A10.1 10.1 0 0 1 12 5c5 0 9 5 9 7 0 .99-.6 2.54-1.67 3.96"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.12 6.12A10.45 10.45 0 0 0 3 12c0 2 4 7 9 7 1.3 0 2.53-.26 3.67-.74"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="m3 3 18 18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14.12 14.12A3 3 0 0 1 9.88 9.88"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
