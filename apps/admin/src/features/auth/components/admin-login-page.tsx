'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login, me, refresh, type BoLoginDto } from '@/api/bo';
import { Button } from '@/components/ui/button';
import {
  getApiErrorMessage,
  isApiSuccess,
} from '@/lib/api-response';
import { toast } from 'sonner';

export function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void (async () => {
        const meResponse = await me();
        if (isApiSuccess(meResponse)) {
          router.replace('/dashboard');
          return;
        }

        if (meResponse.status === 401) {
          const refreshResponse = await refresh();
          if (isApiSuccess(refreshResponse)) {
            const retryMeResponse = await me();
            if (isApiSuccess(retryMeResponse)) {
              router.replace('/dashboard');
              return;
            }
          }
        }

        setLoading(false);
      })();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setPending(true);

    const payload: BoLoginDto = {
      username: username.trim(),
      password,
    };

    const response = await login(payload);

    if (!isApiSuccess(response)) {
      toast.error('로그인 실패', {
        description: getApiErrorMessage(response, '로그인에 실패했습니다.'),
      });
      setPending(false);
      return;
    }

    toast.success('로그인 성공');
    router.replace('/dashboard');
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-900">
        <p className="text-sm tracking-wide">관리자 인증 상태를 확인하는 중입니다...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <section className="mx-auto grid min-h-screen w-full max-w-[1280px] overflow-hidden md:grid-cols-2">
        <div className="relative hidden bg-gradient-to-br from-indigo-500 via-sky-500 to-cyan-400 p-16 text-slate-900 md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute left-10 top-14 h-40 w-40 rounded-full bg-white/70 blur-2xl" />
            <div className="absolute bottom-12 right-10 h-52 w-52 rounded-full bg-cyan-100 blur-2xl" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em]">Ecommerce Admin</p>
            <h1 className="mt-4 text-4xl font-black leading-tight">
              운영 지표와 카테고리
              <br />
              관리를 한 곳에서
            </h1>
          </div>
          <p className="relative z-10 max-w-md text-sm font-semibold leading-relaxed">
            백오피스 로그인은 일반 아이디/비밀번호 방식만 지원합니다. 소셜 로그인은 제공하지 않습니다.
          </p>
        </div>

        <div className="flex items-center justify-center px-6 py-12 md:px-16">
          <form className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-2xl font-bold">Admin Login</h2>
              <p className="mt-2 text-sm text-slate-500">아이디와 비밀번호를 입력하세요.</p>
            </div>

            <label className="block space-y-2">
              <span className="text-sm text-slate-700">아이디</span>
              <input
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-400 transition focus:ring-2"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="username"
                autoComplete="username"
                required
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm text-slate-700">비밀번호</span>
              <input
                type="password"
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none ring-cyan-400 transition focus:ring-2"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="password"
                autoComplete="current-password"
                required
              />
            </label>

            <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={pending}>
              {pending ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </div>
      </section>
    </main>
  );
}
