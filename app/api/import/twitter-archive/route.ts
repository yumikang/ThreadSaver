import { NextRequest, NextResponse } from 'next/server'
import JSZip from 'jszip'
import {
  processTwitterArchive,
  extractUsernameFromProfile,
} from '@/lib/twitter-archive-processor'

export const runtime = 'nodejs'
export const maxDuration = 60 // 최대 60초 실행 시간

export async function POST(request: NextRequest) {
  try {
    // 1. FormData에서 파일 가져오기
    const formData = await request.formData()
    const file = formData.get('archive') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json(
        { error: 'File must be a ZIP archive' },
        { status: 400 }
      )
    }

    console.log(`Processing archive: ${file.name} (${file.size} bytes)`)

    // 2. ZIP 파일 로드
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)

    // 3. tweets.js 또는 tweet.js 파일 찾기
    let tweetsFile = zip.file('data/tweets.js') || zip.file('data/tweet.js')

    // 다양한 경로 시도
    if (!tweetsFile) {
      const allFiles = Object.keys(zip.files)
      const tweetsFilePath = allFiles.find(
        (path) =>
          path.endsWith('tweets.js') ||
          path.endsWith('tweet.js') ||
          path.includes('tweets.js') ||
          path.includes('tweet.js')
      )

      if (tweetsFilePath) {
        tweetsFile = zip.file(tweetsFilePath)
      }
    }

    if (!tweetsFile) {
      return NextResponse.json(
        {
          error:
            'tweets.js not found in archive. Please ensure you uploaded a valid Twitter archive.',
        },
        { status: 400 }
      )
    }

    // 4. profile.js에서 사용자명 추출 (선택사항)
    let username = 'archived_user'
    const profileFile = zip.file('data/profile.js') || zip.file('data/account.js')

    if (profileFile) {
      try {
        const profileContent = await profileFile.async('text')
        username = extractUsernameFromProfile(profileContent)
        console.log(`Extracted username: ${username}`)
      } catch (error) {
        console.warn('Failed to extract username from profile, using default')
      }
    }

    // 5. tweets.js 파일 내용 읽기
    const tweetsContent = await tweetsFile.async('text')

    // 6. JavaScript 파싱 (window.YTD... 제거)
    const jsonString = tweetsContent
      .replace(/^window\.YTD\.tweets?\.part\d+ = /, '')
      .replace(/;?\s*$/, '')
      .trim()

    if (!jsonString) {
      return NextResponse.json(
        { error: 'tweets.js file is empty' },
        { status: 400 }
      )
    }

    let tweetsData
    try {
      tweetsData = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        {
          error:
            'Failed to parse tweets.js. The file format may be invalid.',
        },
        { status: 400 }
      )
    }

    if (!Array.isArray(tweetsData) || tweetsData.length === 0) {
      return NextResponse.json(
        { error: 'No tweets found in archive' },
        { status: 400 }
      )
    }

    console.log(`Found ${tweetsData.length} tweets in archive`)

    // 7. 타래 감지 및 DB 저장
    const result = await processTwitterArchive(tweetsData, username)

    console.log('Archive processing complete:', result)

    // 8. 성공 응답
    return NextResponse.json({
      success: true,
      totalTweets: result.totalTweets,
      threadsFound: result.threadsFound,
      seriesCreated: result.seriesCreated,
      username,
    })
  } catch (error: any) {
    console.error('Archive import error:', error)

    // 에러 타입에 따른 메시지
    let errorMessage = 'Failed to process archive'

    if (error.message?.includes('Invalid or unsupported zip format')) {
      errorMessage = 'Invalid ZIP file format'
    } else if (error.message?.includes('Unexpected end')) {
      errorMessage = 'Archive file is corrupted or incomplete'
    } else if (error.code === 'P2002') {
      errorMessage = 'Some tweets already exist in the database'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
      { status: 500 }
    )
  }
}
