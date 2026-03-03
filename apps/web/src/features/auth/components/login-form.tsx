'use client';

import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import KakaoIcon from '@/components/icons/kakao.svg';
import NaverIcon from '@/components/icons/naver.svg';
import LogoSvg from '@/components/icons/logo.svg';
import { useLoginForm } from '../hooks/use-login-form';

export function LoginForm() {
  const { form, onSubmit, rememberEmail, setRememberEmail } = useLoginForm();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className="flex w-full max-w-sm flex-col gap-8 px-4">
      <div className="flex flex-col items-center gap-3">
        <Link href="/">
          <LogoSvg className="h-6 w-auto" />
        </Link>
        <div className="flex flex-col gap-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight">로그인</h1>
          <p className="text-sm text-muted-foreground">계정에 로그인하여 쇼핑을 시작하세요.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="email">이메일</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              아이디 찾기
            </Button>
          </div>
          <Input
            id="email"
            type="email"
            placeholder="user@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">비밀번호</Label>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-xs text-muted-foreground"
            >
              비밀번호 찾기
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="remember-email"
            checked={rememberEmail}
            onCheckedChange={(checked) => setRememberEmail(checked === true)}
          />
          <Label htmlFor="remember-email" className="text-sm font-normal">
            이메일 기억하기
          </Label>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="animate-spin" />}
          로그인
        </Button>
      </form>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
          간편 로그인
        </span>
      </div>

      <div className="flex items-center justify-center gap-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full border-0 bg-[#03C75A] hover:bg-[#02b351]"
            >
              <NaverIcon className="size-5 text-white" />
              <span className="sr-only">네이버 로그인</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>네이버 로그인</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="size-11 rounded-full border-0 bg-[#FEE500] hover:bg-[#e6cf00]"
            >
              <KakaoIcon className="size-5 text-[#191919]" />
              <span className="sr-only">카카오 로그인</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>카카오 로그인</TooltipContent>
        </Tooltip>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        아직 회원이 아니신가요?{' '}
        <Button variant="link" className="h-auto p-0 text-sm font-medium" asChild>
          <Link href="/signup">회원가입</Link>
        </Button>
      </p>
    </div>
  );
}
