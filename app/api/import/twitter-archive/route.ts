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
    // 1. FormData에서 파일과 모드 가져오기
    const formData = await request.formData()
    const file = formData.get('archive') as File
    const mode = (formData.get('mode') as string) || 'zip'

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    console.log(`Processing file: ${file.name} (${file.size} bytes), mode: ${mode}`)

    let tweetsContent = ''
    let username = 'archived_user'

    // 2. 모드에 따라 다른 처리
    if (mode === 'js') {
      // tweets.js 파일을 직접 업로드한 경우
      if (!file.name.endsWith('.js')) {
        return NextResponse.json(
          { error: 'File must be a .js file' },
          { status: 400 }
        )
      }

      // 파일 내용을 직접 읽기
      const arrayBuffer = await file.arrayBuffer()
      tweetsContent = new TextDecoder('utf-8').decode(arrayBuffer)
      console.log('Successfully read tweets.js file')
    } else {
      // ZIP 파일 처리 (기존 로직)
      if (!file.name.endsWith('.zip')) {
        return NextResponse.json(
          { error: 'File must be a ZIP archive' },
          { status: 400 }
        )
      }

      // ZIP 파일 로드 (CRC32 체크 비활성화로 더 관대하게 처리)
      const arrayBuffer = await file.arrayBuffer()
      const zip = await JSZip.loadAsync(arrayBuffer, {
        checkCRC32: false, // CRC32 체크 비활성화
        optimizedBinaryString: true,
      })

      console.log('ZIP loaded successfully, file count:', Object.keys(zip.files).length)

      // tweets.js 또는 tweet.js 파일 찾기
      let tweetsFile = zip.file('data/tweets.js') || zip.file('data/tweet.js')

      // 다양한 경로 시도
      if (!tweetsFile) {
        const allFiles = Object.keys(zip.files)
        console.log('Searching for tweets.js in:', allFiles.slice(0, 10), '...')

        const tweetsFilePath = allFiles.find(
          (path) =>
            path.endsWith('tweets.js') ||
            path.endsWith('tweet.js') ||
            path.includes('tweets.js') ||
            path.includes('tweet.js')
        )

        if (tweetsFilePath) {
          tweetsFile = zip.file(tweetsFilePath)
          console.log('Found tweets file at:', tweetsFilePath)
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

      // profile.js에서 사용자명 추출 (선택사항)
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

      // tweets.js 파일 내용 읽기
      console.log('Reading tweets.js file from ZIP...')
      tweetsContent = await tweetsFile.async('text')
    }

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
      console.log('Parsed tweets data, first item structure:', JSON.stringify(tweetsData[0], null, 2).slice(0, 500))
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('First 200 chars of jsonString:', jsonString.slice(0, 200))
      return NextResponse.json(
        {
          error:
            'Failed to parse tweets.js. The file format may be invalid.',
          details: process.env.NODE_ENV === 'development' ? String(parseError) : undefined,
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
  } catch (error) {
    console.error('Archive import error:', error)

    // 에러 타입에 따른 메시지
    let errorMessage = 'Failed to process archive'

    if (error instanceof Error) {
      if (error.message?.includes('Invalid or unsupported zip format')) {
        errorMessage = 'Invalid ZIP file format'
      } else if (error.message?.includes('Unexpected end')) {
        errorMessage = 'Archive file is corrupted or incomplete'
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 400 }
      )
    }

    // Handle Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
      errorMessage = 'Some tweets already exist in the database'
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: undefined,
      },
      { status: 500 }
    )
  }
}
