import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Header, Footer } from '@/components/Header'
import { ChevronLeft } from 'lucide-react'

async function getSeriesList() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/series?limit=1000`, {
      cache: 'no-store',
    })
    if (!res.ok) return { data: [], pagination: {} }
    const response = await res.json()
    return response.data || { data: [], pagination: {} }
  } catch (error) {
    console.error('Failed to fetch series:', error)
    return { data: [], pagination: {} }
  }
}

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

export default async function CategoryPage({ params }: { params: { category: string } }) {
  const { data: seriesList = [] } = await getSeriesList()
  const categoryInfo = categoryMap[params.category as keyof typeof categoryMap]

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
  const filteredSeries = seriesList.filter((series: any) =>
    getCategory(series.totalTweets) === categoryInfo.name
  )

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

          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="text-2xl font-bold text-foreground">{filteredSeries.length}</span>
            <span>개의 시리즈</span>
          </div>
        </div>

        {/* 시리즈 목록 */}
        {filteredSeries.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <CardTitle>이 카테고리에는 아직 시리즈가 없습니다</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSeries.map((series: any) => (
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
