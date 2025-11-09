import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

async function getSeriesList() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/series?limit=20`, {
      cache: 'no-store',
    })
    if (!res.ok) return { data: [], pagination: {} }
    return await res.json()
  } catch (error) {
    console.error('Failed to fetch series:', error)
    return { data: [], pagination: {} }
  }
}

export default async function SeriesListPage() {
  const { data: seriesList } = await getSeriesList()

  return (
    <main className="dark-theme min-h-screen">
      <div className="container-custom py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">시리즈 둘러보기</h1>
          <p className="text-muted-foreground">
            다양한 창작물을 웹소설처럼 편안하게 읽어보세요
          </p>
        </div>

      {seriesList.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>아직 등록된 시리즈가 없습니다</CardTitle>
            <CardDescription>
              첫 번째 시리즈를 만들어보세요!
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button asChild>
              <Link href="/dashboard">시리즈 만들기</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {seriesList.map((series: any) => (
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
      </div>
    </main>
  )
}
