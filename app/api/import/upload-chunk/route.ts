import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'

export const runtime = 'nodejs'
export const maxDuration = 60

// 청크 업로드 엔드포인트 (Vercel Blob Storage 사용)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const chunk = formData.get('chunk') as Blob
    const chunkIndex = parseInt(formData.get('chunkIndex') as string)
    const totalChunks = parseInt(formData.get('totalChunks') as string)
    const uploadId = formData.get('uploadId') as string

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Vercel Blob Storage에 청크 저장
    const blobPath = `uploads/${uploadId}/chunk-${chunkIndex}`
    const blob = await put(blobPath, chunk, {
      access: 'public',
      addRandomSuffix: false,
    })

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded to blob: ${blob.url}`)

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
      blobUrl: blob.url,
    })
  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    )
  }
}
