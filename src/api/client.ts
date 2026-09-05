import type { DrugLabel, DrugLabelResponse, FdaErrorResponse } from './types'

const BASE_URL = 'https://api.fda.gov/drug/label.json'
const RESULT_LIMIT = 20

export type ApiErrorKind = 'network' | 'rate-limited' | 'server'

export class ApiError extends Error {
  readonly kind: ApiErrorKind

  constructor(kind: ApiErrorKind, message: string) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function buildSearchTerm(query: string): string {
  return query.replace(/["\\]/g, ' ').trim().replace(/\s+/g, ' ')
}

async function requestLabels(
  search: string,
  signal?: AbortSignal,
): Promise<DrugLabel[]> {
  const params = new URLSearchParams({
    search,
    limit: String(RESULT_LIMIT),
  })

  let response: Response

  try {
    response = await fetch(`${BASE_URL}?${params.toString()}`, { signal })
  } catch (error) {
    if (isAbortError(error)) {
      throw error
    }
    throw new ApiError(
      'network',
      'Could not reach the FDA service. Check your connection and try again.',
    )
  }

  if (response.status === 404) {
    const body = (await response
      .json()
      .catch(() => null)) as FdaErrorResponse | null

    if (body?.error?.code === 'NOT_FOUND') {
      return []
    }

    throw new ApiError('server', 'The FDA service could not handle that request.')
  }

  if (response.status === 429) {
    throw new ApiError(
      'rate-limited',
      'Too many requests to the FDA service. Wait a moment and try again.',
    )
  }

  if (!response.ok) {
    throw new ApiError(
      'server',
      `The FDA service responded with status ${response.status}.`,
    )
  }

  const body = (await response.json()) as DrugLabelResponse

  return body.results ?? []
}

export function searchLabelsByBrand(
  query: string,
  signal?: AbortSignal,
): Promise<DrugLabel[]> {
  const term = buildSearchTerm(query)

  if (!term) {
    return Promise.resolve([])
  }

  return requestLabels(`openfda.brand_name:"${term}"`, signal)
}

export async function fetchLabelById(
  id: string,
  signal?: AbortSignal,
): Promise<DrugLabel | null> {
  const term = buildSearchTerm(id)

  if (!term) {
    return null
  }

  const labels = await requestLabels(`id:"${term}"`, signal)

  return labels[0] ?? null
}
