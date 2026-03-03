export type ApiEnvelope = {
  success?: boolean;
  message?: string;
};

export type ApiClientResponse = {
  status: number;
  data?: ApiEnvelope | null;
};

export function isApiSuccess(response: ApiClientResponse): boolean {
  return (
    response.status >= 200 &&
    response.status < 300 &&
    response.data?.success === true
  );
}

export function getApiErrorMessage(
  response: Pick<ApiClientResponse, 'data'>,
  fallback: string,
): string {
  return response.data?.message ?? fallback;
}
