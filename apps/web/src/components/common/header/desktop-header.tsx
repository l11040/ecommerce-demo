'use client';

import Link from 'next/link';
import { Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Logo } from './logo';
import { CartBadge } from './cart-badge';

export function DesktopHeader() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="border-b">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Logo />

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input type="search" placeholder="검색어를 입력하세요" className="pl-9" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <CartBadge />
            </TooltipTrigger>
            <TooltipContent>장바구니</TooltipContent>
          </Tooltip>
          {isAuthenticated ? (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/mypage">
                      <User className="h-5 w-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>마이페이지</TooltipContent>
              </Tooltip>
              <Button variant="ghost" size="sm" onClick={logout}>
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">로그인</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
