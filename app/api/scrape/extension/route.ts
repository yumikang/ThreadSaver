import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const runtime = 'nodejs'

interface ExtensionTweetData {
  id: string
  content: string
  createdAt: string
  authorUsername: string
  sequenceNumber?: number
  replyToId?: string
  likeCount?: number
  retweetCount?: number
  mediaUrls?: string[]
}

interface ExtensionScrapeRequest {
  url: string
  tweets: ExtensionTweetData[]
}

/**
 * Browser Extension에서 스크래핑한 트윗 데이터 수신
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExtensionScrapeRequest = await request.json()
    const { url, tweets } = body

    // Validation
    if (!url || !tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return errorResponse('Invalid request data', 400)
    }

    console.log(`Extension scrape: ${tweets.length} tweets from ${url}`)

    // 디버깅: 첫 5개 트윗의 시간 확인
    console.log('First 5 tweets timestamps:', tweets.slice(0, 5).map((t, i) => ({
      index: i,
      id: t.id,
      createdAt: t.createdAt,
      content: t.content?.slice(0, 50)
    })))

    // Extract conversation ID from URL
    const conversationIdMatch = url.match(/status\/(\d+)/)
    if (!conversationIdMatch) {
      return errorResponse('Invalid Twitter URL', 400)
    }

    const conversationId = conversationIdMatch[1]

    // 시간순 정렬 확인 (오래된 것이 먼저 와야 함)
    const sortedTweets = [...tweets].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      return timeA - timeB
    })

    console.log('After sorting - First tweet:', {
      id: sortedTweets[0].id,
      createdAt: sortedTweets[0].createdAt,
      content: sortedTweets[0].content?.slice(0, 50)
    })

    const firstTweet = sortedTweets[0] // 가장 오래된 트윗이 첫번째

    // Check if thread already exists
    const existingThread = await prisma.thread.findUnique({
      where: { conversationId },
    })

    if (existingThread) {
      return successResponse(
        {
          threadId: existingThread.id,
          message: 'Thread already exists',
        },
        'Thread already saved'
      )
    }

    // Create Thread
    const thread = await prisma.thread.create({
      data: {
        conversationId,
        authorUsername: firstTweet.authorUsername || 'unknown',
        tweetCount: tweets.length,
        firstTweetUrl: url,
        firstTweetDate: new Date(firstTweet.createdAt),
      },
    })

    // Create Tweets (정렬된 순서대로)
    const tweetsToCreate = sortedTweets
      .filter((tweet) => tweet.id) // Filter out tweets without ID
      .map((tweet, index) => {
        return {
          id: BigInt(tweet.id),
          threadId: thread.id,
          content: tweet.content || '',
          createdAt: new Date(tweet.createdAt),
          authorUsername: tweet.authorUsername || 'unknown',
          sequenceNumber: index + 1, // 정렬된 순서대로 1, 2, 3...
          replyToId: tweet.replyToId ? BigInt(tweet.replyToId) : null,
          likeCount: tweet.likeCount || 0,
          retweetCount: tweet.retweetCount || 0,
          mediaUrls: tweet.mediaUrls || [],
        }
      })

    await prisma.tweet.createMany({
      data: tweetsToCreate,
      skipDuplicates: true,
    })

    console.log(`Thread ${thread.id} created with ${sortedTweets.length} tweets`)

    // Create Series from thread (첫 트윗 기준)
    const slug = `${firstTweet.authorUsername}-${conversationId}`.toLowerCase()
    const seriesTitle = firstTweet.content?.slice(0, 100) || `${firstTweet.authorUsername}의 타래`

    const series = await prisma.series.create({
      data: {
        authorUsername: firstTweet.authorUsername || 'unknown',
        title: seriesTitle,
        description: firstTweet.content || '',
        slug,
        status: 'completed',
        totalTweets: sortedTweets.length,
        totalThreads: 1,
        isPublic: true,
      },
    })

    // Link thread to series
    await prisma.seriesThread.create({
      data: {
        seriesId: series.id,
        threadId: thread.id,
        sequenceNumber: 1,
      },
    })

    console.log(`Series ${series.id} created and linked to thread ${thread.id}`)

    return successResponse(
      {
        threadId: thread.id,
        seriesId: series.id,
        conversationId: thread.conversationId,
        tweetCount: sortedTweets.length,
      },
      'Thread and series saved successfully'
    )
  } catch (error: any) {
    console.error('Extension scrape error:', error)

    // Handle duplicate error
    if (error.code === 'P2002') {
      return errorResponse('Thread already exists', 409)
    }

    return errorResponse(
      error.message || 'Failed to save thread',
      500
    )
  }
}
