'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatNumber } from '@/lib/utils'

export default function SeriesReaderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [series, setSeries] = useState<any>(null)
  const [tweets, setTweets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<any>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    fetchSeries()
  }, [slug, page])

  async function fetchSeries() {
    try {
      setLoading(true)
      const res = await fetch(`/api/series/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch series')

      const data = await res.json()
      setSeries(data.data)

      // For MVP, we'll show all tweets in continuous scroll
      // In production, implement pagination
      const allTweets: any[] = []
      data.data.threads?.forEach((st: any) => {
        st.thread.tweets.forEach((tweet: any) => {
          allTweets.push({
            ...tweet,
            threadSequence: st.sequenceNumber,
          })
        })
      })

      setTweets(allTweets)
      setPagination({
        total: allTweets.length,
        page: 1,
        totalPages: 1,
      })
    } catch (error) {
      console.error('Error fetching series:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    function handleScroll() {
      const winScroll = document.documentElement.scrollTop
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = (winScroll / height) * 100
      setProgress(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-12 w-2/3 mb-4" />
        <Skeleton className="h-6 w-1/3 mb-8" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </main>
    )
  }

  if (!series) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">시리즈를 찾을 수 없습니다</h1>
        <Button onClick={() => window.history.back()}>돌아가기</Button>
      </main>
    )
  }

  return (
    <main className="dark-theme min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
              >
                ← 뒤로
              </Button>
              <div>
                <h1 className="font-bold line-clamp-1">{series.title}</h1>
                <p className="text-xs text-muted-foreground">
                  {progress > 0 && `${progress.toFixed(0)}% · `}
                  {formatNumber(tweets.length)} 트윗
                </p>
              </div>
            </div>
            <Badge variant={series.status === 'completed' ? 'default' : 'secondary'}>
              {series.status === 'completed' ? '완결' : '연재중'}
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Series Info */}
        <div className="mb-8 pb-8 border-b">
          <h1 className="text-3xl font-bold mb-4">{series.title}</h1>
          {series.description && (
            <p className="text-muted-foreground mb-4">{series.description}</p>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>by @{series.authorUsername}</span>
            <span>·</span>
            <span>{series.totalThreads}개 타래</span>
            <span>·</span>
            <span>{formatNumber(series.totalViews)} 조회</span>
          </div>
        </div>

        {/* Tweets */}
        <div className="space-y-6">
          {tweets.map((tweet, index) => (
            <div key={tweet.id} className="group">
              {index === 0 || tweets[index - 1].threadSequence !== tweet.threadSequence ? (
                <div className="flex items-center gap-4 my-8 text-sm text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>타래 {tweet.threadSequence}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : null}

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-base leading-relaxed whitespace-pre-wrap">
                    {tweet.content}
                  </p>
                  {tweet.mediaUrls && tweet.mediaUrls.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {tweet.mediaUrls.map((url: string, i: number) => (
                        <img
                          key={i}
                          src={url}
                          alt=""
                          className="rounded-lg w-full"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(new Date(tweet.createdAt))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* End */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground mb-4">
            {series.status === 'completed' ? '완결된 시리즈입니다' : '연재중인 시리즈입니다'}
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    </main>
  )
}
