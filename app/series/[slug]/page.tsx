'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatNumber } from '@/lib/utils'
import { Header, Footer } from '@/components/Header'
import { Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import type { SeriesData, TweetData } from '@/lib/types'

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

interface ExtendedTweetData extends TweetData {
  threadSequence: number
}

export default function SeriesReaderPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string
  const page = parseInt(searchParams.get('page') || '1', 10)

  const [series, setSeries] = useState<SeriesData | null>(null)
  const [tweets, setTweets] = useState<ExtendedTweetData[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [progress, setProgress] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchSeries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, page])

  async function fetchSeries() {
    try {
      setLoading(true)
      const res = await fetch(`/api/series/${slug}`)
      if (!res.ok) throw new Error('Failed to fetch series')

      const response = await res.json()
      // API response structure: { success: true, data: { ...seriesData, threads: [...] } }
      setSeries(response.data)

      // For MVP, we'll show all tweets in continuous scroll
      // In production, implement pagination
      const allTweets: ExtendedTweetData[] = []
      response.data.threads?.forEach((st: { sequenceNumber: number; thread: { tweets: TweetData[] } }) => {
        st.thread.tweets.forEach((tweet: TweetData) => {
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
        limit: allTweets.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
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

  async function handleDelete() {
    if (!series) return

    setDeleting(true)
    try {
      const res = await fetch(`/api/series/${series.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete series')

      // 삭제 성공 시 시리즈 목록으로 이동
      router.push('/series')
    } catch (error) {
      console.error('Error deleting series:', error)
      alert('시리즈 삭제에 실패했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="dark-theme min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl flex-1">
          <Skeleton className="h-12 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/3 mb-8" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!series) {
    return (
      <div className="dark-theme min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 py-12 max-w-3xl text-center flex-1">
          <h1 className="text-2xl font-bold mb-4">시리즈를 찾을 수 없습니다</h1>
          <Button onClick={() => window.history.back()}>돌아가기</Button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="dark-theme min-h-screen flex flex-col">
      <Header />
      {/* Reader Header */}
      <div className="sticky top-16 z-10 bg-background/95 backdrop-blur border-b">
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
            <div className="flex items-center gap-2">
              <Badge variant={series.status === 'completed' ? 'default' : 'secondary'}>
                {series.status === 'completed' ? '완결' : '연재중'}
              </Badge>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" disabled={deleting}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>시리즈를 삭제하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                      이 작업은 되돌릴 수 없습니다. 시리즈와 관련된 모든 데이터가 영구적으로 삭제됩니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                      {deleting ? '삭제 중...' : '삭제'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-1 rounded-none" />
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl flex-1">
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
        <div className="space-y-4">
          {tweets.map((tweet, index) => (
            <div key={tweet.id}>
              {index === 0 || tweets[index - 1].threadSequence !== tweet.threadSequence ? (
                <div className="flex items-center gap-4 my-8 text-sm text-muted-foreground">
                  <div className="h-px flex-1 bg-border" />
                  <span>타래 {tweet.threadSequence}</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
              ) : null}

              <div>
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
      </main>
      <Footer />
    </div>
  )
}
