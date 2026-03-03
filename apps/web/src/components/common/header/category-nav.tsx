'use client';

import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useCategoryTree, useMainCategories } from '@/features/category/hooks/use-categories';
import { AllCategoriesPopover } from './all-categories-popover';

export function CategoryNav() {
  const { data: tree } = useCategoryTree();
  const { data: mainCategories } = useMainCategories();

  return (
    <div className="border-b">
      <div className="mx-auto flex h-10 max-w-7xl items-center gap-1 px-6">
        <AllCategoriesPopover categories={tree} />
        <Separator orientation="vertical" className="mx-1 h-4 shrink-0" />
        <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {mainCategories.map((category) => (
            <Button key={category.id} variant="ghost" size="sm" className="shrink-0 text-sm" asChild>
              <Link href={`/categories/${category.slug}`}>{category.name}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </div>
  );
}
