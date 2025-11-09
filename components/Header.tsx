import Link from 'next/link'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/heart-icon.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold">ThreadSaver</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/series"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            시리즈
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            대시보드
          </Link>
          <Link
            href="/dashboard/import"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Archive 가져오기
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  return (
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
  )
}
