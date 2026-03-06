import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const IMAGE_BASE_URL =
  process.env.NEXT_PUBLIC_IMAGE_BASE_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:40003';

/**
 * DB에 저장된 이미지 경로를 실제 접근 가능한 URL로 변환한다.
 * - 로컬: /uploads/products/xxx.jpg → http://localhost:40003/uploads/products/xxx.jpg
 * - CDN:  /uploads/products/xxx.jpg → https://cdn.example.com/uploads/products/xxx.jpg
 * - 이미 절대 URL인 경우 그대로 반환
 */
export function getImageUrl(path: string): string {
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = IMAGE_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}
