'use client';

import Link from 'next/link';
import { Search, User, LogIn } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useCategoryTree } from '@/features/category/hooks/use-categories';
import type { CategoryTreeNode } from '@/features/category/types';

interface MobileMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function MobileCategoryChildren({
  categories,
  onNavigate,
}: {
  categories: CategoryTreeNode[];
  onNavigate: () => void;
}) {
  if (categories.length === 0) return null;

  const hasGrandchildren = categories.some((c) => c.children.length > 0);

  if (!hasGrandchildren) {
    return (
      <ul className="flex flex-col">
        {categories.map((child) => (
          <li key={child.id}>
            <Link
              href={`/categories/${child.slug}`}
              onClick={onNavigate}
              className="block px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              {child.name}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      {categories.map((child) =>
        child.children.length > 0 ? (
          <AccordionItem key={child.id} value={String(child.id)} className="border-none">
            <AccordionTrigger className="py-2 px-3 text-sm text-muted-foreground hover:no-underline hover:bg-accent">
              {child.name}
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-3">
              <Link
                href={`/categories/${child.slug}`}
                onClick={onNavigate}
                className="block px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
              >
                전체 보기
              </Link>
              <MobileCategoryChildren categories={child.children} onNavigate={onNavigate} />
            </AccordionContent>
          </AccordionItem>
        ) : (
          <li key={child.id} className="list-none">
            <Link
              href={`/categories/${child.slug}`}
              onClick={onNavigate}
              className="block px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent"
            >
              {child.name}
            </Link>
          </li>
        ),
      )}
    </Accordion>
  );
}

export function MobileMenuDrawer({ open, onOpenChange }: MobileMenuDrawerProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { data: categoryTree } = useCategoryTree();

  const close = () => onOpenChange(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 overflow-y-auto p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="text-left text-base">메뉴</SheetTitle>
        </SheetHeader>

        <div className="px-4 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="검색어를 입력하세요"
              className="pl-9"
            />
          </div>
        </div>

        <Separator />

        <nav className="flex flex-col py-2">
          <Link
            href="/"
            onClick={close}
            className="px-4 py-3 text-sm font-medium transition-colors hover:bg-accent"
          >
            홈
          </Link>
        </nav>

        <Separator />

        {categoryTree.length > 0 && (
          <>
            <div className="px-4 pt-3 pb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                카테고리
              </span>
            </div>
            <Accordion type="single" collapsible className="w-full px-2 pb-2">
              {categoryTree.map((root) => (
                <AccordionItem key={root.id} value={String(root.id)} className="border-none">
                  <AccordionTrigger className="py-2.5 px-2 text-sm font-medium hover:no-underline hover:bg-accent rounded-md">
                    {root.name}
                  </AccordionTrigger>
                  <AccordionContent className="pb-0 pl-2">
                    <Link
                      href={`/categories/${root.slug}`}
                      onClick={close}
                      className="block rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-accent"
                    >
                      전체 보기
                    </Link>
                    <MobileCategoryChildren categories={root.children} onNavigate={close} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <Separator />
          </>
        )}

        <div className="flex flex-col gap-1 p-4">
          {isAuthenticated ? (
            <>
              <div className="mb-2 text-sm text-muted-foreground">
                {user?.displayName ?? user?.email}님
              </div>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/mypage" onClick={close}>
                  <User className="mr-2 h-4 w-4" />
                  마이페이지
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="justify-start"
                onClick={() => {
                  logout();
                  close();
                }}
              >
                로그아웃
              </Button>
            </>
          ) : (
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/login" onClick={close}>
                <LogIn className="mr-2 h-4 w-4" />
                로그인
              </Link>
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
