/**
 * Banksheet Logo — a modern shield-shaped icon with grid cells
 * representing the financial spreadsheet identity.
 * Replaces QuadraticLogo in branding contexts.
 */
export const BanksheetLogo = ({ size = 20, className }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shield outline */}
    <path
      d="M12 2L3 7v6c0 5.25 3.83 10.15 9 11.25C17.17 23.15 21 18.25 21 13V7l-9-5z"
      fill="currentColor"
      opacity="0.12"
    />
    <path
      d="M12 2L3 7v6c0 5.25 3.83 10.15 9 11.25C17.17 23.15 21 18.25 21 13V7l-9-5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Grid lines inside shield */}
    <line x1="7" y1="9" x2="17" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <line x1="7" y1="13" x2="17" y2="13" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <line x1="7" y1="17" x2="17" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    <line x1="10" y1="7" x2="10" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.6" />
    <line x1="14" y1="7" x2="14" y2="19" stroke="currentColor" strokeWidth="1" opacity="0.6" />
  </svg>
);

/**
 * Banksheet Logotype — full logo with text
 */
export const BanksheetLogoType = ({ className }: { className?: string }) => (
  <div className={`flex items-center gap-2 ${className || ''}`}>
    <BanksheetLogo size={24} className="text-foreground" />
    <span
      style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: '1rem',
        letterSpacing: '-0.02em',
        color: 'inherit',
      }}
    >
      Banksheet
    </span>
  </div>
);
