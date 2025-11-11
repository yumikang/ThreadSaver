import { prisma } from './prisma'

interface TwitterArchiveTweet {
  tweet: {
    id: string
    full_text: string
    created_at: string
    in_reply_to_status_id?: string
    in_reply_to_status_id_str?: string
    entities?: {
      media?: Array<{
        media_url_https: string
        type: string
      }>
    }
  }
}

interface ProcessResult {
  threadsFound: number
  seriesCreated: number
  totalTweets: number
}

/**
 * Twitter Archive의 tweets 데이터를 처리하여 타래를 감지하고 DB에 저장
 */
export async function processTwitterArchive(
  tweetsData: TwitterArchiveTweet[],
  username: string = 'archived_user'
): Promise<ProcessResult> {
  console.log(`Processing ${tweetsData.length} tweets from archive...`)

  // 1. 기존 트윗 ID 조회 (중복 방지)
  const existingTweetIds = await prisma.tweet.findMany({
    where: { authorUsername: username },
    select: { id: true },
  })
  const existingIdsSet = new Set(existingTweetIds.map(t => t.id.toString()))
  console.log(`Found ${existingIdsSet.size} existing tweets for ${username}`)

  // 2. 새로운 트윗만 필터링
  const newTweetsData = tweetsData.filter(
    t => !existingIdsSet.has(t.tweet.id)
  )
  console.log(`${newTweetsData.length} new tweets to process (${tweetsData.length - newTweetsData.length} duplicates skipped)`)

  if (newTweetsData.length === 0) {
    console.log('No new tweets to process')
    return {
      threadsFound: 0,
      seriesCreated: 0,
      totalTweets: tweetsData.length,
    }
  }

  // 3. 새 트윗을 Map으로 변환 (빠른 조회를 위해)
  const tweetMap = new Map(
    newTweetsData.map((t) => [t.tweet.id, t.tweet])
  )

  // 4. 타래 감지 (reply_to 체인 기반)
  const threads = detectThreads(tweetMap)

  console.log(`Detected ${threads.size} threads from new tweets`)

  // 5. DB에 저장
  let seriesCreated = 0

  for (const [firstId, tweetIds] of threads) {
    try {
      const firstTweet = tweetMap.get(firstId)!

      // Thread 생성
      const thread = await prisma.thread.create({
        data: {
          conversationId: firstId,
          authorUsername: username,
          tweetCount: tweetIds.length,
          firstTweetUrl: `https://twitter.com/${username}/status/${firstId}`,
          firstTweetDate: new Date(firstTweet.created_at),
        },
      })

      // Tweets 생성
      const tweetsToCreate = tweetIds.map((id, index) => {
        const tweet = tweetMap.get(id)!
        return {
          id: BigInt(id),
          threadId: thread.id,
          content: tweet.full_text,
          createdAt: new Date(tweet.created_at),
          authorUsername: username,
          sequenceNumber: index + 1,
          replyToId: tweet.in_reply_to_status_id
            ? BigInt(tweet.in_reply_to_status_id)
            : null,
          mediaUrls: tweet.entities?.media?.map((m) => m.media_url_https) || [],
        }
      })

      await prisma.tweet.createMany({
        data: tweetsToCreate,
      })

      // Series 생성 (각 Thread마다 하나의 Series)
      // 안전한 제목 생성 (특수문자 제거)
      const rawTitle = firstTweet.full_text
        .slice(0, 50)
        .replace(/\n/g, ' ')
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // 제어 문자 제거
        .replace(/[\\]/g, '') // 백슬래시 제거
        .trim()

      const seriesTitle = rawTitle.length > 0
        ? rawTitle + (firstTweet.full_text.length > 50 ? '...' : '')
        : `타래 #${firstId.slice(-8)}`

      const seriesSlug = `${username}-${firstId}`

      const series = await prisma.series.create({
        data: {
          authorUsername: username,
          title: seriesTitle,
          description: `${tweetIds.length}개의 트윗으로 구성된 타래`,
          slug: seriesSlug,
          totalTweets: tweetIds.length,
          totalThreads: 1,
          isPublic: true,
        },
      })

      // SeriesThread 연결
      await prisma.seriesThread.create({
        data: {
          seriesId: series.id,
          threadId: thread.id,
          sequenceNumber: 1,
        },
      })

      seriesCreated++
      console.log(
        `Created thread ${thread.id} with ${tweetIds.length} tweets and series ${series.id}`
      )
    } catch (error) {
      console.error(`Failed to create thread for ${firstId}:`, error)
    }
  }

  return {
    threadsFound: threads.size,
    seriesCreated,
    totalTweets: tweetsData.length,
  }
}

