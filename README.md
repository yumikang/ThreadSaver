# StoryArchive (ThreadSaver)

**"트위터 연재물을, 웹소설처럼 읽는다"**

트위터(X)에서 썰/소설 연작을 쓰는 창작자를 위한 전문 아카이브 도구입니다.

## 🚀 Quick Start

### 🎯 가장 쉬운 방법 (권장)

프로젝트 폴더에서 **`ThreadSaver 서버 시작.command`** 파일을 더블클릭하세요!
- ✅ 자동으로 서버 시작 (포트 4000)
- ✅ 브라우저 자동 열림 (http://localhost:4000)
- ✅ 창을 닫으면 서버 종료

### 📋 수동 실행 방법

#### 방법 1: 실행 스크립트 사용
```bash
./start.sh
```

#### 방법 2: 직접 명령어 입력
```bash
PORT=4000 npm run dev
```

그 다음 브라우저에서 [http://localhost:4000](http://localhost:4000)으로 접속하세요.

### 📦 초기 설치 (처음 한 번만)

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run Prisma migrations
npx prisma migrate dev
npx prisma generate
```

## 📁 Project Structure

```
threadsaver/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── series/            # Series pages
│   ├── dashboard/         # Creator dashboard
│   └── layout.tsx
├── components/            # React components
├── lib/                   # Utilities & helpers
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, FastAPI (scraper)
- **Database**: Supabase (PostgreSQL), Prisma ORM
- **Deployment**: Vercel (frontend), VPS (scraper)

## 📚 Features

- ✅ Thread collection from Twitter/X
- ✅ Series management (group multiple threads)
- ✅ Continuous scroll reader (500 tweets pagination)
- ✅ Bookmark system
- ✅ Reading progress tracking
- ✅ Creator dashboard
- ✅ Download (Markdown, JSON, HTML)

## 📖 Documentation

See [prd.md](./prd.md) for detailed product requirements.

## 🔗 Links

- **Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)
- **VPS Scraper**: https://api.one-q.xyz
- **Database**: Supabase (PostgreSQL)

---

Made with ❤️ for Korean Twitter storytellers
