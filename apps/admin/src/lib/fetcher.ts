export const fetcher = async <T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';
  const url = typeof input === 'string' ? `${baseUrl}${input}` : input;

  const response = await fetch(url, {
    credentials: 'include',
    ...init,
  });

  const contentType = response.headers.get('content-type') ?? '';
  const data =
    contentType.includes('application/json') && response.status !== 204
      ? await response.json()
      : null;

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default fetcher;
