'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Chrome, Download, Settings, Zap, Shield, FileText } from 'lucide-react'
import { Header, Footer } from '@/components/Header'

export default function ExtensionPage() {
  return (
    <div className="dark-theme min-h-screen flex flex-col">
      <Header />
      <main className="container-custom py-12 max-w-4xl flex-1">
        {/* 헤더 섹션 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Chrome className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">ThreadSaver 브라우저 익스텐션 🧵</h1>
          <p className="text-xl text-muted-foreground">
            트위터 페이지에서 직접 타래를 추출하는 Chrome/Edge 익스텐션
          </p>
        </div>

        {/* 주요 기능 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>✨ 주요 기능</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">빠른 추출</h3>
                <p className="text-sm text-muted-foreground">
                  트위터 페이지에서 직접 데이터 추출 (1-5분 소요)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">봇 회피 모드</h3>
                <p className="text-sm text-muted-foreground">
                  안전한 추출을 위한 봇 탐지 회피 기능 (3-5분 소요)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">자동 카테고리 분류</h3>
                <p className="text-sm text-muted-foreground">
                  트윗 개수에 따라 5단계 자동 분류 (잡썰/짧썰/단편/중편/장편)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">점진적 추출</h3>
                <p className="text-sm text-muted-foreground">
                  세션 유지로 중단 없이 이어서 추출 가능
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 설치 방법 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>🚀 설치 방법</CardTitle>
            <CardDescription>3단계로 간단하게 설치하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1단계 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold">익스텐션 코드 가져오기</h3>
              </div>
              <div className="ml-11">
                <p className="text-muted-foreground mb-3">
                  GitHub 저장소를 클론하거나 extension 폴더를 다운로드하세요
                </p>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full">
                    <a
                      href="https://github.com/yumikang/ThreadSaver"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      GitHub 저장소 보기
                    </a>
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    저장소를 클론한 후 <code className="bg-muted px-1.5 py-0.5 rounded">extension/</code> 폴더를 사용하세요
                  </p>
                  <code className="block bg-muted px-3 py-2 rounded text-xs">
                    git clone https://github.com/yumikang/ThreadSaver.git
                  </code>
                </div>
              </div>
            </div>

            {/* 2단계 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold">Chrome에 설치</h3>
              </div>
              <div className="ml-11">
                <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                  <li>Chrome 브라우저에서 <code className="bg-muted px-1.5 py-0.5 rounded">chrome://extensions/</code> 접속</li>
                  <li>오른쪽 상단의 <strong>&quot;개발자 모드&quot;</strong> 토글 활성화</li>
                  <li><strong>&quot;압축해제된 확장 프로그램을 로드합니다&quot;</strong> 클릭</li>
                  <li>다운로드한 <code className="bg-muted px-1.5 py-0.5 rounded">extension</code> 폴더 선택</li>
                  <li>툴바에 🧵 ThreadSaver 아이콘이 나타나면 설치 완료!</li>
                </ol>
              </div>
            </div>

            {/* 3단계 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  3
                </div>
                <h3 className="text-lg font-semibold">서버 URL 설정</h3>
              </div>
              <div className="ml-11">
                <p className="text-muted-foreground mb-2">
                  익스텐션 팝업에서 서버 URL을 설정하세요
                </p>
                <code className="block bg-muted px-3 py-2 rounded text-sm">
                  http://localhost:4000
                </code>
                <p className="text-xs text-muted-foreground mt-2">
                  * 로컬 개발 환경의 경우
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 방법 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📖 사용 방법</CardTitle>
            <CardDescription>트위터 타래를 추출하는 방법</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><strong>1.</strong> 트위터/X에서 저장하고 싶은 타래 페이지로 이동하세요</p>
              <p className="text-muted-foreground ml-6">
                예: <code className="bg-muted px-1.5 py-0.5 rounded">https://x.com/username/status/1234567890</code>
              </p>

              <p className="pt-2"><strong>2.</strong> 툴바의 🧵 ThreadSaver 아이콘을 클릭하세요</p>

              <p className="pt-2"><strong>3.</strong> &quot;📥 타래 추출 시작&quot; 버튼을 클릭하세요</p>
              <p className="text-muted-foreground ml-6">
                • 봇 회피 모드 ON: 안전하지만 느림 (3-5분)<br />
                • 봇 회피 모드 OFF: 빠르지만 차단 위험 (1-2분)
              </p>

              <p className="pt-2"><strong>4.</strong> 추출이 완료되면 &quot;저장&quot; 버튼을 클릭하세요</p>
              <p className="text-muted-foreground ml-6">
                자동으로 카테고리가 분류되어 시리즈로 저장됩니다
              </p>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mt-6">
              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-500 mb-2">
                ⚠️ 주의사항
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 팝업 창을 닫으면 추출이 중단됩니다</li>
                <li>• 긴 타래(100+ 트윗)는 완전히 로드될 때까지 기다려주세요</li>
                <li>• 봇 회피 모드 사용을 권장합니다</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* CTA 섹션 */}
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            익스텐션 없이도 사용하고 싶으신가요?
          </p>
          <Button asChild size="lg">
            <Link href="/dashboard/import">
              Twitter Archive로 가져오기
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
