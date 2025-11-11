'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Header, Footer } from '@/components/Header'
import { ChevronLeft, Search } from 'lucide-react'
import type { SeriesData } from '@/lib/types'

// 트윗 개수에 따른 카테고리 분류
function getCategory(tweetCount: number) {
  if (tweetCount <= 5) return '잡썰'
  if (tweetCount <= 10) return '짧썰'
  if (tweetCount <= 20) return '단편'
  return '중장편'
}

const categoryMap = {
  'jabsseol': { name: '잡썰', color: 'bg-gray-500', emoji: '💬', description: '5트윗 이하의 짧은 이야기' },
  'jjalbsseol': { name: '짧썰', color: 'bg-blue-500', emoji: '📝', description: '6~10트윗의 가벼운 이야기' },
  'danpyeon': { name: '단편', color: 'bg-green-500', emoji: '📖', description: '11~20트윗의 완성도 있는 이야기' },
  'jungpyeon': { name: '중장편', color: 'bg-purple-500', emoji: '📚', description: '20트윗 이상의 긴 이야기' },
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string

  const [seriesList, setSeriesList] = useState<SeriesData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const categoryInfo = categoryMap[category as keyof typeof categoryMap]

  useEffect(() => {
    fetchSeries()
  }, [])

  async function fetchSeries() {
    try {
      setLoading(true)
      const res = await fetch('/api/series?limit=1000')
      if (!res.ok) throw new Error('Failed to fetch')
      const response = await res.json()
      setSeriesList(response.data?.data || [])
    } catch (error) {
      console.error('Failed to fetch series:', error)
      setSeriesList([])
    } finally {
      setLoading(false)
    }
  }

  if (!categoryInfo) {
    return (
      <div className="dark-theme min-h-screen flex flex-col">
        <Header />
        <main className="container-custom py-12 flex-1 text-center">
          <h1 className="text-2xl font-bold mb-4">카테고리를 찾을 수 없습니다</h1>
          <Button asChild>
            <Link href="/series">← 시리즈 목록으로</Link>
          </Button>
        </main>
        <Footer />
      </div>
    )
  }

  // 해당 카테고리의 시리즈만 필터링
  const filteredByCategory = seriesList.filter((series) =>
    getCategory(series.totalTweets) === categoryInfo.name
  )

  // 검색어로 추가 필터링
  const filteredSeries = filteredByCategory.filter((series) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      series.title.toLowerCase().includes(query) ||
      series.description?.toLowerCase().includes(query) ||
      series.authorUsername.toLowerCase().includes(query)
    )
  })

  return (
    <div className="dark-theme min-h-screen flex flex-col">
      <Header />
      <main className="container-custom py-12 flex-1">
        {/* 카테고리 헤더 */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/series">
              <ChevronLeft className="w-4 h-4 mr-1" />
              카테고리 목록으로
            </Link>
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className={`${categoryInfo.color} text-white w-20 h-20 rounded-2xl flex items-center justify-center text-4xl`}>
              {categoryInfo.emoji}
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">{categoryInfo.name}</h1>
              <p className="text-muted-foreground">{categoryInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground mb-6">
            <span className="text-2xl font-bold text-white">
              {loading ? '...' : filteredByCategory.length}
            </span>
            <span>개의 시리즈</span>
            {searchQuery && (
              <span className="ml-2 text-sm">
                (검색 결과: {filteredSeries.length}개)
              </span>
            )}
          </div>

          {/* 검색창 */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="제목, 설명, 작성자로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 시리즈 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredSeries.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>
                {searchQuery ? '검색 결과가 없습니다' : '이 카테고리에는 아직 시리즈가 없습니다'}
              </CardTitle>
              {searchQuery && (
                <CardDescription>
                  다른 검색어를 시도해보세요
                </CardDescription>
              )}
            </CardHeader>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((series) => (
              <Link key={series.id} href={`/series/${series.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={
                        series.status === 'completed' ? 'default' :
                        series.status === 'ongoing' ? 'secondary' : 'outline'
                      }>
                        {series.status === 'completed' ? '완결' :
                         series.status === 'ongoing' ? '연재중' : '휴재'}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {series.totalViews.toLocaleString()} views
                      </span>
                    </div>
                    <CardTitle className="line-clamp-2">{series.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {series.description || '설명이 없습니다'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>📚 {series.totalThreads}개 타래</span>
                      <span>💬 {series.totalTweets.toLocaleString()}트윗</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      by @{series.authorUsername}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
