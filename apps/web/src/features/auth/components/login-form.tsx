'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Loader2 } from 'lucide-react';
import KakaoIcon from '@/components/icons/kakao.svg';
import NaverIcon from '@/components/icons/naver.svg';
import { useLoginForm } from '../hooks/use-login-form';

export function LoginForm() {
  const { form, onSubmit, rememberEmail, setRememberEmail } = useLoginForm();
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">로그인</CardTitle>
        <CardDescription>이메일과 비밀번호를 입력해주세요.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              aria-invalid={!!errors.email}
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
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
          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting && <Loader2 className="animate-spin" />}
              로그인
            </Button>
            <Button type="button" variant="outline" className="w-full">
              회원가입
            </Button>
          </div>
        </form>

        <div className="flex items-center justify-center gap-1">
          <Button variant="ghost" className="h-auto px-2 py-1 text-sm text-muted-foreground">
            아이디 찾기
          </Button>
          <span className="text-muted-foreground">|</span>
          <Button variant="ghost" className="h-auto px-2 py-1 text-sm text-muted-foreground">
            비밀번호 찾기
          </Button>
        </div>

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
            소셜 로그인
          </span>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-full bg-[#03C75A] hover:bg-[#02b351]"
          >
            <NaverIcon className="size-5 text-white" />
            <span className="sr-only">네이버 로그인</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-12 rounded-full bg-[#FEE500] hover:bg-[#e6cf00]"
          >
            <KakaoIcon className="size-5 text-[#191919]" />
            <span className="sr-only">카카오 로그인</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
