'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';
import { CartBadge } from './cart-badge';
import { MobileMenuDrawer } from './mobile-menu-drawer';

export function MobileHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">메뉴</span>
        </Button>

        <Logo />

        <CartBadge />
      </div>

      <MobileMenuDrawer open={open} onOpenChange={setOpen} />
    </header>
  );
}
