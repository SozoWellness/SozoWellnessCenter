import { ArrowUpRight } from 'lucide-react';
import { JANE_BOOKING_URL } from '@/lib/booking';
import { ASSESSMENT_CTA } from '@/lib/inquiry';

export function JaneBookingLink({
  className = 'btn btn-primary',
  label = ASSESSMENT_CTA,
  testId,
  onClick,
}: {
  className?: string;
  label?: string;
  testId: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={JANE_BOOKING_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      aria-label={`${label} on Jane (opens in a new tab)`}
      data-testid={testId}
      onClick={onClick}
    >
      {label} <ArrowUpRight size={17} aria-hidden="true" />
    </a>
  );
}
