import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const FOOTER_NAV = {
  shopping: {
    title: '쇼핑 안내',
    links: [
      { label: '주문 배송', href: '#' },
      { label: '취소/교환/반품 내역', href: '#' },
      { label: '상품 리뷰', href: '#' },
    ],
  },
  support: {
    title: '고객 지원',
    links: [
      { label: '1:1문의', href: '#' },
      { label: '공지사항', href: '#' },
      { label: 'FAQ', href: '#' },
    ],
  },
} as const;

const POLICY_LINKS = [
  { label: '회사소개', href: '#' },
  { label: '개인정보처리방침', href: '#', bold: true },
  { label: '이용약관', href: '#' },
  { label: '고객센터', href: '#' },
] as const;

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-400">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* 고객센터 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Customer Service
            </h3>
            <p className="text-3xl font-bold text-white">1588-0000</p>
            <div className="flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                help@starcommerce.co.kr
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                AM 09:00 ~ PM 18:00
              </span>
              <span className="text-xs">점심 : 12:00 ~ 13:00</span>
              <span className="text-xs">(토/일,공휴일휴무)</span>
            </div>
          </div>

          {/* 입금정보 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Bank Info
            </h3>
            <div className="flex flex-col gap-1.5 text-sm">
              <span>국민은행 000-000000-00-000</span>
              <span>(주)스타커머스</span>
            </div>
            <div className="flex flex-col gap-1 text-xs">
              <span>입금자명 불일치시 자동연동이 되지않습니다.</span>
              <span>고객센터(카톡)로 확인해주세요.</span>
            </div>
          </div>

          {/* 쇼핑 안내 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {FOOTER_NAV.shopping.title}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {FOOTER_NAV.shopping.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 고객 지원 */}
          <div className="flex flex-col gap-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              {FOOTER_NAV.support.title}
            </h3>
            <ul className="flex flex-col gap-2 text-sm">
              {FOOTER_NAV.support.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <Separator className="bg-zinc-800" />

      {/* 하단 사업자 정보 */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <nav className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          {POLICY_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className={`transition-colors hover:text-white ${'bold' in link && link.bold ? 'font-semibold text-white' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col gap-1 text-xs leading-relaxed">
          <p>
            사업자명 : (주)스타커머스 &nbsp;|&nbsp; 대표 : 홍길동 &nbsp;|&nbsp;
            사업자등록번호 : 123-45-67890
          </p>
          <p>
            주소 : 서울특별시 강남구 테헤란로 123, 스타빌딩 5층 &nbsp;|&nbsp;
            제안/제휴문의 : help@starcommerce.co.kr &nbsp;|&nbsp; 대표전화 : 1588-0000
          </p>
          <p>
            개인정보 보호책임자 : 홍길동 &nbsp;|&nbsp; 통신판매업 신고번호 (제
            2024-서울강남-00000호)
          </p>
        </div>
        <p className="mt-6 text-xs text-zinc-500">
          &copy; {new Date().getFullYear()} StarCommerce. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
