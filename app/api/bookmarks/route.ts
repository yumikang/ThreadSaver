import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequiredFields,
  getSessionId,
} from '@/lib/api-utils'
import type { CreateBookmarkRequest, BookmarkData } from '@/lib/types'

/**
 * GET /api/bookmarks
 * Get bookmarks for a series
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seriesId = searchParams.get('seriesId')
    const sessionId = getSessionId(request)

    if (!seriesId) {
      return errorResponse('Series ID is required', 400)
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        sessionId,
        seriesId,
      },
      include: {
        tweet: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const data: BookmarkData[] = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      sessionId: bookmark.sessionId,
      seriesId: bookmark.seriesId,
      tweetId: bookmark.tweetId.toString(),
      note: bookmark.note || undefined,
      createdAt: bookmark.createdAt,
    }))

    return successResponse({ bookmarks: data })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/bookmarks
 * Create a new bookmark
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateBookmarkRequest = await request.json()
    const sessionId = getSessionId(request)

    // Validate required fields
    const validationError = validateRequiredFields(body, ['seriesId', 'tweetId'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    // Check if bookmark already exists
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        sessionId,
        seriesId: body.seriesId,
        tweetId: BigInt(body.tweetId),
      },
    })

    if (existingBookmark) {
      return errorResponse('Bookmark already exists', 400)
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
      where: { id: BigInt(body.tweetId) },
    })

    if (!tweet) {
      return errorResponse('Tweet not found', 404)
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        sessionId,
        seriesId: body.seriesId,
        tweetId: BigInt(body.tweetId),
        note: body.note,
      },
    })

    const bookmarkData: BookmarkData = {
      id: bookmark.id,
      sessionId: bookmark.sessionId,
      seriesId: bookmark.seriesId,
      tweetId: bookmark.tweetId.toString(),
      note: bookmark.note || undefined,
      createdAt: bookmark.createdAt,
    }

    return successResponse(bookmarkData, 'Bookmark created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/bookmarks/[id]
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookmarkId = searchParams.get('id')
    const sessionId = getSessionId(request)

    if (!bookmarkId) {
      return errorResponse('Bookmark ID is required', 400)
    }

    const bookmark = await prisma.bookmark.findUnique({
      where: { id: bookmarkId },
    })

    if (!bookmark) {
      return errorResponse('Bookmark not found', 404)
    }

    // Verify ownership
    if (bookmark.sessionId !== sessionId) {
      return errorResponse('Unauthorized', 403)
    }

    await prisma.bookmark.delete({
      where: { id: bookmarkId },
    })

    return successResponse({ id: bookmarkId }, 'Bookmark deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
