'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminShell } from '@/features/admin/components/admin-shell';
import { useAdminSession } from '@/features/admin/hooks/use-admin-session';

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const session = useAdminSession();

  useEffect(() => {
    if (!session.loading && !session.authenticated) {
      router.replace('/login');
    }
  }, [router, session.authenticated, session.loading]);

  if (session.loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
        <p className="text-sm tracking-wide">관리자 인증 상태를 확인하는 중입니다...</p>
      </main>
    );
  }

  if (!session.authenticated) {
    return null;
  }

  return <AdminShell username={session.username}>{children}</AdminShell>;
}
