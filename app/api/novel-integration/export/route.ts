import { NextRequest, NextResponse } from 'next/server'
import { createProjectFromSeries } from '@/lib/novel-integration'

/**
 * POST /api/novel-integration/export
 * Series를 NovelMind Project로 내보내기
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      seriesId,
      minTweetsPerThread = 10, // 기본값: 중편 이상 (10개 이상)
    } = body

    if (!seriesId) {
      return NextResponse.json(
        { success: false, error: 'seriesId is required' },
        { status: 400 }
      )
    }

    const result = await createProjectFromSeries({
      seriesId,
      minTweetsPerThread,
    })

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        projectId: result.projectId,
        episodeCount: result.episodeCount,
      },
    })
  } catch (error) {
    console.error('Export to NovelMind error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
