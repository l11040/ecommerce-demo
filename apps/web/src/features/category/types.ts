export interface CategoryTreeNode {
  id: number;
  parentId: number | null;
  depth: number;
  path: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  isVisible: boolean;
  isMainExposed: boolean;
  children: CategoryTreeNode[];
}

export interface CategoryItem {
  id: number;
  parentId: number | null;
  depth: number;
  path: string;
  name: string;
  slug: string;
  sortOrder: number;
  isMainExposed: boolean;
}
