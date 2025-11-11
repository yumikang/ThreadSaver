import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequiredFields,
  parsePaginationParams,
  calculatePagination,
} from '@/lib/api-utils'
import { generateSlug, sanitizeSlug } from '@/lib/utils'
import type { CreateSeriesRequest, SeriesData, PaginatedResponse } from '@/lib/types'

/**
 * GET /api/series
 * Get list of public series with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit } = parsePaginationParams(searchParams)
    const authorUsername = searchParams.get('author')

    const skip = (page - 1) * limit

    // Build where clause
    const where = {
      isPublic: true,
      ...(authorUsername && { authorUsername }),
    }

    // Get total count
    const total = await prisma.series.count({ where })

    // Get series
    const seriesList = await prisma.series.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            seriesThreads: true,
            bookmarks: true,
          },
        },
      },
    })

    const data: SeriesData[] = seriesList.map((series) => ({
      id: series.id,
      authorUsername: series.authorUsername,
      title: series.title,
      description: series.description || undefined,
      coverImageUrl: series.coverImageUrl || undefined,
      status: series.status as 'ongoing' | 'completed' | 'hiatus',
      totalTweets: series.totalTweets,
      totalThreads: series.totalThreads,
      totalViews: series.totalViews,
      slug: series.slug,
      isPublic: series.isPublic,
      createdAt: series.createdAt,
      updatedAt: series.updatedAt,
    }))

    const pagination = calculatePagination(page, limit, total)

    return successResponse<PaginatedResponse<SeriesData>>({
      data,
      pagination,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/series
 * Create a new series
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreateSeriesRequest = await request.json()

    // Validate required fields
    const validationError = validateRequiredFields(body, ['title', 'authorUsername'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    // Generate or sanitize slug
    const slug = body.slug
      ? sanitizeSlug(body.slug)
      : generateSlug(body.title)

    // Check if slug already exists
    const existingSeries = await prisma.series.findUnique({
      where: { slug },
    })

    if (existingSeries) {
      // Add timestamp to make it unique
      const uniqueSlug = `${slug}-${Date.now()}`

      const series = await createSeries(body, uniqueSlug)
      return successResponse<SeriesData>(mapSeriesToData(series), 'Series created successfully')
    }

    const series = await createSeries(body, slug)

    // Log analytics
    await prisma.analytics.create({
      data: {
        eventType: 'series_created',
        seriesId: series.id,
      },
    })

    return successResponse<SeriesData>(
      mapSeriesToData(series),
      'Series created successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}

// Helper function to create series
async function createSeries(body: CreateSeriesRequest, slug: string) {
  return await prisma.series.create({
    data: {
      authorUsername: body.authorUsername,
      title: body.title,
      description: body.description,
      slug,
      status: body.status || 'ongoing',
    },
  })
}

interface PrismaSeriesData {
  id: string
  authorUsername: string
  title: string
  description: string | null
  coverImageUrl: string | null
  status: string
  totalTweets: number
  totalThreads: number
  totalViews: number
  slug: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
}

// Helper function to map Prisma series to SeriesData
function mapSeriesToData(series: PrismaSeriesData): SeriesData {
  return {
    id: series.id,
    authorUsername: series.authorUsername,
    title: series.title,
    description: series.description || undefined,
    coverImageUrl: series.coverImageUrl || undefined,
    status: series.status as 'ongoing' | 'completed' | 'hiatus',
    totalTweets: series.totalTweets,
    totalThreads: series.totalThreads,
    totalViews: series.totalViews,
    slug: series.slug,
    isPublic: series.isPublic,
    createdAt: series.createdAt,
    updatedAt: series.updatedAt,
  }
}
