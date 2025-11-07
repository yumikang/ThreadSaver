🧵 StoryArchive — 트위터 창작물 아카이브 & 연작 관리 플랫폼 (최종 통합 PRD)

1️⃣ 프로젝트 개요
🎯 목적
트위터(X)에서 썰/소설 연작을 쓰는 창작자를 위한 전문 아카이브 도구. 흩어진 타래들을 시리즈로 구성하고, 독자 친화적인 뷰어로 제공.
"트위터의 연재물을, 웹소설처럼 읽는다."
📌 핵심 가치
1. 창작자: 연작 관리 + 포트폴리오 구축
2. 독자: 끊김 없이 몰아보기, 북마크로 중요 장면 저장
3. 보존: 계정 정지/삭제 대비 영구 백업
4. 접근성: SNS 콘텐츠의 휘발성 문제 해결
🌐 서비스 형태
웹 애플리케이션 (모바일/데스크톱 반응형)
* 창작자용 관리 대시보드
* 독자용 연속 스크롤 뷰어
* 크로스 플랫폼 자동 지원
* URL 공유 용이

2️⃣ 목표 사용자
구분	설명	주요 니즈
🖋️ 썰러/작가	트위터에 썰/소설 연작을 올리는 창작자	시리즈 관리, 독자 유입, 포트폴리오
📚 독자	창작물을 정주행하고 싶은 사람	끊김 없는 읽기, 북마크, 이어보기
🎨 포트폴리오 구축자	작품을 모아서 보여주고 싶은 사람	깔끔한 아카이브, 공유 링크
✍️ 리서처/저널리스트	특정 타래/이슈를 기록·분석	중요 타래 자료 보관
3️⃣ 핵심 기능 정의 (MVP 범위)
✅ 1. 타래 수집 (Core)
입력 방식
* 트윗 URL 입력 (단일 트윗 or 타래 내 아무 트윗)
* conversation_id 자동 추출 → 전체 타래 수집
크롤링 전략
* Primary: snscrape (Python) - 빠르고 안정적
* Fallback: Twitter API v2 (rate limit 대비)
* 수집 데이터: 트윗 ID, 작성자, 작성일시, 본문, 미디어 URL, 원문 링크
제약사항
* 비공개 계정 트윗은 수집 불가
* 삭제된 트윗은 표시만 (내용 복구 불가)
* 최대 5,000개 트윗까지 한 시리즈로 인식
✅ 2. 시리즈 관리 (신규 핵심)
데이터 구조
Series {
  id: UUID
  title: "밤의 도서관"
  description: "폐쇄된 도서관에서 일어나는 기묘한 이야기"
  author_username: string
  cover_image_url?: string
  status: "ongoing" | "completed" | "hiatus"
  slug: "night-library"  // URL 친화적
  total_tweets: number
  total_threads: number
  created_at: timestamp
  updated_at: timestamp
}

SeriesThread {
  series_id: UUID
  thread_id: UUID
  sequence_number: number  // 시리즈 내 순서
  added_at: timestamp
}
핵심 개념
* 1개 타래(thread) = 작가가 올린 하나의 연재분
* 여러 타래를 하나의 시리즈로 묶음
* 회차 구분 없음 - 모든 타래를 연속으로 이어서 표시
* 타래 경계에만 날짜 구분선 표시
주요 기능
* 여러 타래를 하나의 시리즈로 묶기
* 타래 순서 드래그앤드롭 편집
* 시리즈 커버 이미지 업로드
* 완결/연재중 상태 설정
* 공유 링크 생성 (예: storyarchive.app/s/night-library)
✅ 3. 독자용 뷰어 (연속 스크롤)
하이브리드 페이지네이션 방식
* 기본 청크 크기: 500트윗 (로딩 속도 최적화)
* URL: /series/[slug]?page=1, ?page=2, ...
* 자동 로딩 옵션 제공 (무한 스크롤 모드)
뷰어 화면 구성
┌─────────────────────────────────────┐
│ ← 시리즈   밤의 도서관   [북마크] 🔖  │
│                                     │
│ 페이지 1/3 ━━━━━○━━━━━━━ 127/1247  │
└─────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

