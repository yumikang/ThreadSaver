'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const [threadUrl, setThreadUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleQuickStart = async () => {
    if (!threadUrl.trim()) {
      alert('트위터 타래 링크를 입력해주세요!')
      return
    }

    // Twitter URL 검증
    const twitterUrlPattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/
    if (!twitterUrlPattern.test(threadUrl)) {
      alert('올바른 트위터 타래 링크를 입력해주세요.\n예: https://twitter.com/username/status/123456789')
      return
    }

    setLoading(true)

    try {
      // Extension API 호출 (실제로는 브라우저 확장에서 처리)
      // 여기서는 일단 스크래핑 페이지로 리다이렉트
      router.push(`/dashboard?url=${encodeURIComponent(threadUrl)}`)
    } catch (error) {
      console.error('Failed to process thread:', error)
      alert('타래 처리 중 오류가 발생했습니다.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen dark-theme">
      {/* Hero Section */}
      <section className="hero-simple">
        <div className="container-custom">
          <div className="hero-simple-content">
            {/* Icon */}
            <div className="hero-icon">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="#8B5CF6" opacity="0.2"/>
                <text x="40" y="55" fontSize="40" textAnchor="middle" fill="#8B5CF6">📚</text>
              </svg>
            </div>

            {/* Main Title */}
            <h1 className="hero-simple-title">
              트위터 썰 수집기
            </h1>

            {/* Subtitle */}
            <p className="hero-simple-subtitle">
              흩어진 트위터 타래들을 한곳에 모아서<br/>
              웹소설처럼 편하게 읽어보세요 ✨
            </p>

            {/* Quick Start Input Form */}
            <div className="quick-start-form">
              <div className="input-group">
                <label htmlFor="threadUrl" className="input-label">
                  타래 링크 (Thread URL)
                </label>
                <input
                  type="text"
                  id="threadUrl"
                  className="thread-input"
                  placeholder="https://twitter.com/username/status/123456789"
                  value={threadUrl}
                  onChange={(e) => setThreadUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleQuickStart()}
                />
              </div>
              <button
                className="btn-quick-start"
                onClick={handleQuickStart}
                disabled={loading}
              >
                {loading ? '처리 중...' : '바로 시작하기 ✨'}
              </button>
            </div>

            {/* Alternative Options */}
            <div className="alternative-options">
              <span className="or-divider">또는</span>
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons-simple">
              <Button size="lg" className="btn-cta" asChild>
                <Link href="/series">시리즈 둘러보기</Link>
              </Button>
              <Button size="lg" variant="outline" className="btn-cta-secondary" asChild>
                <Link href="/dashboard/import">Archive 가져오기</Link>
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="trust-badges">
              <span className="badge-item">✓ 완전 무료</span>
              <span className="badge-item">✓ 로그인 불필요</span>
              <span className="badge-item">✓ 영구 보관</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-simple">
        <div className="container-custom">
          <div className="footer-simple-content">
            <p>© 2025 StoryArchive. All rights reserved.</p>
            <div className="footer-links">
              <Link href="/series">시리즈</Link>
              <Link href="/dashboard">대시보드</Link>
              <Link href="/dashboard/import">Archive 가져오기</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