/**
 * 타래 감지: reply_to 체인을 따라가며 연결된 트윗들을 그룹화
 */
function detectThreads(tweetMap: Map<string, any>): Map<string, string[]> {
  const threads: Map<string, string[]> = new Map()
  const visited = new Set<string>()

  for (const [tweetId, tweet] of tweetMap) {
    if (visited.has(tweetId)) continue

    // 이 트윗이 속한 타래의 첫 트윗을 찾기
    const firstTweetId = findThreadStart(tweetId, tweetMap)

    // 이미 처리된 타래인지 확인
    if (threads.has(firstTweetId)) {
      visited.add(tweetId)
      continue
    }

    // 타래의 모든 트윗 수집
    const threadTweets = collectThreadTweets(firstTweetId, tweetMap)

    // 3개 이상인 경우만 타래로 인식
    if (threadTweets.length >= 3) {
      threads.set(firstTweetId, threadTweets)
      threadTweets.forEach((id) => visited.add(id))
    }
  }

  return threads
}

/**
 * 타래의 시작 트윗을 찾기 (reply_to를 역방향으로 추적)
 */
function findThreadStart(tweetId: string, tweetMap: Map<string, any>): string {
  let current = tweetMap.get(tweetId)
  if (!current) return tweetId

  // reply_to를 따라 최상위 부모까지 올라가기
  while (current.in_reply_to_status_id || current.in_reply_to_status_id_str) {
    const parentId =
      current.in_reply_to_status_id || current.in_reply_to_status_id_str
    const parent = tweetMap.get(parentId)

    // 부모가 없으면 (다른 사람 트윗에 대한 reply) 여기서 멈춤
    if (!parent) break

    current = parent
  }

  return current.id
}

/**
 * 타래의 모든 트윗을 순서대로 수집 (DFS)
 */
function collectThreadTweets(
  tweetId: string,
  tweetMap: Map<string, any>
): string[] {
  const result: string[] = [tweetId]

  // 이 트윗에 대한 모든 직접 reply 찾기
  const directReplies = Array.from(tweetMap.values()).filter(
    (t) =>
      t.in_reply_to_status_id === tweetId ||
      t.in_reply_to_status_id_str === tweetId
  )

  // 재귀적으로 하위 트윗들 수집
  for (const reply of directReplies) {
    result.push(...collectThreadTweets(reply.id, tweetMap))
  }

  return result
}

/**
 * Twitter Archive의 profile.js에서 사용자 이름 추출
 */
export function extractUsernameFromProfile(profileContent: string): string {
  try {
    // window.YTD.account.part0 = [...] 형식
    const jsonString = profileContent
      .replace(/^window\.YTD\.[a-z_]+\.part\d+ = /, '')
      .replace(/;?\s*$/, '')

    const profileData = JSON.parse(jsonString)

    // profile.js 구조: [{ account: { username: "..." } }]
    if (profileData?.[0]?.account?.username) {
      return profileData[0].account.username
    }

    return 'archived_user'
  } catch (error) {
    console.error('Failed to extract username from profile:', error)
    return 'archived_user'
  }
}
