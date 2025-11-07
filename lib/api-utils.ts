import { NextResponse } from 'next/server'
import type { ApiResponse } from './types'

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    message,
  })
}

/**
 * Create error response
 */
export function errorResponse(
  error: string,
  status: number = 400
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    },
    { status }
  )
}

/**
 * Handle API errors
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof Error) {
    return errorResponse(error.message, 500)
  }

  return errorResponse('Internal server error', 500)
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  data: Record<string, unknown>,
  fields: string[]
): string | null {
  for (const field of fields) {
    if (!data[field]) {
      return `Missing required field: ${field}`
    }
  }
  return null
}

/**
 * Get session ID from cookies or generate new one
 */
export function getSessionId(request: Request): string {
  const cookies = request.headers.get('cookie')
  const sessionMatch = cookies?.match(/sessionId=([^;]+)/)

  if (sessionMatch) {
    return sessionMatch[1]
  }

  // Generate new session ID
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  const hasNext = page < totalPages
  const hasPrev = page > 1

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
  }
}

/**
 * Parse pagination params from URL
 */
export function parsePaginationParams(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(
    500,
    Math.max(1, parseInt(searchParams.get('limit') || '500', 10))
  )

  return { page, limit }
}
