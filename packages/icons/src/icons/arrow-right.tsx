import type { IconProps } from "../types.js";
export const ArrowRight = ({ title, ...props }: IconProps) => (
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
      d="M4 11h10.17l-3.58-3.59L12 6l6 6-6 6-1.41-1.41L14.17 13H4z"
      fill="currentColor" />
  </svg>
);
