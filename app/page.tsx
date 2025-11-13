'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { Header, Footer } from '@/components/Header'

export default function Home() {
  const router = useRouter()

  const handleArchiveImport = () => {
    router.push('/dashboard/import')
  }

  return (
    <main className="min-h-screen dark-theme">
      <Header />
      {/* Hero Section */}
      <section className="hero-simple">
        <div className="container-custom">
          <div className="hero-simple-content">
            {/* Icon */}
            <div className="hero-icon">
              <img src="/heart-icon.png" alt="Heart Icon" className="heart-icon-img" />
            </div>

            {/* Main Title */}
            <h1 className="hero-simple-title">
              ThreadSaver : 트위터 썰 수집기
            </h1>

            {/* Subtitle */}
            <p className="hero-simple-subtitle">
              흩어진 트위터 타래들을 한곳에 모아서<br/>
              웹소설처럼 편하게 읽어보세요 ✨
            </p>

            {/* Quick Start - Archive Import */}
            <div className="quick-start-form">
              <div className="input-group">
                <p className="input-label" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                  트위터 아카이브 파일을 가져와서<br/>
                  나만의 시리즈를 만들어보세요
                </p>
              </div>
              <button
                className="btn-quick-start"
                onClick={handleArchiveImport}
              >
                아카이브 가져오기 📦
              </button>
            </div>

            {/* Alternative Options */}
            <div className="alternative-options">
              <span className="or-divider">또는</span>
            </div>

            {/* CTA Buttons */}
            <div className="hero-buttons-simple">
              <Button size="lg" variant="outline" className="btn-cta-secondary" asChild>
                <Link href="/series">시리즈 둘러보기</Link>
              </Button>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
