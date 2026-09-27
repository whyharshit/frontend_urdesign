/** HTTP boundary for the future independent backend. Never import this from UI controls directly. */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) throw new Error('Set VITE_API_BASE_URL before enabling the backend adapter.');
  const response = await fetch(`${base}${path}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok)
    throw new ApiError(
      response.status,
      response.status === 404
        ? 'This item is unavailable.'
        : 'The request could not be completed. Please try again.',
    );
  return response.status === 204 ? (undefined as T) : (response.json() as Promise<T>);
}
