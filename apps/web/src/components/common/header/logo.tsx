import Link from 'next/link';
import LogoSvg from '@/components/icons/logo.svg';

export function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <LogoSvg className="h-4 w-auto md:h-5" />
    </Link>
  );
}
