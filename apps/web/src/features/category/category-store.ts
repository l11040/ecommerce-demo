'use client';

import { create } from 'zustand';
import { tree, main } from '@/api/fo';
import type { Tree200, Main200 } from '@/api/fo';
import type { CategoryTreeNode, CategoryItem } from './types';

interface CategoryState {
  tree: CategoryTreeNode[];
  mainCategories: CategoryItem[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  tree: [],
  mainCategories: [],
  isLoading: true,

  fetchCategories: async () => {
    if (get().tree.length > 0) return;

    try {
      set({ isLoading: true });
      const [treeRes, mainRes] = await Promise.all([tree(), main()]);
      const treeResult = treeRes as unknown as Tree200;
      const mainResult = mainRes as unknown as Main200;

      set({
        tree: treeResult.success ? (treeResult.data as unknown as CategoryTreeNode[]) : [],
        mainCategories: mainResult.success ? (mainResult.data as unknown as CategoryItem[]) : [],
      });
    } catch {
      // keep existing data
    } finally {
      set({ isLoading: false });
    }
  },
}));
