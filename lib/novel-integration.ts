/**
 * ThreadSaver ↔ NovelMind 통합 로직
 * Series를 Project로 변환하고 Tweet을 EpisodeNote로 변환
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CreateProjectFromSeriesOptions {
  seriesId: string
  projectTitle?: string // 프로젝트 제목 (기본값: Series 제목)
  originalWorkTitle?: string // 원작 제목 (기본값: "Custom - Twitter Series")
  timelineSetting?: string // 타임라인 설정
  auSettings?: string[] // AU 설정
  syncEnabled?: boolean // 자동 동기화 활성화
  minTweetsPerThread?: number // 각 타래의 최소 트윗 수 (예: 10 이상만)
  minTotalTweets?: number // 시리즈 전체 최소 트윗 수 (예: 50 이상만)
}

interface ProjectCreationResult {
  success: boolean
  projectId?: string
  episodeCount?: number
  noteCount?: number
  error?: string
}

/**
 * Series를 NovelMind Project로 변환
 * - Series → Project
 * - Thread → Episode
 * - Tweet → EpisodeNote
 */
export async function createProjectFromSeries(
  options: CreateProjectFromSeriesOptions
): Promise<ProjectCreationResult> {
  const {
    seriesId,
    projectTitle,
    originalWorkTitle = 'Custom - Twitter Series',
    timelineSetting = '트위터 연재 원본',
    auSettings = [],
    syncEnabled = true,
    minTweetsPerThread = 0,
    minTotalTweets = 0,
  } = options

  try {
    // 1. 이미 내보낸 Series인지 확인
    const existingLink = await prisma.seriesProject.findUnique({
      where: { seriesId },
      include: {
        project: {
          include: {
            episodes: true,
          },
        },
      },
    })

    if (existingLink) {
      // 이미 내보낸 Series는 기존 프로젝트 ID 반환
      return {
        success: true,
        projectId: existingLink.projectId,
        episodeCount: existingLink.project.episodes.length,
        error: 'This series has already been exported. Returning existing project.',
      }
    }

    // 2. Series와 연결된 Thread, Tweet 데이터 조회
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
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
      },
    })

    if (!series) {
      return { success: false, error: 'Series not found' }
    }

    // 2. 시리즈 전체 트윗 수 필터링
    if (minTotalTweets > 0 && series.totalTweets < minTotalTweets) {
      return {
        success: false,
        error: `Series has only ${series.totalTweets} tweets (minimum: ${minTotalTweets})`,
      }
    }

    // 3. 각 타래의 트윗 수 필터링 (minTweetsPerThread 이상인 타래만 포함)
    const filteredSeriesThreads = series.seriesThreads.filter(
      (st) => st.thread.tweets.length >= minTweetsPerThread
    )

    if (filteredSeriesThreads.length === 0) {
      return {
        success: false,
        error: `No threads with ${minTweetsPerThread}+ tweets found`,
      }
    }

    // 4. OriginalWork 생성 또는 조회
    let originalWork = await prisma.originalWork.findFirst({
      where: {
        title: originalWorkTitle,
        mediaType: 'twitter',
      },
    })

    if (!originalWork) {
      originalWork = await prisma.originalWork.create({
        data: {
          title: originalWorkTitle,
          mediaType: 'twitter',
          source: 'Twitter Series Import',
        },
      })
    }

    // 5. Project 생성
    const project = await prisma.project.create({
      data: {
        title: projectTitle || series.title,
        originalWorkId: originalWork.id,
        timelineSetting,
        auSettings,
        activeCharacterIds: [],
        tone: {
          atmosphere: 'original', // Series의 원래 분위기 유지
          pacing: 'twitter-style', // 트위터 특유의 빠른 전개
          source: 'imported_from_twitter',
          filters: {
            minTweetsPerThread,
            minTotalTweets,
          },
        },
      },
    })

    let episodeCount = 0

    // 6. Thread → Episode 변환 (필터링된 타래만)
    // 트윗들을 하나의 연속된 본문으로 합쳐서 저장
    for (const seriesThread of filteredSeriesThreads) {
      const thread = seriesThread.thread

      // 모든 트윗을 하나의 본문으로 합치기 (줄바꿈으로 구분)
      const fullContent = thread.tweets
        .map(tweet => tweet.content)
        .join('\n\n')

      // Episode 생성 (트윗들을 합친 전체 본문 포함)
      await prisma.episode.create({
        data: {
          title: `Thread ${seriesThread.sequenceNumber}: ${
            thread.tweets[0]?.content.substring(0, 50) || 'Untitled'
          }...`,
          content: fullContent, // 타래 전체 본문
          order: seriesThread.sequenceNumber,
          projectId: project.id,
        },
      })

      episodeCount++
      // noteCount는 이제 사용하지 않음 (개별 노트 생성하지 않음)
    }

    // 7. SeriesProject 연결 생성 (브릿지 테이블)
    await prisma.seriesProject.create({
      data: {
        seriesId: series.id,
        projectId: project.id,
        syncEnabled,
        lastSyncAt: new Date(),
      },
    })

    return {
      success: true,
      projectId: project.id,
      episodeCount,
    }
  } catch (error) {
    console.error('Error creating project from series:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Project가 Series와 연결되어 있는지 확인
 */
export async function isProjectLinkedToSeries(
  projectId: string
): Promise<boolean> {
  const link = await prisma.seriesProject.findFirst({
    where: { projectId },
  })

  return !!link
}

/**
 * Series가 Project로 이미 변환되었는지 확인
 */
export async function isSeriesConvertedToProject(
  seriesId: string
): Promise<{ converted: boolean; projectId?: string }> {
  const link = await prisma.seriesProject.findFirst({
    where: { seriesId },
  })

  if (link) {
    return { converted: true, projectId: link.projectId }
  }

  return { converted: false }
}

/**
 * Series와 Project 연결 해제
 */
export async function unlinkSeriesFromProject(
  seriesId: string
): Promise<boolean> {
  try {
    await prisma.seriesProject.deleteMany({
      where: { seriesId },
    })
    return true
  } catch (error) {
    console.error('Error unlinking series from project:', error)
    return false
  }
}

/**
 * 동기화 상태 업데이트
 */
export async function updateSyncStatus(
  seriesId: string,
  enabled: boolean
): Promise<boolean> {
  try {
    await prisma.seriesProject.updateMany({
      where: { seriesId },
      data: {
        syncEnabled: enabled,
        lastSyncAt: new Date(),
      },
    })
    return true
  } catch (error) {
    console.error('Error updating sync status:', error)
    return false
  }
}

/**
 * Series의 모든 데이터를 가져와 NovelMind용 프롬프트 생성
 * (AI에게 전달할 컨텍스트)
 */
export async function generateNovelMindPromptFromSeries(
  seriesId: string,
  options?: {
    minTweetsPerThread?: number
  }
): Promise<string> {
  const { minTweetsPerThread = 0 } = options || {}

  const series = await prisma.series.findUnique({
    where: { id: seriesId },
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
    },
  })

  if (!series) {
    return ''
  }

  // 필터링된 타래만 포함
  const filteredThreads = series.seriesThreads.filter(
    (st) => st.thread.tweets.length >= minTweetsPerThread
  )

  let prompt = `# ${series.title}\n\n`
  prompt += `작가: @${series.authorUsername}\n`
  prompt += `총 ${series.totalThreads}개 타래 중 ${filteredThreads.length}개 타래 선택 (${minTweetsPerThread}+ 트윗)\n\n`

  for (const seriesThread of filteredThreads) {
    const thread = seriesThread.thread
    prompt += `## Thread ${seriesThread.sequenceNumber} (${thread.tweets.length}개 트윗)\n\n`

    for (const tweet of thread.tweets) {
      prompt += `${tweet.sequenceNumber}. ${tweet.content}\n\n`
    }

    prompt += '\n---\n\n'
  }

  return prompt
}

/**
 * NovelMind로 내보낼 수 있는 Series 목록 조회 (필터 적용)
 */
export async function getExportableSeriesList(options?: {
  minTotalTweets?: number
  minThreads?: number
  minTweetsPerThread?: number
}) {
  const { minTotalTweets = 50, minThreads = 3, minTweetsPerThread = 10 } = options || {}

  const allSeries = await prisma.series.findMany({
    where: {
      totalTweets: { gte: minTotalTweets },
      totalThreads: { gte: minThreads },
    },
    include: {
      seriesThreads: {
        include: {
          thread: true,
        },
      },
      novelProjects: true, // 이미 변환된 프로젝트 확인
    },
    orderBy: {
      totalTweets: 'desc',
    },
  })

  // 각 시리즈의 통계 정보 계산
  return allSeries.map((series) => {
    const qualifyingThreads = series.seriesThreads.filter(
      (st) => st.thread.tweetCount >= minTweetsPerThread
    )

    return {
      id: series.id,
      title: series.title,
      authorUsername: series.authorUsername,
      totalThreads: series.totalThreads,
      totalTweets: series.totalTweets,
      qualifyingThreads: qualifyingThreads.length,
      isConverted: series.novelProjects.length > 0,
      convertedProjectId: series.novelProjects[0]?.projectId,
    }
  })
}
