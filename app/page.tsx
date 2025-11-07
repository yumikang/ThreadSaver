import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          StoryArchive
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8">
          트위터 연재물을, 웹소설처럼 읽는다
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/series">시리즈 둘러보기</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/dashboard">창작 시작하기</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>📚 시리즈 관리</CardTitle>
              <CardDescription>
                흩어진 타래들을 하나의 시리즈로 묶어 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 여러 타래를 시리즈로 그룹화</li>
                <li>• 드래그 앤 드롭 순서 편집</li>
                <li>• 완결/연재중 상태 관리</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📖 끊김없는 읽기</CardTitle>
              <CardDescription>
                연속 스크롤로 몰입감 있는 독서 경험
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 500트윗 단위 페이지네이션</li>
                <li>• 자동 이어보기 기능</li>
                <li>• 진행률 표시 및 북마크</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💾 영구 백업</CardTitle>
              <CardDescription>
                계정 정지/삭제 걱정 없는 안전한 보관
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 타래 전체 자동 수집</li>
                <li>• Markdown/JSON/HTML 다운로드</li>
                <li>• 이미지 포함 완전 백업</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">지금 바로 시작하세요</h2>
        <p className="text-muted-foreground mb-8">
          트위터 타래 URL만 있으면 바로 아카이브할 수 있습니다
        </p>
        <Button size="lg" asChild>
          <Link href="/dashboard">무료로 시작하기</Link>
        </Button>
      </section>
    </main>
  );
}
