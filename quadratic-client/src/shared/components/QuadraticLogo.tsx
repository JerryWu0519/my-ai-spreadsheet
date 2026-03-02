import { BanksheetLogo } from '@/shared/components/BanksheetLogo';

/**
 * Proxy: existing code imports QuadraticLogo — now renders the Banksheet brand.
 * The `singleColor` prop is ignored (Banksheet logo uses currentColor).
 */
export const QuadraticLogo = ({ singleColor: _singleColor }: { singleColor?: boolean }) => (
  <BanksheetLogo size={20} className="text-current" />
);

export const QuadraticLogo7px = () => <BanksheetLogo size={23} className="text-current" />;
