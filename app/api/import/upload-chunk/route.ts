import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export const runtime = 'nodejs'
export const maxDuration = 60

// 청크 업로드 엔드포인트
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

    // 임시 디렉토리 생성
    const tmpDir = join('/tmp', 'uploads', uploadId)
    if (!existsSync(tmpDir)) {
      await mkdir(tmpDir, { recursive: true })
    }

    // 청크 저장
    const chunkPath = join(tmpDir, `chunk-${chunkIndex}`)
    const buffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, buffer)

    console.log(`Chunk ${chunkIndex + 1}/${totalChunks} uploaded (${buffer.length} bytes)`)

    return NextResponse.json({
      success: true,
      chunkIndex,
      totalChunks,
    })
  } catch (error) {
    console.error('Chunk upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload chunk' },
      { status: 500 }
    )
  }
}
