import { NextRequest, NextResponse } from 'next/server'
import { readFile, readdir, unlink, rmdir } from 'fs/promises'
import { join } from 'path'
import {
  processTwitterArchive,
  extractUsernameFromProfile,
} from '@/lib/twitter-archive-processor'

export const runtime = 'nodejs'
export const maxDuration = 60

// 청크 병합 및 처리 엔드포인트
export async function POST(request: NextRequest) {
  try {
    const { uploadId, totalChunks, filename } = await request.json()

    if (!uploadId || !totalChunks) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 임시 디렉토리에서 청크 읽기
    const tmpDir = join('/tmp', 'uploads', uploadId)
    const files = await readdir(tmpDir)
    const chunkFiles = files
      .filter((f) => f.startsWith('chunk-'))
      .sort((a, b) => {
        const aIndex = parseInt(a.split('-')[1])
        const bIndex = parseInt(b.split('-')[1])
        return aIndex - bIndex
      })

    if (chunkFiles.length !== totalChunks) {
      return NextResponse.json(
        { error: `Missing chunks: expected ${totalChunks}, got ${chunkFiles.length}` },
        { status: 400 }
      )
    }

    console.log(`Merging ${chunkFiles.length} chunks...`)

    // 청크 병합
    const chunks: Buffer[] = []
    for (const chunkFile of chunkFiles) {
      const chunkPath = join(tmpDir, chunkFile)
      const chunkData = await readFile(chunkPath)
      chunks.push(chunkData)
    }

    const fileContent = Buffer.concat(chunks)
    console.log(`Merged file size: ${fileContent.length} bytes`)

    // 파일 내용 텍스트로 변환
    const tweetsContent = new TextDecoder('utf-8').decode(fileContent)

    // JavaScript 파싱 (window.YTD... 제거)
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
      console.log('Parsed tweets data, total items:', tweetsData.length)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      return NextResponse.json(
        {
          error: 'Failed to parse tweets.js. The file format may be invalid.',
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

    // 타래 감지 및 DB 저장
    const result = await processTwitterArchive(tweetsData, 'archived_user')

    // 임시 파일 정리
    try {
      for (const chunkFile of chunkFiles) {
        await unlink(join(tmpDir, chunkFile))
      }
      await rmdir(tmpDir)
      console.log('Cleaned up temporary files')
    } catch (cleanupError) {
      console.warn('Failed to cleanup temp files:', cleanupError)
    }

    console.log('Archive processing complete:', result)

    return NextResponse.json({
      success: true,
      totalTweets: result.totalTweets,
      threadsFound: result.threadsFound,
      seriesCreated: result.seriesCreated,
    })
  } catch (error) {
    console.error('Finalize upload error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: 'Failed to process archive',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process archive' },
      { status: 500 }
    )
  }
}