그날 밤, 나는 도서관에 갇혔다.      #1
문을 열려고 했지만 잠겨있었다.      #2
이상했다. 분명 5분 전까지만 해도... #3
...
(500개 트윗 연속 표시)

─────────────────────────────────────
2025-10-03 | 새로운 타래 추가됨
─────────────────────────────────────

두 번째 밤이 시작됐다.              #51
어제보다 더 이상한 일들이...        #52
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

┌─────────────────────────────────────┐
│              [다음 500트윗 →]        │
└─────────────────────────────────────┘
필수 기능
* 연속 스크롤 (끊김 없는 몰입)
* 이어보기 (마지막 읽은 위치 자동 저장)
* 북마크 (중요 장면 표시)
* 다크모드 (밤 읽기 모드)
* 글자 크기 조절
* 진행률 표시 (127/1247, 10%)
* 공유하기 (특정 위치 링크)
✅ 4. 북마크 시스템 (신규)
북마크 추가
트윗 위에 마우스 오버:
┌─────────────────────────────────────┐
│ 그날 밤, 나는 도서관에 갇혔다. #127    │
│                          [🔖 북마크]  │
└─────────────────────────────────────┘

클릭 시:
┌─────────────────────────────────────┐
│  북마크 추가                          │
│  "그날 밤, 나는 도서관에 갇혔다."     │
│  #127 (전체의 10%)                   │
│                                     │
│  메모 (선택):                        │
│  [여기서부터 반전 시작]               │
│                                     │
│       [취소]    [저장]               │
└─────────────────────────────────────┘
북마크 관리
* 시리즈별 북마크 목록
* 사용자 메모 추가 가능
* 북마크 위치로 바로 이동
* 쿠키 기반 (비로그인 사용자)
✅ 5. 창작자 대시보드
┌─────────────────────────────────────┐
│  내 시리즈                            │
│                                     │
│  🌙 밤의 도서관          [편집] [공유] │
│     연재중 | 5개 타래 | 1,247트윗    │
│     총 조회 45,678 | 업데이트: 2일 전 │
│                                     │
│  📊 통계                              │
│  ┌─────────────────────────────┐    │
│  │  일별 조회수 [차트]           │    │
│  │  북마크 TOP 5                │    │
│  │  평균 완독률: 42%             │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
기능
* 시리즈 생성/편집/삭제
* 타래 추가 (URL 입력)
* 타래 순서 변경
* 조회수/북마크 통계
* 공유 링크 관리
* 커버 이미지 업로드
✅ 6. 다운로드 기능
지원 포맷
* Markdown (기본, 범용적)
* JSON (개발자용, 구조화)
* HTML (웹 아카이브, 스타일 포함)
다운로드 옵션
* 단일 타래 다운로드
* 시리즈 전체 다운로드 (하나의 파일로)
* 브라우저 직접 다운로드 (서버 저장 없음)
* 파일명 자동 생성: series_[제목]_[날짜].md

4️⃣ 데이터베이스 스키마
-- ========================================
-- 타래 원본 데이터 (기존 유지)
-- ========================================

-- 타래 메타데이터
CREATE TABLE threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id VARCHAR(50) UNIQUE NOT NULL,
  author_username VARCHAR(100) NOT NULL,
  author_name VARCHAR(255),
  tweet_count INTEGER NOT NULL,
  collected_at TIMESTAMP DEFAULT NOW(),
  first_tweet_url TEXT NOT NULL,
  first_tweet_date TIMESTAMP,
  
  -- 통계
  download_count INTEGER DEFAULT 0,
  
  INDEX idx_conversation (conversation_id),
  INDEX idx_author (author_username),
  INDEX idx_collected (collected_at DESC)
);

