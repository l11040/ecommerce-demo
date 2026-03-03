import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="text-7xl font-bold tracking-tighter text-muted-foreground/30">404</span>
        <h1 className="text-xl font-semibold tracking-tight">페이지를 찾을 수 없습니다</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
        </p>
      </div>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
