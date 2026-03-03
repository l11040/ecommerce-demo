'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCategoryStore } from '../category-store';

export function useCategoryTree() {
  const { data, isLoading, fetchCategories } = useCategoryStore(
    useShallow((s) => ({
      data: s.tree,
      isLoading: s.isLoading,
      fetchCategories: s.fetchCategories,
    })),
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, isLoading };
}

export function useMainCategories() {
  const { data, isLoading, fetchCategories } = useCategoryStore(
    useShallow((s) => ({
      data: s.mainCategories,
      isLoading: s.isLoading,
      fetchCategories: s.fetchCategories,
    })),
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { data, isLoading };
}
