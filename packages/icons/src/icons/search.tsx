import type { IconProps } from "../types.js";
export const Search = ({ title, ...props }: IconProps) => (
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

    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" />
    <path
      d="m15.5 15.5 4.5 4.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
