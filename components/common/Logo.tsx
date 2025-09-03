import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className = 'h-10 w-auto' }) => (
  <svg
    className={className}
    viewBox="0 0 165 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Vantage Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#64FFDA" />
        <stop offset="100%" stopColor="#52D9BC" />
      </linearGradient>
    </defs>
    {/* Stylized V */}
    <path
      d="M2 38L12 18L22 38L32 8L42 38"
      stroke="url(#logoGradient)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Text */}
    <text
      x="50"
      y="32"
      fontFamily="Inter, sans-serif"
      fontSize="30"
      fontWeight="bold"
      fill="#CCD6F6"
    >
      Vantage
    </text>
  </svg>
);

export default Logo;