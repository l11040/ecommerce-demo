'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ChevronDown,
  ChevronRight,
  FolderTree,
  LayoutDashboard,
  Layers,
  ListTree,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { logout } from '@/api/bo';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getApiErrorMessage, isApiSuccess } from '@/lib/api-response';
import { toast } from 'sonner';

type AdminShellProps = {
  children: ReactNode;
  username: string;
};

const mainMenuItems = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/products', label: '상품 관리', icon: Layers },
  { href: '/settings', label: '설정', icon: Settings },
];

const categorySubMenus = [
  { href: '/categories', label: '카테고리 목록', icon: ListTree },
  { href: '/categories/new', label: '카테고리 추가', icon: PlusCircle },
  { href: '/categories/edit', label: '카테고리 수정', icon: Pencil },
];

const activeMenuClass = 'bg-slate-100 text-slate-900 ring-1 ring-inset ring-slate-200';
const inactiveMenuClass = 'text-slate-700 hover:bg-slate-100 hover:text-slate-900';

export function AdminShell({ children, username }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(true);

  const isCategoryRoute = pathname.startsWith('/categories');
  const matchedCategorySubMenu = categorySubMenus.find((menu) => pathname === menu.href);

  const currentMenuLabel =
    matchedCategorySubMenu?.label ??
    mainMenuItems.find((menu) => pathname.startsWith(menu.href))?.label ??
    '관리자';

  async function handleLogout() {
    setLogoutPending(true);

    const response = await logout();

    if (!isApiSuccess(response)) {
      toast.error('로그아웃 실패', {
        description: getApiErrorMessage(
          response,
          '로그아웃 중 오류가 발생했습니다.',
        ),
      });
      setLogoutPending(false);
      return;
    }

    toast.success('로그아웃 완료');
    router.replace('/login');
  }

  return (
    <TooltipProvider>
      <main className="min-h-screen bg-slate-50 text-slate-900">
      <aside
        className={`fixed inset-y-0 left-0 z-40 hidden overflow-hidden border-r border-slate-200 bg-white transition-all md:flex md:flex-col ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`border-b border-slate-200 px-4 py-4 ${
            sidebarCollapsed ? 'flex justify-center' : 'flex items-center justify-between'
          }`}
        >
          {!sidebarCollapsed ? (
            <div className="overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Ecommerce</p>
              <h2 className="mt-1 text-base font-semibold">Admin Dashboard</h2>
            </div>
          ) : null}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => setSidebarCollapsed((prev) => !prev)}
                aria-label={sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}
              >
                {sidebarCollapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
              </button>
            </TooltipTrigger>
            <TooltipContent sideOffset={3}>{sidebarCollapsed ? '사이드바 펼치기' : '사이드바 접기'}</TooltipContent>
          </Tooltip>
        </div>

        <nav className="flex-1 space-y-1 px-2 py-4">
          {mainMenuItems.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname.startsWith(menu.href);

            const menuLink = (
              <Link
                key={menu.href}
                href={menu.href}
                className={`flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                  sidebarCollapsed ? 'justify-center' : 'gap-2'
                } ${
                  isActive ? activeMenuClass : inactiveMenuClass
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {!sidebarCollapsed ? <span>{menu.label}</span> : null}
              </Link>
            );

            if (!sidebarCollapsed) {
              return <div key={menu.href}>{menuLink}</div>;
            }

            return (
              <Tooltip key={menu.href}>
                <TooltipTrigger asChild>{menuLink}</TooltipTrigger>
                <TooltipContent side="right" sideOffset={3}>{menu.label}</TooltipContent>
              </Tooltip>
            );
          })}

          {sidebarCollapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/categories"
                  className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isCategoryRoute ? activeMenuClass : inactiveMenuClass
                  }`}
                >
                  <FolderTree className="size-4 shrink-0" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" sideOffset={3}>
                카테고리
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isCategoryRoute ? activeMenuClass : inactiveMenuClass
                }`}
              >
                <span className="flex items-center gap-2">
                  <FolderTree className="size-4 shrink-0" />
                  카테고리
                </span>
                {categoryMenuOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
              </button>

              {categoryMenuOpen ? (
                <div className="mt-1 space-y-1 pl-4">
                  {categorySubMenus.map((menu) => {
                    const Icon = menu.icon;
                    const isActive = pathname === menu.href;

                    return (
                      <Link
                        key={menu.href}
                        href={menu.href}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                          isActive ? activeMenuClass : inactiveMenuClass
                        }`}
                      >
                        <Icon className="size-4 shrink-0" />
                        <span>{menu.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}
        </nav>

        <div className="border-t border-slate-200 px-4 py-4">
          {!sidebarCollapsed ? <p className="text-xs text-slate-500">로그인 사용자</p> : null}
          {sidebarCollapsed ? (
            <div className="mx-auto flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
              {username.slice(0, 1).toUpperCase()}
            </div>
          ) : (
            <p className="mt-1 text-sm font-semibold">{username}</p>
          )}
        </div>
      </aside>

      <div className={sidebarCollapsed ? 'min-h-screen md:pl-20' : 'min-h-screen md:pl-64'}>
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Back Office</p>
              <h1 className="mt-1 text-2xl font-bold">{currentMenuLabel}</h1>
            </div>
            <Button type="button" variant="outline" onClick={() => void handleLogout()} disabled={logoutPending}>
              {logoutPending ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        </header>

        <div className="space-y-6 px-5 py-6 md:px-8">{children}</div>
      </div>
      </main>
    </TooltipProvider>
  );
}
