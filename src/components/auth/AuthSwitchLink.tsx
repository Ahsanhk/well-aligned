import Link from 'next/link';

interface Props {
  prompt: string;
  label: string;
  href: string;
}

export function AuthSwitchLink({ prompt, label, href }: Props) {
  return (
    <p className="text-sm text-muted">
      {prompt}{' '}
      <Link href={href} className="font-medium text-accent transition-colors duration-150 hover:text-accent-strong">
        {label}
      </Link>
    </p>
  );
}
