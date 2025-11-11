import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
} from '@/lib/api-utils'
import type { SeriesData, UpdateSeriesRequest } from '@/lib/types'

/**
 * GET /api/series/[id]
 * Get a single series by ID or slug
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Try to find by ID first, then by slug
    const series = await prisma.series.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        seriesThreads: {
          include: {
            thread: {
              include: {
                tweets: {
                  orderBy: { sequenceNumber: 'asc' },
                },
              },
            },
          },
          orderBy: { sequenceNumber: 'asc' },
        },
        _count: {
          select: {
            bookmarks: true,
            seriesViews: true,
          },
        },
      },
    })

    if (!series) {
      return errorResponse('Series not found', 404)
    }

    // Increment view count
    await prisma.seriesView.create({
      data: {
        seriesId: series.id,
      },
    })

    await prisma.series.update({
      where: { id: series.id },
      data: { totalViews: { increment: 1 } },
    })

    const seriesData: SeriesData = {
      id: series.id,
      authorUsername: series.authorUsername,
      title: series.title,
      description: series.description || undefined,
      coverImageUrl: series.coverImageUrl || undefined,
      status: series.status as 'ongoing' | 'completed' | 'hiatus',
      totalTweets: series.totalTweets,
      totalThreads: series.totalThreads,
      totalViews: series.totalViews + 1,
      slug: series.slug,
      isPublic: series.isPublic,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
    }

    // Convert BigInt to String for JSON serialization
    const threadsWithStringIds = series.seriesThreads.map(st => ({
      ...st,
      thread: {
        ...st.thread,
        tweets: st.thread.tweets.map(tweet => ({
          ...tweet,
          id: tweet.id.toString(),
          replyToId: tweet.replyToId ? tweet.replyToId.toString() : null,
        })),
      },
    }))

    return successResponse({ ...seriesData, threads: threadsWithStringIds })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PATCH /api/series/[id]
 * Update a series
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body: UpdateSeriesRequest = await request.json()

    const series = await prisma.series.findUnique({
      where: { id },
    })

    if (!series) {
      return errorResponse('Series not found', 404)
    }

    const updatedSeries = await prisma.series.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.coverImageUrl !== undefined && { coverImageUrl: body.coverImageUrl }),
        ...(body.status && { status: body.status }),
        ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      },
    })

    const seriesData: SeriesData = {
      id: updatedSeries.id,
      authorUsername: updatedSeries.authorUsername,
      title: updatedSeries.title,
      description: updatedSeries.description || undefined,
      coverImageUrl: updatedSeries.coverImageUrl || undefined,
      status: updatedSeries.status as 'ongoing' | 'completed' | 'hiatus',
      totalTweets: updatedSeries.totalTweets,
      totalThreads: updatedSeries.totalThreads,
      totalViews: updatedSeries.totalViews,
      slug: updatedSeries.slug,
      isPublic: updatedSeries.isPublic,
      createdAt: updatedSeries.createdAt,
      updatedAt: updatedSeries.updatedAt,
    }

    return successResponse(seriesData, 'Series updated successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/series/[id]
 * Delete a series
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const series = await prisma.series.findUnique({
      where: { id },
    })

    if (!series) {
      return errorResponse('Series not found', 404)
    }

    await prisma.series.delete({
      where: { id },
    })

    return successResponse({ id }, 'Series deleted successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