-- 타래 내 개별 트윗
CREATE TABLE tweets (
  id BIGINT PRIMARY KEY, -- Twitter ID
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL,
  author_username VARCHAR(100) NOT NULL,
  
  -- 추가 정보
  reply_to_id BIGINT,
  retweet_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  
  -- 미디어
  media_urls TEXT[], -- array of URLs
  
  -- 정렬
  sequence_number INTEGER NOT NULL, -- 타래 내 순서
  
  INDEX idx_thread (thread_id, sequence_number)
);

-- ========================================
-- 시리즈 관리 (신규)
-- ========================================

-- 시리즈
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_username VARCHAR(100) NOT NULL,
  
  -- 시리즈 정보
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  
  -- 상태
  status VARCHAR(20) DEFAULT 'ongoing', -- ongoing, completed, hiatus
  
  -- 통계
  total_tweets INTEGER DEFAULT 0,  -- 전체 트윗 수
  total_threads INTEGER DEFAULT 0, -- 포함된 타래 수
  total_views INTEGER DEFAULT 0,
  
  -- URL
  slug VARCHAR(255) UNIQUE, -- URL 친화적 (night-library)
  is_public BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_slug (slug),
  INDEX idx_author (author_username),
  INDEX idx_public (is_public, updated_at DESC)
);

-- 시리즈에 포함된 타래들
CREATE TABLE series_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
  
  -- 시리즈 내 순서 (작가가 지정)
  sequence_number INTEGER NOT NULL,
  
  added_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(series_id, thread_id),
  UNIQUE(series_id, sequence_number),
  INDEX idx_series_order (series_id, sequence_number)
);

-- ========================================
-- 독자 기능 (신규)
-- ========================================

-- 읽기 진행 상황
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,  -- 쿠키 기반
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  
  last_read_tweet_id BIGINT REFERENCES tweets(id),
  progress_percentage INTEGER,  -- 0-100
  
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(session_id, series_id),
  INDEX idx_session_progress (session_id)
);

-- 북마크
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,  -- 쿠키 기반
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  tweet_id BIGINT REFERENCES tweets(id) ON DELETE CASCADE,
  
  -- 북마크 메타
  note TEXT,  -- 사용자 메모 (선택)
  
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_session_bookmarks (session_id, created_at DESC),
  INDEX idx_series_bookmarks (series_id, created_at DESC)
);

-- 조회수 추적
CREATE TABLE series_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  
  viewed_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_series_views (series_id, viewed_at)
);

-- ========================================
-- 사용자 히스토리 & 통계 (기존 유지)
-- ========================================

-- 사용자 히스토리 (쿠키 기반)
CREATE TABLE user_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255),
  thread_id UUID REFERENCES threads(id),
  saved_at TIMESTAMP DEFAULT NOW(),
  format VARCHAR(20) DEFAULT 'markdown',
  
  INDEX idx_session (session_id, saved_at DESC)
);

-- 익명 통계
CREATE TABLE analytics (
  id SERIAL PRIMARY KEY,
  event_type VARCHAR(50), -- 'scrape', 'download', 'series_created'
  thread_id UUID REFERENCES threads(id),
  series_id UUID REFERENCES series(id),
  format VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_event (event_type, created_at)
);

5️⃣ 기술 구조 (확정 스택)
📚 프론트엔드
Next.js 14+ (App Router)
├── TypeScript (타입 안정성)
├── React Server Components (성능 최적화)
├── Tailwind CSS + shadcn/ui (일관된 디자인)
├── react-markdown (미리보기 렌더링)
├── @tanstack/react-query (데이터 페칭)
└── react-hook-form (폼 관리)
주요 페이지
/                              # 홈 (랜딩)
/series/[slug]                 # 시리즈 상세 (독자용)
/series/[slug]?page=2          # 페이지네이션
/series/[slug]/bookmarks       # 북마크 목록
/dashboard                     # 창작자 대시보드
/dashboard/series/new          # 새 시리즈 만들기
/dashboard/series/[id]/edit    # 시리즈 편집
🔧 백엔드
Next.js API Routes (Vercel Serverless Functions)
/api/scrape                    # 타래 수집 요청
/api/series                    # 시리즈 CRUD
/api/series/[id]/threads       # 시리즈에 타래 추가/삭제
/api/series/[slug]/content     # 시리즈 내용 조회 (페이지네이션)
/api/bookmarks                 # 북마크 CRUD
/api/reading-progress          # 읽기 진행 저장
/api/download/[format]         # 파일 생성
/api/analytics                 # 통계
Python 크롤러 (VPS FastAPI)
FastAPI (api.one-q.xyz:8001)
├── /scrape                    # 실제 타래 수집
├── snscrape 엔진
└── PM2로 프로세스 관리
🗄️ 데이터베이스
VPS PostgreSQL
* Host: 141.164.60.51:5432
* Database: storyarchive
* ORM: Prisma
* 백업: 매일 자동 (cron)

