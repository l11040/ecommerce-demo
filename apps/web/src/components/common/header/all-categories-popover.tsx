'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { CategoryTreeNode } from '@/features/category/types';

interface AllCategoriesPopoverProps {
  categories: CategoryTreeNode[];
}

function CategoryListItem({
  category,
  isActive,
  onHover,
}: {
  category: CategoryTreeNode;
  isActive: boolean;
  onHover: () => void;
}) {
  return (
    <li>
      <Link
        href={`/categories/${category.slug}`}
        onMouseEnter={onHover}
        className={`flex w-full items-center justify-between px-3 py-2.5 text-[15px] transition-colors hover:bg-accent ${
          isActive ? 'bg-accent font-medium' : ''
        }`}
      >
        {category.name}
        {category.children.length > 0 && (
          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </Link>
    </li>
  );
}

function CategoryPanel({
  parent,
  categories,
  activeId,
  onHover,
}: {
  parent: CategoryTreeNode;
  categories: CategoryTreeNode[];
  activeId: number | null;
  onHover: (id: number) => void;
}) {
  return (
    <>
      <Separator orientation="vertical" className="h-auto" />
      <div className="w-48">
        <div className="px-3 pt-3 pb-1">
          <Link
            href={`/categories/${parent.slug}`}
            className="text-sm font-semibold text-primary transition-colors hover:underline"
          >
            {parent.name} 전체 보기
          </Link>
        </div>
        <ul className="flex flex-col py-1">
          {categories.map((cat) => (
            <CategoryListItem
              key={cat.id}
              category={cat}
              isActive={activeId === cat.id}
              onHover={() => onHover(cat.id)}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

export function AllCategoriesPopover({ categories }: AllCategoriesPopoverProps) {
  const [activeIds, setActiveIds] = useState<(number | null)[]>([null, null, null]);

  const activeRoot = categories.find((c) => c.id === activeIds[0]);
  const activeSub = activeRoot?.children.find((c) => c.id === activeIds[1]);
  const activeLeaf = activeSub?.children.find((c) => c.id === activeIds[2]);

  const setActiveAtDepth = (depth: number, id: number) => {
    setActiveIds((prev) => {
      const next = [...prev];
      next[depth] = id;
      for (let i = depth + 1; i < next.length; i++) {
        next[i] = null;
      }
      return next;
    });
  };

  return (
    <Popover onOpenChange={() => setActiveIds([null, null, null])}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 text-sm font-medium">
          <Menu className="h-4 w-4" />
          전체 카테고리
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="flex w-auto min-w-48 p-0"
        sideOffset={8}
      >
        {/* 패널 1: depth 1 */}
        <ul className="flex w-48 flex-col py-2">
          {categories.map((root) => (
            <CategoryListItem
              key={root.id}
              category={root}
              isActive={activeIds[0] === root.id}
              onHover={() => setActiveAtDepth(0, root.id)}
            />
          ))}
        </ul>

        {/* 패널 2: depth 2 */}
        {activeRoot && activeRoot.children.length > 0 && (
          <CategoryPanel
            parent={activeRoot}
            categories={activeRoot.children}
            activeId={activeIds[1]}
            onHover={(id) => setActiveAtDepth(1, id)}
          />
        )}

        {/* 패널 3: depth 3 */}
        {activeSub && activeSub.children.length > 0 && (
          <CategoryPanel
            parent={activeSub}
            categories={activeSub.children}
            activeId={activeIds[2]}
            onHover={(id) => setActiveAtDepth(2, id)}
          />
        )}

        {/* 패널 4: depth 4 */}
        {activeLeaf && activeLeaf.children.length > 0 && (
          <>
            <Separator orientation="vertical" className="h-auto" />
            <div className="w-48">
              <div className="px-3 pt-3 pb-1">
                <Link
                  href={`/categories/${activeLeaf.slug}`}
                  className="text-sm font-semibold text-primary transition-colors hover:underline"
                >
                  {activeLeaf.name} 전체 보기
                </Link>
              </div>
              <ul className="flex flex-col py-1">
                {activeLeaf.children.map((leaf) => (
                  <li key={leaf.id}>
                    <Link
                      href={`/categories/${leaf.slug}`}
                      className="block px-3 py-2.5 text-[15px] transition-colors hover:bg-accent"
                    >
                      {leaf.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
