import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const PlusIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icon>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const CheckIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 12.5 10 17.5 19 7" />
  </Icon>
);

export const MoreVerticalIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5.5" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="12" cy="18.5" r="1.6" />
  </Icon>
);

export const SearchIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Icon>
);

export const ClockIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Icon>
);

export const PencilIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    <path d="m14.5 5.5 3 3" />
  </Icon>
);

export const CartIcon = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="9" cy="20" r="1.25" />
    <circle cx="18" cy="20" r="1.25" />
    <path d="M2.5 3h2.6l2.4 11.4a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 7H6" />
    <path d="M12 9.5v3.5M10.25 11.25h3.5" />
  </Icon>
);

export const TrashIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icon>
);

export const CloseIcon = (p: IconProps) => (
  <Icon {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Icon>
);

export const ImageIcon = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.75" />
    <path d="m21 16-5-5-9 9" />
  </Icon>
);

export const UserIcon = (p: IconProps) => (
  <Icon {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20.5c0-3.9 3.6-6.5 8-6.5s8 2.6 8 6.5V21H4Z" />
  </Icon>
);

/** The basku leaf mark: filled leaf with a canvas-colored midrib and stem. */
export const LeafIcon = ({ size = 32, ...props }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="currentColor"
      d="M28.5 3.5C16.4 3.3 7.6 9 7.1 19.6c-.1 2.4.4 4.4 1.3 5.8 10.4-.6 18.4-8.3 20.1-21.9Z"
    />
    <path
      stroke="var(--color-canvas)"
      strokeWidth="1.5"
      strokeLinecap="round"
      d="M9.5 24c3.6-5.6 8.4-10.8 14.5-15"
    />
    <path
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      d="M8.6 25.3 5 29.5"
    />
  </svg>
);
