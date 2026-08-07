export default function ThreeBoxesIcon() {
  return (
    <svg
      width={50}
      height={50}
      viewBox="0 0 512 512"
      xmlns="http://www.w3.org/2000/svg"
      className="h-8 w-8"
    >
      <defs>
        <linearGradient id="homepageBrandsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4275E4" />
          <stop offset="100%" stopColor="#A1BCF4" />
        </linearGradient>
      </defs>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="url(#homepageBrandsGradient)">
          <rect x="1.5" y="5" width="5.5" height="5.5" rx="1.25" />
          <rect x="9.25" y="5" width="5.5" height="5.5" rx="1.25" />
          <rect x="17" y="5" width="5.5" height="5.5" rx="1.25" />
          <path d="M4.25 13.5h15.5a1.5 1.5 0 0 1 1.5 1.5v3.75a1.25 1.25 0 0 1-1.25 1.25H3.75a1.25 1.25 0 0 1-1.25-1.25V15a1.5 1.5 0 0 1 1.5-1.5zm1.5 2.25v2.25h14.5v-2.25H5.75z" />
        </g>
      </svg>
    </svg>
  );
}
