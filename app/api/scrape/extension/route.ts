import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-utils'

export const runtime = 'nodejs'

/**
 * Browser Extension에서 스크래핑한 트윗 데이터 수신
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, tweets } = body

    // Validation
    if (!url || !tweets || !Array.isArray(tweets) || tweets.length === 0) {
      return errorResponse('Invalid request data', 400)
    }

    console.log(`Extension scrape: ${tweets.length} tweets from ${url}`)

    // Extract conversation ID from URL
    const conversationIdMatch = url.match(/status\/(\d+)/)
    if (!conversationIdMatch) {
      return errorResponse('Invalid Twitter URL', 400)
    }

    const conversationId = conversationIdMatch[1]
    const firstTweet = tweets[0]

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

    // Create Tweets
    const tweetsToCreate = tweets.map((tweet: any, index: number) => {
      return {
        id: tweet.id ? BigInt(tweet.id) : undefined,
        threadId: thread.id,
        content: tweet.content || '',
        createdAt: new Date(tweet.createdAt),
        authorUsername: tweet.authorUsername || 'unknown',
        sequenceNumber: tweet.sequenceNumber || index + 1,
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

    console.log(`Thread ${thread.id} created with ${tweets.length} tweets`)

    return successResponse(
      {
        threadId: thread.id,
        conversationId: thread.conversationId,
        tweetCount: tweets.length,
      },
      'Thread saved successfully'
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