6️⃣ 시스템 아키텍처
┌─────────────────────────────────────────────────┐
│  Browser (독자/창작자)                            │
│  - 시리즈 읽기                                    │
│  - 북마크 추가                                    │
│  - 타래 수집                                      │
└────────────┬────────────────────────────────────┘
             │ HTTPS
             ↓
┌─────────────────────────────────────────────────┐
│  Vercel Edge Network (글로벌 CDN)                │
│  - storyarchive.vercel.app                      │
│  - Serverless Functions (10초 제한)             │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴──────────────────┐
      │                         │
      ↓                         ↓
┌─────────────┐        ┌─────────────────┐
│Next.js App  │        │VPS (141...)     │
│(Vercel)     │◄───────│FastAPI :8001    │
│- UI/UX      │  HTTPS │- snscrape       │
│- API Routes │        │- 타래 수집 전담    │
│- 뷰어/대시보드│        └─────────────────┘
└──────┬──────┘
       │
       │ Direct Connection
       ↓
┌─────────────────────────────────┐
│PostgreSQL (VPS)                 │
│141.164.60.51:5432               │
│- threads / tweets               │
│- series / bookmarks             │
│- analytics / reading_progress   │
└─────────────────────────────────┘
흐름 설명
창작자가 시리즈 만들 때:
1. 타래 URL 입력 → Vercel API 호출
2. Vercel이 VPS FastAPI에 크롤링 요청
3. FastAPI가 snscrape로 타래 수집
4. 결과를 PostgreSQL에 저장
5. 창작자가 시리즈 생성 및 타래 추가
6. 공유 링크 생성
독자가 읽을 때:
1. 공유 링크 접속 (/series/night-library)
2. SSR로 시리즈 메타 로딩
3. 첫 500트윗 로딩 및 표시
4. 스크롤 시 읽기 진행 자동 저장
5. 다음 페이지 요청 시 추가 로딩
6. 북마크 추가 시 DB 저장

7️⃣ 배포 인프라
🚀 프론트엔드: Vercel
장점
* Git push 시 자동 배포
* 글로벌 CDN (전세계 빠른 로딩)
* 자동 HTTPS 인증서
* Preview 배포 (PR별 테스트)
* 무료 티어로 충분
환경 변수
DATABASE_URL=postgresql://user:pass@141.164.60.51:5432/storyarchive
SCRAPER_API_URL=https://api.one-q.xyz
NEXT_PUBLIC_APP_URL=https://storyarchive.vercel.app
🖥️ 백엔드 크롤러: VPS
서버 정보
* Host: 141.164.60.51
* 서브도메인: api.one-q.xyz
* 웹 서버: Caddy (HTTPS 리버스 프록시)
* 프로세스 관리: PM2
디렉토리 구조
/var/www/storyarchive-scraper/
├── main.py              # FastAPI 앱
├── requirements.txt
├── snscrape_handler.py  # 크롤링 로직
└── ecosystem.config.js  # PM2 설정
Caddy 설정
api.one-q.xyz {
    reverse_proxy localhost:8001
    
    header {
        Access-Control-Allow-Origin "https://storyarchive.vercel.app"
        Access-Control-Allow-Methods "POST, OPTIONS"
        Access-Control-Allow-Headers "Content-Type"
    }
}

