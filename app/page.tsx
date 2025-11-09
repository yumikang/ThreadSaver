import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
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

            {/* CTA Buttons */}
            <div className="hero-buttons-simple">
              <Button size="lg" className="btn-cta" asChild>
                <Link href="/series">시리즈 둘러보기</Link>
              </Button>
              <Button size="lg" variant="outline" className="btn-cta-secondary" asChild>
                <Link href="/dashboard">시작하기</Link>
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

      <style jsx global>{`
        /* Reset & Base */
        .dark-theme {
          background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1e 100%);
          min-height: 100vh;
          color: #ffffff;
        }

        .container-custom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 80px;
        }

        @media (max-width: 768px) {
          .container-custom {
            padding: 0 24px;
          }
        }

        /* Hero Simple */
        .hero-simple {
          padding: 140px 0 80px;
          min-height: calc(100vh - 64px);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-simple-content {
          max-width: 600px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-icon {
          margin: 0 auto 32px;
          display: flex;
          justify-content: center;
          animation: floatIcon 3s ease-in-out infinite;
        }

        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .hero-simple-title {
          font-size: 48px;
          font-weight: 700;
          line-height: 1.3;
          color: #ffffff;
          margin-bottom: 24px;
          letter-spacing: -0.02em;
        }

        .hero-simple-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 48px;
          line-height: 1.6;
        }

        .hero-buttons-simple {
          display: flex;
          gap: 16px;
          justify-content: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
        }

        .btn-cta {
          background: #8B5CF6;
          color: #ffffff;
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          transition: all 0.2s ease;
          border: none;
        }

        .btn-cta:hover {
          background: #7C3AED;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
          transform: translateY(-2px);
        }

        .btn-cta-secondary {
          background: transparent;
          color: #8B5CF6;
          border: 2px solid #8B5CF6;
          padding: 16px 32px;
          font-size: 18px;
          font-weight: 600;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .btn-cta-secondary:hover {
          background: rgba(139, 92, 246, 0.1);
          border-color: #7C3AED;
          color: #7C3AED;
        }

        /* Trust Badges */
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 32px;
        }

        .badge-item {
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        /* Footer Simple */
        .footer-simple {
          padding: 32px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-simple-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
        }

        .footer-simple-content p {
          margin: 0;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #ffffff;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-simple {
            padding: 100px 0 60px;
          }

          .hero-simple-title {
            font-size: 36px;
          }

          .hero-simple-subtitle {
            font-size: 16px;
            margin-bottom: 32px;
          }

          .hero-buttons-simple {
            flex-direction: column;
            width: 100%;
          }

          .hero-buttons-simple .btn-cta,
          .hero-buttons-simple .btn-cta-secondary {
            width: 100%;
          }

          .trust-badges {
            flex-direction: column;
            gap: 8px;
          }

          .footer-simple-content {
            flex-direction: column;
            gap: 16px;
            text-align: center;
          }

          .footer-links {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </main>
  )
}
