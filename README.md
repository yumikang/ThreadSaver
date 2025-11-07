# StoryArchive (ThreadSaver)

**"트위터 연재물을, 웹소설처럼 읽는다"**

트위터(X)에서 썰/소설 연작을 쓰는 창작자를 위한 전문 아카이브 도구입니다.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL (VPS: 141.164.60.51:5432)
- Python FastAPI scraper (VPS: api.one-q.xyz)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials

# Run Prisma migrations
npx prisma migrate dev
npx prisma generate

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

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

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, FastAPI (scraper)
- **Database**: PostgreSQL, Prisma ORM
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

- **PRD**: [prd.md](./prd.md)
- **VPS Scraper**: https://api.one-q.xyz
- **Database**: 141.164.60.51:5432

---

Made with ❤️ for Korean Twitter storytellers