8️⃣ 성능 최적화
⚡ 페이지네이션 전략
500트윗 청킹
// 특정 페이지의 트윗 가져오기
const TWEETS_PER_PAGE = 500;
const offset = (page - 1) * TWEETS_PER_PAGE;
const limit = TWEETS_PER_PAGE;

const tweets = await prisma.tweet.findMany({
  where: {
    thread: {
      seriesThreads: {
        some: { seriesId }
      }
    }
  },
  orderBy: [
    { thread: { seriesThreads: { sequence_number: 'asc' } } },
    { sequence_number: 'asc' }
  ],
  skip: offset,
  take: limit
});
Redis 캐싱
// 자주 조회되는 시리즈 캐싱
const cacheKey = `series:${slug}:page:${page}`;
const cached = await redis.get(cacheKey);

if (cached) return JSON.parse(cached);

const data = await fetchFromDB();
await redis.setex(cacheKey, 3600, JSON.stringify(data)); // 1시간
📱 모바일 최적화
// 모바일에서는 더 작은 청크
const CHUNK_SIZE = isMobile ? 300 : 500;

// 이미지 지연 로딩
<Image 
  src={tweet.media_url}
  loading="lazy"
  placeholder="blur"
/>

// 하단 고정 네비게이션 (모바일)
<div className="md:hidden fixed bottom-0 w-full">
  <ProgressBar current={progress} total={100} />
</div>
🎯 목표 지표
지표	목표	측정 방법
타래 수집	5-10초 (100트윗)	API 응답 시간
페이지 로드	2초 이내	Vercel Analytics
500트윗 로딩	1초 이내	페이지네이션 API
Lighthouse	90+ 점	CI/CD 자동 측정
9️⃣ 보안 대책
🔒 Rate Limiting
import { Ratelimit } from "@upstash/ratelimit";

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "15 m"), // 15분에 10회
});

// API에서 사용
const { success } = await ratelimit.limit(ip);
if (!success) throw new Error("Too many requests");
🛡️ 입력 검증
// URL 검증
function isValidTwitterUrl(url: string): boolean {
  const pattern = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
  return pattern.test(url);
}

