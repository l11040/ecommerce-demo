export const fetcher = async <T>(input: RequestInfo, init?: RequestInit): Promise<T> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:40003';
  const url = typeof input === 'string' ? `${baseUrl}${input}` : input;

  const response = await fetch(url, init);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export default fetcher;
