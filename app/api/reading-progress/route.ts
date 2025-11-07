import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequiredFields,
  getSessionId,
} from '@/lib/api-utils'
import type { ReadingProgressData, UpdateReadingProgressRequest } from '@/lib/types'

/**
 * GET /api/reading-progress
 * Get reading progress for a series
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seriesId = searchParams.get('seriesId')
    const sessionId = getSessionId(request)

    if (!seriesId) {
      return errorResponse('Series ID is required', 400)
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        sessionId_seriesId: {
          sessionId,
          seriesId,
        },
      },
    })

    if (!progress) {
      return successResponse<ReadingProgressData | null>(null)
    }

    const progressData: ReadingProgressData = {
      id: progress.id,
      sessionId: progress.sessionId,
      seriesId: progress.seriesId,
      lastReadTweetId: progress.lastReadTweetId?.toString(),
      progressPercentage: progress.progressPercentage || undefined,
      updatedAt: progress.updatedAt,
    }

    return successResponse(progressData)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/reading-progress
 * Update reading progress
 */
export async function POST(request: NextRequest) {
  try {
    const body: UpdateReadingProgressRequest = await request.json()
    const sessionId = getSessionId(request)

    // Validate required fields
    const validationError = validateRequiredFields(body, [
      'seriesId',
      'lastReadTweetId',
      'progressPercentage',
    ])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    // Verify series exists
    const series = await prisma.series.findUnique({
      where: { id: body.seriesId },
    })

    if (!series) {
      return errorResponse('Series not found', 404)
    }

    // Verify tweet exists
    const tweet = await prisma.tweet.findUnique({
      where: { id: BigInt(body.lastReadTweetId) },
    })

    if (!tweet) {
      return errorResponse('Tweet not found', 404)
    }

    // Upsert reading progress
    const progress = await prisma.readingProgress.upsert({
      where: {
        sessionId_seriesId: {
          sessionId,
          seriesId: body.seriesId,
        },
      },
      update: {
        lastReadTweetId: BigInt(body.lastReadTweetId),
        progressPercentage: body.progressPercentage,
      },
      create: {
        sessionId,
        seriesId: body.seriesId,
        lastReadTweetId: BigInt(body.lastReadTweetId),
        progressPercentage: body.progressPercentage,
      },
    })

    const progressData: ReadingProgressData = {
      id: progress.id,
      sessionId: progress.sessionId,
      seriesId: progress.seriesId,
      lastReadTweetId: progress.lastReadTweetId?.toString(),
      progressPercentage: progress.progressPercentage || undefined,
      updatedAt: progress.updatedAt,
    }

    return successResponse(progressData, 'Reading progress updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/reading-progress
 * Delete reading progress
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seriesId = searchParams.get('seriesId')
    const sessionId = getSessionId(request)

    if (!seriesId) {
      return errorResponse('Series ID is required', 400)
    }

    const progress = await prisma.readingProgress.findUnique({
      where: {
        sessionId_seriesId: {
          sessionId,
          seriesId,
        },
      },
    })

    if (!progress) {
      return errorResponse('Reading progress not found', 404)
    }

    await prisma.readingProgress.delete({
      where: { id: progress.id },
    })

    return successResponse({ seriesId }, 'Reading progress deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
