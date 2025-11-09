'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { isValidTwitterUrl } from '@/lib/utils'
import { FileArchive } from 'lucide-react'

export default function DashboardPage() {
  const [twitterUrl, setTwitterUrl] = useState('')
  const [seriesTitle, setSeriesTitle] = useState('')
  const [seriesDescription, setSeriesDescription] = useState('')
  const [authorUsername, setAuthorUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleCreateSeries(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!twitterUrl || !seriesTitle || !authorUsername) {
      setError('필수 항목을 모두 입력해주세요')
      return
    }

    if (!isValidTwitterUrl(twitterUrl)) {
      setError('올바른 트위터 URL을 입력해주세요')
      return
    }

    try {
      setLoading(true)

      // Step 1: Scrape thread
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweetUrl: twitterUrl }),
      })

      if (!scrapeRes.ok) {
        const errorData = await scrapeRes.json()
        throw new Error(errorData.error || 'Failed to scrape thread')
      }

      const scrapeData = await scrapeRes.json()

      // Step 2: Create series
      const seriesRes = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: seriesTitle,
          description: seriesDescription,
          authorUsername,
        }),
      })

      if (!seriesRes.ok) {
        const errorData = await seriesRes.json()
        throw new Error(errorData.error || 'Failed to create series')
      }

      const seriesData = await seriesRes.json()
      const seriesId = seriesData.data.id

      // Step 3: Add thread to series
      const addThreadRes = await fetch(`/api/series/${seriesId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadUrl: twitterUrl }),
      })

      if (!addThreadRes.ok) {
        const errorData = await addThreadRes.json()
        throw new Error(errorData.error || 'Failed to add thread to series')
      }

      setSuccess('시리즈가 성공적으로 생성되었습니다!')
      setTwitterUrl('')
      setSeriesTitle('')
      setSeriesDescription('')

      // Redirect to series page after 2 seconds
      setTimeout(() => {
        window.location.href = `/series/${seriesData.data.slug}`
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="dark-theme min-h-screen">
      <div className="container-custom py-12 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">창작자 대시보드</h1>
          <p className="text-muted-foreground">
            트위터 타래를 시리즈로 만들어보세요
          </p>
        </div>

      {/* Twitter Archive 안내 */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <FileArchive className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold mb-2">💡 새로운 방법: Twitter Archive 가져오기</h3>
              <p className="text-sm text-muted-foreground mb-3">
                본인의 Twitter 데이터를 한 번에 가져와서 자동으로 타래를 감지할 수 있습니다.
                스크래핑 없이 안전하고 빠르게!
              </p>
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/import">
                  <FileArchive className="h-4 w-4 mr-2" />
                  Archive 가져오기
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>새 시리즈 만들기</CardTitle>
          <CardDescription>
            트위터 타래 URL을 입력하고 시리즈 정보를 작성하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateSeries} className="space-y-4">
            <div>
              <Label htmlFor="twitter-url">트위터 타래 URL *</Label>
              <Input
                id="twitter-url"
                type="url"
                placeholder="https://twitter.com/username/status/..."
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                타래의 아무 트윗 URL을 입력하세요
              </p>
            </div>

            <div>
              <Label htmlFor="series-title">시리즈 제목 *</Label>
              <Input
                id="series-title"
                placeholder="예: 밤의 도서관"
                value={seriesTitle}
                onChange={(e) => setSeriesTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="author-username">작가명 (트위터 @아이디) *</Label>
              <Input
                id="author-username"
                placeholder="예: username"
                value={authorUsername}
                onChange={(e) => setAuthorUsername(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="series-description">시리즈 설명</Label>
              <Textarea
                id="series-description"
                placeholder="시리즈에 대한 간단한 설명을 입력하세요"
                value={seriesDescription}
                onChange={(e) => setSeriesDescription(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            {success && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                {success}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? '처리 중...' : '시리즈 만들기'}
            </Button>
          </form>
        </CardContent>
      </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>사용 방법</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. 트위터에서 아카이브하고 싶은 타래의 URL을 복사하세요</p>
            <p>2. 위 폼에 URL과 시리즈 정보를 입력하세요</p>
            <p>3. '시리즈 만들기' 버튼을 클릭하면 자동으로 타래가 수집됩니다</p>
            <p>4. 생성된 시리즈 페이지로 이동하여 확인하세요</p>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
