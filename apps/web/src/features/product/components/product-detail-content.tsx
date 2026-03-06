'use client';

import { getImageUrl } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import type { ProductDetail } from '../types';

interface ProductDetailContentProps {
  product: ProductDetail;
}

function normalizeDescriptionHtml(html: string): string {
  if (!html) {
    return '';
  }

  return html.replace(
    /(<img[^>]*\ssrc=['"])([^'"]+)(['"][^>]*>)/gi,
    (fullMatch, prefix: string, src: string, suffix: string) => {
      if (
        src.startsWith('http://') ||
        src.startsWith('https://') ||
        src.startsWith('data:') ||
        src.startsWith('blob:')
      ) {
        return fullMatch;
      }

      return `${prefix}${getImageUrl(src)}${suffix}`;
    },
  );
}

export function ProductDetailContent({ product }: ProductDetailContentProps) {
  const specGroups = product.specGroups ?? [];
  const hasDescription = product.descriptionHtml.trim().length > 0;
  const normalizedHtml = normalizeDescriptionHtml(product.descriptionHtml);

  return (
    <section className="mx-auto w-full max-w-5xl space-y-0 px-0 pb-24 md:px-6 md:pb-10">
      {specGroups.length > 0 ? (
        <div className="space-y-3 py-6">
          <h2 className="text-xl font-bold">상품 스펙</h2>
          {specGroups.map((group) => (
            <div key={group.id} className="w-full overflow-x-auto rounded-lg border md:w-fit md:max-w-full">
              <div className="border-b bg-muted/40 px-4 py-2 text-sm font-semibold">
                {group.name}
              </div>
              <table className="w-full border-collapse text-sm md:w-fit md:min-w-[680px]">
                <tbody>
                  {group.specs.map((spec) => (
                    <tr key={spec.id} className="border-b last:border-b-0">
                      <th className="w-32 min-w-32 bg-muted/30 px-3 py-2 text-left font-medium md:w-[180px] md:min-w-[180px] md:whitespace-nowrap md:px-4">
                        {spec.label}
                      </th>
                      <td className="px-3 py-2 md:min-w-[280px] md:px-4">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ) : null}

      {specGroups.length > 0 ? <Separator /> : null}

      <div className="space-y-3 py-6">
        <h2 className="text-xl font-bold">상품 상세 정보</h2>
        {hasDescription ? (
          <div
            className="overflow-hidden bg-white p-0 text-sm leading-7 text-foreground md:p-4 [&_a]:text-primary [&_img]:mx-auto [&_img]:my-0 [&_img]:h-auto [&_img]:max-w-full [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:p-2 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-muted/30 [&_th]:p-2"
            dangerouslySetInnerHTML={{ __html: normalizedHtml }}
          />
        ) : (
          <div className="bg-muted/30 p-6 text-sm text-muted-foreground">
            등록된 상품 상세 정보가 없습니다.
          </div>
        )}
      </div>
    </section>
  );
}
