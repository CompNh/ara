import type { IconProps } from "../types.js";
export const CheckCircle = ({ title, ...props }: IconProps) => (
  <svg
    {...props}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden={title ? undefined : true}
    role={title ? "img" : undefined}
  >
    {title ? <title>{title}</title> : null}

    <path
      d="M9.5 12.5l1.75 1.75L15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round" />
    <path
      d="M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9z"
      stroke="currentColor"
      strokeWidth="2" />
  </svg>
);
