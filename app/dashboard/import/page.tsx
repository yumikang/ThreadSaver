'use client'

import { useState } from 'react'
import { Upload, FileArchive, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Header, Footer } from '@/components/Header'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>('')

  const handleUpload = async () => {
    if (!file) return

    setImporting(true)
    setError('')
    setResult(null)

    const formData = new FormData()
    formData.append('archive', file)
    formData.append('mode', 'js')

    try {
      const res = await fetch('/api/import/twitter-archive', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to process archive')
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="dark-theme min-h-screen flex flex-col">
      <Header />
      <main className="container-custom py-12 max-w-3xl flex-1">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Twitter Archive 가져오기</h1>
          <p className="text-muted-foreground">
            자신의 Twitter 데이터를 가져와서 자동으로 타래를 감지하고 시리즈로 만듭니다
          </p>
        </div>

      {/* 안내 카드 */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <FileArchive className="h-5 w-5" />
            Twitter 데이터 다운로드 방법
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-blue-800">
          <ol className="list-decimal list-inside space-y-2">
            <li>
              <strong>Twitter 설정</strong> 페이지로 이동
              <a
                href="https://twitter.com/settings/download_your_data"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-blue-600 underline hover:text-blue-800"
              >
                바로가기 →
              </a>
            </li>
            <li>"데이터 및 권한" → "데이터 아카이브 다운로드" 클릭</li>
            <li>본인 확인 후 요청 제출 (이메일로 ZIP 파일 수신, 24시간 소요)</li>
            <li>이메일에서 다운로드한 ZIP 파일을 아래에 업로드</li>
          </ol>
          <p className="mt-4 text-xs italic">
            ⚠️ 참고: 전체 트윗 히스토리가 포함되므로 파일 크기가 클 수 있습니다
          </p>
        </CardContent>
      </Card>

      {/* 업로드 영역 */}
      <Card>
        <CardHeader>
          <CardTitle>tweets.js 파일 업로드</CardTitle>
          <CardDescription>
            Twitter Archive에서 추출한 tweets.js 파일을 업로드하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 설명 */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
            <p className="font-semibold mb-1">tweets.js 파일 찾기:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>다운로드한 ZIP 파일을 압축 해제</li>
              <li><code className="bg-yellow-300 text-gray-900 px-2 py-0.5 rounded font-bold">data/tweets.js</code> 또는 <code className="bg-yellow-300 text-gray-900 px-2 py-0.5 rounded font-bold">data/tweet.js</code> 파일 찾기</li>
              <li>해당 파일을 아래에 업로드</li>
            </ol>
          </div>

          {/* 파일 선택 */}
          <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-primary/50 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

            <input
              type="file"
              accept=".js"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="archive-upload"
              disabled={importing}
            />

            <label htmlFor="archive-upload">
              <Button variant="outline" asChild disabled={importing}>
                <span className="cursor-pointer">
                  {file ? '다른 파일 선택' : 'tweets.js 파일 선택'}
                </span>
              </Button>
            </label>

            {file && (
              <div className="mt-4 p-3 bg-secondary rounded-md">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>

          {/* 에러 표시 */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-destructive">업로드 실패</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* 결과 표시 */}
          {result && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900">가져오기 완료!</p>
                <ul className="text-sm text-green-800 mt-2 space-y-1">
                  <li>총 트윗: <strong>{result.totalTweets?.toLocaleString()}</strong>개</li>
                  <li>발견된 타래: <strong>{result.threadsFound}</strong>개</li>
                  <li>생성된 시리즈: <strong>{result.seriesCreated}</strong>개</li>
                </ul>
                <Button asChild className="mt-4">
                  <Link href="/dashboard">대시보드로 이동</Link>
                </Button>
              </div>
            </div>
          )}

          {/* 업로드 버튼 */}
          <Button
            onClick={handleUpload}
            disabled={!file || importing}
            className="w-full"
            size="lg"
          >
            {importing ? '처리 중...' : '가져오기 시작'}
          </Button>
        </CardContent>
      </Card>

      {/* 도움말 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">자주 묻는 질문</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-4">
          <div>
            <p className="font-semibold mb-1">Q. 타래는 어떻게 감지되나요?</p>
            <p className="text-muted-foreground">
              연속된 reply 관계를 분석하여 3개 이상 연결된 트윗을 자동으로 타래로 인식합니다.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Q. 업로드한 데이터는 안전한가요?</p>
            <p className="text-muted-foreground">
              네, 타래 정보만 추출하여 저장하며 민감한 개인정보는 처리하지 않습니다.
            </p>
          </div>
          <div>
            <p className="font-semibold mb-1">Q. 남의 트윗도 가져올 수 있나요?</p>
            <p className="text-muted-foreground">
              Archive는 본인 트윗만 포함됩니다. 다른 사람의 타래는 Browser Extension을 사용하세요 (곧 출시).
            </p>
          </div>
        </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