// Slug 검증 (XSS 방지)
function sanitizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100);
}
🔐 CORS 설정
# FastAPI (VPS 크롤러)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://storyarchive.vercel.app"],
    allow_methods=["POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)

🔟 개발 일정 (6주 MVP)
Week 1-2: 기반 구축
* [x] VPS PostgreSQL 데이터베이스 생성
* [x] VPS FastAPI 크롤러 구현 및 배포
* [x] Next.js 프로젝트 생성
* [ ] Prisma 스키마 작성 (시리즈 포함)
* [ ] 기본 UI 컴포넌트 (shadcn/ui)
Week 3: 시리즈 관리
* [ ] 시리즈 CRUD API
* [ ] 창작자 대시보드 UI
* [ ] 타래 추가/순서 변경 기능
* [ ] 커버 이미지 업로드
Week 4: 독자용 뷰어
* [ ] 연속 스크롤 뷰어 구현
* [ ] 500트윗 페이지네이션
* [ ] 읽기 진행 추적
* [ ] 다크모드
Week 5: 북마크 & 통계
* [ ] 북마크 시스템 구현
* [ ] 북마크 목록 UI
* [ ] 조회수 통계
* [ ] 창작자 통계 대시보드
Week 6: 배포 & 안정화
* [ ] Vercel 배포
* [ ] Rate limiting 구현
* [ ] 에러 처리 강화
* [ ] 모바일 최적화
* [ ] 기본 테스트

1️⃣1️⃣ 향후 확장 로드맵
Phase 2: 고급 기능 (1-2개월)
기능	설명	우선순위
📦 ePub 변환	전자책 형식으로 다운로드	상
🖼️ 이미지 백업	타래 내 이미지 자동 다운로드	상
🔐 사용자 인증	개인 라이브러리 관리	중
🎨 커스텀 테마	독자용 읽기 테마 선택	중
💬 댓글 시스템	독자 댓글 (선택적)	하
Phase 3: 확장 서비스 (3-6개월)
기능	설명	우선순위
☁️ 클라우드 백업	Google Drive 자동 업로드	중
🔍 전체 검색	시리즈 내 키워드 검색	중
📱 PWA	모바일 앱처럼 설치	하
🤖 AI 요약	OpenAI로 시리즈 요약	하
수익화 옵션 (장기)
Free
* 시리즈 3개까지
* 타래 무제한
* 기본 통계
* Markdown 다운로드
Pro ($4.99/월)
* 시리즈 무제한
* 커스텀 도메인
* 고급 통계
* ePub/PDF 다운로드
* 광고 제거

1️⃣2️⃣ 브랜드 & 디자인
서비스 아이덴티티
요소	내용
서비스명	StoryArchive
태그라인	"트위터 연재물을, 웹소설처럼."
영문 슬로건	"Archive your Twitter stories, read like novels."
톤 & 무드	미니멀 / 몰입적 / 창작자 친화적
컬러 팔레트
:root {
  /* 브랜드 */
  --color-primary: #1DA1F2;    /* Twitter Blue */
  --color-dark: #232B2B;        /* 텍스트 */
  --color-light: #F2E9E4;       /* 배경 (라이트 모드) */
  
  /* 액센트 */
  --color-accent: #C9ADA7;      /* 포인트 컬러 */
  --color-success: #22C55E;     /* 저장 완료 */
  --color-bookmark: #F59E0B;    /* 북마크 */
  
  /* 다크 모드 */
  --dark-bg: #1A1A1A;
  --dark-text: #E5E5E5;
}
타이포그래피
* 본문: Pretendard (한글), Inter (영문)
* 코드: Fira Code
* 제목: Pretendard Bold

1️⃣3️⃣ 성공 지표
MVP 기준 (3개월)
지표	1개월	3개월	측정
등록 시리즈	50개	200개	DB 카운트
활성 창작자	20명	100명	월간 활성
독자 방문	500/일	5,000/일	Analytics
평균 완독률	30%	50%	reading_progress
북마크 사용	-	1,000개	bookmarks
📌 Quick Start
개발 환경 세팅
# 1. 저장소 클론
git clone https://github.com/your-username/storyarchive.git
cd storyarchive

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env.local
# DATABASE_URL, SCRAPER_API_URL 등 입력

# 4. Prisma 마이그레이션
npx prisma migrate dev
npx prisma generate

# 5. 개발 서버 실행
npm run dev
# → http://localhost:3000
Vercel 배포
# 1. Vercel CLI
npm i -g vercel

# 2. 초기 배포
vercel

# 3. 환경 변수 설정 (Dashboard)
# DATABASE_URL, SCRAPER_API_URL 등

# 4. Git push 자동 배포
git push origin main

🎯 최종 체크리스트
필수 구현 (MVP)
* [ ] 타래 수집 (snscrape)
* [ ] 시리즈 CRUD
* [ ] 연속 스크롤 뷰어 (500트윗 청킹)
* [ ] 북마크 시스템
* [ ] 읽기 진행 추적
* [ ] 창작자 대시보드
* [ ] 조회수 통계
* [ ] Markdown/JSON/HTML 다운로드
* [ ] 반응형 디자인
* [ ] Vercel 배포
선택 구현
* [ ] 다크모드
* [ ] 무한 스크롤 옵션
* [ ] 시리즈 전체 다운로드
* [ ] 공유 기능

통합 완료된 최종 PRD입니다! 🎉
핵심 변경사항:
1. ✅ 목적: 썰/소설 연작 관리로 명확화
2. ✅ 회차 구분 제거 → 연속 스크롤
3. ✅ 500트윗 페이지네이션 (성능 고려)
4. ✅ 북마크 시스템 추가
5. ✅ 기존 인프라 (VPS, Vercel) 유지

