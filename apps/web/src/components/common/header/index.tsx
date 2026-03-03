import { DesktopHeader } from './desktop-header';
import { MobileHeader } from './mobile-header';
import { CategoryNav } from './category-nav';
import { HeaderRoot } from './header-root';

export function Header() {
  return (
    <HeaderRoot>
      <header className="hidden md:block">
        <DesktopHeader />
        <CategoryNav />
      </header>
      <MobileHeader />
    </HeaderRoot>
  );
}
