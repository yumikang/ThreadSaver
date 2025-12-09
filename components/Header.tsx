'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/95 backdrop-blur">
      <div className="container-custom flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/heart-icon.png" alt="Logo" className="w-8 h-8" />
          <span className="text-xl font-bold">ThreadSaver</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/series"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            시리즈
          </Link>
          <Link
            href="/extension"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Extension
          </Link>
          <Link
            href="/dashboard/import"
            className="text-sm font-medium text-white/70 hover:text-white transition-colors"
          >
            Archive 가져오기
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white/70 hover:text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background border-b border-white/10 p-4 shadow-lg animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            <Link
              href="/series"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              시리즈
            </Link>
            <Link
              href="/extension"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Extension
            </Link>
            <Link
              href="/dashboard/import"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors p-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Archive 가져오기
            </Link>
          </nav>
        </div>
      )}
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
            <Link href="/extension">Extension</Link>
            <Link href="/dashboard/import">Archive 가져오기</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
