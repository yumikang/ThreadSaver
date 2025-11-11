import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequiredFields,
} from '@/lib/api-utils'
import { isValidTwitterUrl } from '@/lib/utils'
import type { AddThreadToSeriesRequest } from '@/lib/types'

/**
 * POST /api/series/[id]/threads
 * Add a thread to a series
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: seriesId } = await params
    const body: AddThreadToSeriesRequest = await request.json()

    // Validate required fields
    const validationError = validateRequiredFields(body, ['threadUrl'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    if (!isValidTwitterUrl(body.threadUrl)) {
      return errorResponse('Invalid Twitter/X URL', 400)
    }

    // Check if series exists
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        seriesThreads: true,
      },
    })

    if (!series) {
      return errorResponse('Series not found', 404)
    }

    // First, scrape the thread
    const scrapeResponse = await fetch(`${request.nextUrl.origin}/api/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweetUrl: body.threadUrl }),
    })

    if (!scrapeResponse.ok) {
      const errorData = await scrapeResponse.json()
      return errorResponse(errorData.error || 'Failed to scrape thread', scrapeResponse.status)
    }

    const scrapeData = await scrapeResponse.json()
    const threadConversationId = scrapeData.data.thread.conversationId

    // Find the thread in database
    const thread = await prisma.thread.findUnique({
      where: { conversationId: threadConversationId },
      include: { tweets: true },
    })

    if (!thread) {
      return errorResponse('Thread not found after scraping', 500)
    }

    // Check if thread already in series
    const existingSeriesThread = await prisma.seriesThread.findFirst({
      where: {
        seriesId,
        threadId: thread.id,
      },
    })

    if (existingSeriesThread) {
      return errorResponse('Thread already exists in this series', 400)
    }

    // Determine sequence number
    const sequenceNumber =
      body.sequenceNumber || series.seriesThreads.length + 1

    // Add thread to series
    const seriesThread = await prisma.seriesThread.create({
      data: {
        seriesId,
        threadId: thread.id,
        sequenceNumber,
      },
      include: {
        thread: {
          include: {
            tweets: {
              orderBy: { sequenceNumber: 'asc' },
            },
          },
        },
      },
    })

    // Update series statistics
    const totalTweets = await prisma.tweet.count({
      where: {
        thread: {
          seriesThreads: {
            some: { seriesId },
          },
        },
      },
    })

    await prisma.series.update({
      where: { id: seriesId },
      data: {
        totalTweets,
        totalThreads: { increment: 1 },
      },
    })

    return successResponse(
      {
        seriesThread,
        totalTweets,
        totalThreads: series.totalThreads + 1,
      },
      'Thread added to series successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/series/[id]/threads/[threadId]
 * Remove a thread from a series
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: seriesId } = await params
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return errorResponse('Thread ID is required', 400)
    }

    const seriesThread = await prisma.seriesThread.findFirst({
      where: {
        seriesId,
        threadId,
      },
    })

    if (!seriesThread) {
      return errorResponse('Thread not found in series', 404)
    }

    await prisma.seriesThread.delete({
      where: { id: seriesThread.id },
    })

    // Update series statistics
    const totalTweets = await prisma.tweet.count({
      where: {
        thread: {
          seriesThreads: {
            some: { seriesId },
          },
        },
      },
    })

    await prisma.series.update({
      where: { id: seriesId },
      data: {
        totalTweets,
        totalThreads: { decrement: 1 },
      },
    })

    return successResponse({ threadId }, 'Thread removed from series successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
