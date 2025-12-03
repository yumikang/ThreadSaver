import { NextRequest, NextResponse } from 'next/server'
import { list, del } from '@vercel/blob'
import {
  processTwitterArchive,
  extractUsernameFromProfile,
} from '@/lib/twitter-archive-processor'

export const runtime = 'nodejs'
export const maxDuration = 60

// 청크 병합 및 처리 엔드포인트 (Vercel Blob Storage 사용)
export async function POST(request: NextRequest) {
  try {
    const { uploadId, totalChunks, filename } = await request.json()

    if (!uploadId || !totalChunks) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Vercel Blob에서 청크 리스트 가져오기
    const { blobs } = await list({
      prefix: `uploads/${uploadId}/`,
    })

    if (blobs.length !== totalChunks) {
      return NextResponse.json(
        { error: `Missing chunks: expected ${totalChunks}, got ${blobs.length}` },
        { status: 400 }
      )
    }

    // 청크를 인덱스 순서대로 정렬
    const sortedBlobs = blobs.sort((a, b) => {
      const aIndex = parseInt(a.pathname.split('chunk-')[1])
      const bIndex = parseInt(b.pathname.split('chunk-')[1])
      return aIndex - bIndex
    })

    console.log(`Merging ${sortedBlobs.length} chunks from Blob Storage...`)

    // 모든 청크를 병렬로 다운로드 (속도 개선)
    const chunkPromises = sortedBlobs.map(async (blob) => {
      const response = await fetch(blob.url)
      return response.arrayBuffer()
    })
    const chunks = await Promise.all(chunkPromises)

    // 청크 병합
    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
    const fileContent = new Uint8Array(totalLength)
    let offset = 0
    for (const chunk of chunks) {
      fileContent.set(new Uint8Array(chunk), offset)
      offset += chunk.byteLength
    }

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

    // Blob Storage에서 청크 삭제
    try {
      for (const blob of sortedBlobs) {
        await del(blob.url)
      }
      console.log('Cleaned up blob chunks')
    } catch (cleanupError) {
      console.warn('Failed to cleanup blob chunks:', cleanupError)
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
