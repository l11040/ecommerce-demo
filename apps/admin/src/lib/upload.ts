type UploadSuccessEnvelope = {
  success?: boolean;
  data?: {
    path?: string;
    url?: string;
  };
  message?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';

function toAbsoluteUrl(urlOrPath: string): string {
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }

  const base = API_URL.replace(/\/$/, '');
  const path = urlOrPath.startsWith('/') ? urlOrPath : `/${urlOrPath}`;
  return `${base}${path}`;
}

export async function uploadProductImageFile(
  file: File,
): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_URL}/bo/products/images`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  const payload = (await response.json().catch(() => null)) as
    | UploadSuccessEnvelope
    | null;

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message ?? '이미지 업로드에 실패했습니다.');
  }

  const rawPath = payload.data?.path;
  const rawUrl = payload.data?.url;

  if (!rawPath && !rawUrl) {
    throw new Error('업로드 응답 경로가 비어 있습니다.');
  }

  const sourceForPath = rawPath ?? rawUrl ?? '';
  let path = sourceForPath;

  if (sourceForPath.startsWith('http://') || sourceForPath.startsWith('https://')) {
    try {
      path = new URL(sourceForPath).pathname;
    } catch {
      path = sourceForPath;
    }
  }

  if (!path.startsWith('/')) {
    path = `/${path}`;
  }

  const url = toAbsoluteUrl(rawUrl ?? path);

  return { path, url };
}
