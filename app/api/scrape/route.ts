import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  successResponse,
  errorResponse,
  handleApiError,
  validateRequiredFields,
} from '@/lib/api-utils'
import { isValidTwitterUrl, extractTweetId } from '@/lib/utils'
import type { ScrapeRequest, ScrapeResponse, ThreadData } from '@/lib/types'

/**
 * POST /api/scrape
 * Collect a Twitter thread and save to database
 */
export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json()

    // Validate required fields
    const validationError = validateRequiredFields(body, ['tweetUrl'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    // Validate Twitter URL
    if (!isValidTwitterUrl(body.tweetUrl)) {
      return errorResponse('Invalid Twitter/X URL', 400)
    }

    const tweetId = extractTweetId(body.tweetUrl)
    if (!tweetId) {
      return errorResponse('Could not extract tweet ID from URL', 400)
    }

    // Call VPS scraper API
    const scraperUrl = process.env.SCRAPER_API_URL || 'https://api.one-q.xyz'
    const scraperResponse = await fetch(`${scraperUrl}/scrape`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tweet_url: body.tweetUrl }),
    })

    if (!scraperResponse.ok) {
      const errorData = await scraperResponse.json().catch(() => ({}))
      return errorResponse(
        errorData.detail || 'Failed to scrape thread from Twitter',
        scraperResponse.status
      )
    }

    const scraperData = await scraperResponse.json()

    // Check if thread already exists
    const existingThread = await prisma.thread.findUnique({
      where: { conversationId: scraperData.conversation_id },
      include: { tweets: true },
    })

    if (existingThread) {
      // Return existing thread
      const threadData: ThreadData = {
        conversationId: existingThread.conversationId,
        authorUsername: existingThread.authorUsername,
        authorName: existingThread.authorName || undefined,
        tweetCount: existingThread.tweetCount,
        firstTweetUrl: existingThread.firstTweetUrl,
        firstTweetDate: existingThread.firstTweetDate || undefined,
        tweets: existingThread.tweets.map((tweet) => ({
          id: tweet.id.toString(),
          content: tweet.content,
          createdAt: tweet.createdAt,
          authorUsername: tweet.authorUsername,
          replyToId: tweet.replyToId?.toString(),
          retweetCount: tweet.retweetCount,
          likeCount: tweet.likeCount,
          mediaUrls: tweet.mediaUrls,
          sequenceNumber: tweet.sequenceNumber,
        })),
      }

      return successResponse<ScrapeResponse>(
        {
          thread: threadData,
          message: 'Thread already exists in database',
        },
        'Thread retrieved successfully'
      )
    }

    // Save new thread to database
    const thread = await prisma.thread.create({
      data: {
        conversationId: scraperData.conversation_id,
        authorUsername: scraperData.author_username,
        authorName: scraperData.author_name,
        tweetCount: scraperData.tweets.length,
        firstTweetUrl: body.tweetUrl,
        firstTweetDate: new Date(scraperData.tweets[0].created_at),
        tweets: {
          create: scraperData.tweets.map((tweet: any, index: number) => ({
            id: BigInt(tweet.id),
            content: tweet.content,
            createdAt: new Date(tweet.created_at),
            authorUsername: tweet.author_username,
            replyToId: tweet.reply_to_id ? BigInt(tweet.reply_to_id) : null,
            retweetCount: tweet.retweet_count || 0,
            likeCount: tweet.like_count || 0,
            mediaUrls: tweet.media_urls || [],
            sequenceNumber: index + 1,
          })),
        },
      },
      include: {
        tweets: {
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    })

    // Log analytics
    await prisma.analytics.create({
      data: {
        eventType: 'scrape',
        threadId: thread.id,
      },
    })

    const threadData: ThreadData = {
      conversationId: thread.conversationId,
      authorUsername: thread.authorUsername,
      authorName: thread.authorName || undefined,
      tweetCount: thread.tweetCount,
      firstTweetUrl: thread.firstTweetUrl,
      firstTweetDate: thread.firstTweetDate || undefined,
      tweets: thread.tweets.map((tweet) => ({
        id: tweet.id.toString(),
        content: tweet.content,
        createdAt: tweet.createdAt,
        authorUsername: tweet.authorUsername,
        replyToId: tweet.replyToId?.toString(),
        retweetCount: tweet.retweetCount,
        likeCount: tweet.likeCount,
        mediaUrls: tweet.mediaUrls,
        sequenceNumber: tweet.sequenceNumber,
      })),
    }

    return successResponse<ScrapeResponse>(
      {
        thread: threadData,
        message: 'Thread collected and saved successfully',
      },
      'Thread scraped successfully'
    )
  } catch (error) {
    return handleApiError(error)
  }
}
