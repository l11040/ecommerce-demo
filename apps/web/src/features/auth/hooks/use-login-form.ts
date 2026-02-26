'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/api/fo';
import type { Login200 } from '@/api/fo';
import type { ApiError } from '@/lib/fetcher';
import { useAuthStore } from '../auth-store';

const REMEMBER_EMAIL_KEY = 'fo_remember_email';

const loginSchema = z.object({
  email: z.string().email('올바른 이메일을 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function useLoginForm() {
  const router = useRouter();
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const [rememberEmail, setRememberEmail] = useState(false);
  const initialized = useRef(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
    if (saved) {
      form.setValue('email', saved);
      setRememberEmail(true); // eslint-disable-line react-hooks/set-state-in-effect -- localStorage 초기화
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = (await login(values)) as unknown as Login200;

      if (result.success) {
        if (rememberEmail) {
          localStorage.setItem(REMEMBER_EMAIL_KEY, values.email);
        } else {
          localStorage.removeItem(REMEMBER_EMAIL_KEY);
        }

        await fetchMe();
        router.replace('/');
      }
    } catch (error) {
      const err = error as ApiError;
      form.setError('root', {
        message:
          err.status === 401
            ? '이메일 또는 비밀번호가 올바르지 않습니다.'
            : '로그인에 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    }
  });

  return { form, onSubmit, rememberEmail, setRememberEmail };
}
