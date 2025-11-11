import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const threadId = searchParams.get('threadId')

    if (!threadId) {
      return NextResponse.json({ error: 'threadId required' }, { status: 400 })
    }

    // Delete tweets first
    const deletedTweets = await prisma.tweet.deleteMany({
      where: { threadId }
    })

    // Delete thread
    const deletedThread = await prisma.thread.delete({
      where: { id: threadId }
    })

    return NextResponse.json({
      success: true,
      deletedTweets: deletedTweets.count,
      deletedThread: deletedThread.id
    })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
