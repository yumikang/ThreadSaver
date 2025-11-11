import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Header, Footer } from '@/components/Header'
import { ChevronRight } from 'lucide-react'

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

// 카테고리별로 시리즈 그룹화
function groupSeriesByCategory(seriesList: any[]) {
  const grouped = {
    '잡썰': [] as any[],
    '짧썰': [] as any[],
    '단편': [] as any[],
    '중장편': [] as any[],
  }

  seriesList.forEach((series: any) => {
    const category = getCategory(series.totalTweets)
    grouped[category as keyof typeof grouped].push(series)
  })

  return grouped
}

const categories = [
  { name: '잡썰', slug: 'jabsseol', description: '5트윗 이하의 짧은 이야기', color: 'bg-gray-500', emoji: '💬' },
  { name: '짧썰', slug: 'jjalbsseol', description: '6~10트윗의 가벼운 이야기', color: 'bg-blue-500', emoji: '📝' },
  { name: '단편', slug: 'danpyeon', description: '11~20트윗의 완성도 있는 이야기', color: 'bg-green-500', emoji: '📖' },
  { name: '중장편', slug: 'jungpyeon', description: '20트윗 이상의 긴 이야기', color: 'bg-purple-500', emoji: '📚' },
]

export default async function SeriesListPage() {
  const { data: seriesList = [] } = await getSeriesList()
  const groupedSeries = groupSeriesByCategory(seriesList)

  return (
    <div className="dark-theme min-h-screen flex flex-col">
      <Header />
      <main className="container-custom py-12 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">시리즈 둘러보기</h1>
          <p className="text-muted-foreground">
            다양한 창작물을 웹소설처럼 편안하게 읽어보세요
          </p>
        </div>

      {!Array.isArray(seriesList) || seriesList.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <CardTitle>아직 등록된 시리즈가 없습니다</CardTitle>
            <CardDescription>
              첫 번째 시리즈를 만들어보세요!
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {categories.map((category) => {
            const count = groupedSeries[category.name as keyof typeof groupedSeries].length
            if (count === 0) return null

            return (
              <Link key={category.slug} href={`/series/category/${category.slug}`}>
                <Card className="h-full hover:border-primary/50 transition-all cursor-pointer group">
                  <CardContent className="pt-10 pb-10 px-8">
                    <div className="space-y-6">
                      {/* 아이콘 */}
                      <div className="w-12 h-12 rounded-full border border-muted-foreground/30 flex items-center justify-center text-xl">
                        {category.emoji}
                      </div>

                      {/* 제목 */}
                      <h3 className="text-xl font-medium">{category.name}</h3>

                      {/* 설명 */}
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
      </main>
      <Footer />
    </div>
  )
}
