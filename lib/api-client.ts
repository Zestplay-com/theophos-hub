export class ApiClientError extends Error {
  status: number
  data: unknown

  constructor(message: string, status = 500, data: unknown = null) {
    super(message)
    this.name = 'ApiClientError'
    this.status = status
    this.data = data
  }
}

export async function readApiResponse<T = any>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text.trim()) {
    throw new ApiClientError(`The server returned an empty response (${response.status}). Please try again.`, response.status)
  }

  let data: any
  try {
    data = JSON.parse(text)
  } catch {
    throw new ApiClientError(`The server returned an invalid response (${response.status}). Please try again.`, response.status, text.slice(0, 240))
  }

  if (!response.ok) {
    const message = data && typeof data === 'object' && typeof data.error === 'string'
      ? data.error
      : `Request failed (${response.status}). Please try again.`
    throw new ApiClientError(message, response.status, data)
  }

  return data as T
}

export async function fetchApi<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  try {
    return await readApiResponse<T>(await fetch(input, init))
  } catch (error) {
    if (error instanceof ApiClientError) throw error
    throw new ApiClientError('The network request failed. Check your connection and try again.', 0)
  }
}
