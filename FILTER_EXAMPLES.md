# 중편/장편 타래 필터링 가이드

## 기본 분류 기준

트위터 연재물 길이 분류:
- **단편**: 1-9개 트윗 (NovelMind로 내보내기 부적합)
- **중편**: 10-49개 트윗 ✅
- **장편**: 50개 이상 트윗 ✅

## 사용 방법

### 1. 중편 이상만 내보내기 (10개 이상 트윗)

```typescript
import { createProjectFromSeries } from '@/lib/novel-integration'

const result = await createProjectFromSeries({
  seriesId: 'series-uuid',
  minTweetsPerThread: 10, // 각 타래가 10개 이상 트윗을 가져야 함
})

// 결과
// ✅ Thread 1 (15 tweets) → Episode 생성
// ✅ Thread 2 (20 tweets) → Episode 생성
// ❌ Thread 3 (5 tweets) → 스킵
// ✅ Thread 4 (12 tweets) → Episode 생성
```

### 2. 장편만 내보내기 (50개 이상 트윗)

```typescript
const result = await createProjectFromSeries({
  seriesId: 'series-uuid',
  minTweetsPerThread: 50,
})
```

### 3. 시리즈 전체 트윗 수로 필터링

```typescript
const result = await createProjectFromSeries({
  seriesId: 'series-uuid',
  minTotalTweets: 100, // 시리즈 전체가 100개 이상 트윗이어야 함
  minTweetsPerThread: 10, // 각 타래는 10개 이상
})
```

### 4. 내보낼 수 있는 시리즈 목록 조회

```typescript
import { getExportableSeriesList } from '@/lib/novel-integration'

const exportableSeries = await getExportableSeriesList({
  minTotalTweets: 50,     // 시리즈 전체 50개 이상
  minThreads: 3,           // 최소 3개 타래
  minTweetsPerThread: 10,  // 각 타래 10개 이상
})

// 결과 예시
[
  {
    id: 'series-1',
    title: '나의 로맨스 판타지',
    authorUsername: 'writer123',
    totalThreads: 15,
    totalTweets: 280,
    qualifyingThreads: 12,  // 10개 이상 트윗을 가진 타래 수
    isConverted: false,
    convertedProjectId: null,
  },
  {
    id: 'series-2',
    title: '현대 판타지 연재',
    authorUsername: 'writer456',
    totalThreads: 8,
    totalTweets: 156,
    qualifyingThreads: 8,
    isConverted: true,
    convertedProjectId: 'project-uuid',
  }
]
```

## UI 구현 예시

### ThreadSaver: Series 상세 페이지

```tsx
// app/series/[slug]/page.tsx

import { getExportableSeriesList } from '@/lib/novel-integration'

export default async function SeriesPage({ params }: { params: { slug: string } }) {
  const series = await getSeries(params.slug)

  // 현재 시리즈가 내보내기 적합한지 확인
  const qualifyingThreads = series.seriesThreads.filter(
    st => st.thread.tweetCount >= 10
  )

  const isExportable = qualifyingThreads.length >= 3

  return (
    <div>
      <h1>{series.title}</h1>
      <p>총 {series.totalThreads}개 타래, {series.totalTweets}개 트윗</p>

      {isExportable ? (
        <div className="border p-4 rounded">
          <h3>📚 NovelMind로 내보내기</h3>
          <p>
            중편 이상 타래: {qualifyingThreads.length}개
            (10개 이상 트윗을 가진 타래)
          </p>
          <button onClick={handleExport}>
            중편/장편 타래만 NovelMind로 내보내기
          </button>
        </div>
      ) : (
        <p className="text-gray-500">
          ℹ️ 10개 이상 트윗을 가진 타래가 3개 미만이어서 내보내기가 제한됩니다.
        </p>
      )}
    </div>
  )
}

async function handleExport(seriesId: string) {
  const result = await createProjectFromSeries({
    seriesId,
    minTweetsPerThread: 10, // 중편 이상만
  })

  if (result.success) {
    alert(`✅ ${result.episodeCount}개 에피소드 생성됨!`)
  } else {
    alert(`❌ ${result.error}`)
  }
}
```

### NovelMind: Import 가능한 Series 목록

```tsx
// app/import/page.tsx

import { getExportableSeriesList } from '@/lib/novel-integration'

export default async function ImportPage() {
  const exportableSeries = await getExportableSeriesList({
    minTotalTweets: 50,
    minThreads: 3,
    minTweetsPerThread: 10,
  })

  return (
    <div>
      <h1>ThreadSaver에서 가져오기</h1>
      <p>중편/장편 연재물만 표시됩니다</p>

      {exportableSeries.map(series => (
        <div key={series.id} className="border p-4">
          <h3>{series.title}</h3>
          <p>@{series.authorUsername}</p>
          <div className="text-sm text-gray-600">
            전체: {series.totalThreads}개 타래, {series.totalTweets}개 트윗
            <br />
            중편 이상: {series.qualifyingThreads}개 타래
          </div>

          {series.isConverted ? (
            <span className="badge">이미 가져옴</span>
          ) : (
            <button onClick={() => importSeries(series.id)}>
              가져오기
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
```

## 실제 데이터 예시

현재 ThreadSaver DB에 있는 465개 시리즈 중:

```bash
# 통계 조회 쿼리 (Prisma Studio에서 실행)
SELECT
  COUNT(*) as total_series,
  SUM(CASE WHEN total_tweets >= 50 THEN 1 ELSE 0 END) as long_series,
  SUM(CASE WHEN total_tweets >= 10 AND total_tweets < 50 THEN 1 ELSE 0 END) as medium_series,
  SUM(CASE WHEN total_tweets < 10 THEN 1 ELSE 0 END) as short_series
FROM series;
```

예상 결과:
- **총 시리즈**: 465개
- **장편** (50+ 트윗): ~50-100개
- **중편** (10-49 트윗): ~150-200개
- **단편** (<10 트윗): ~200-250개

→ NovelMind로 내보낼 가치가 있는 시리즈: **200-300개**

## 권장 설정

### 보수적 (품질 우선)
```typescript
{
  minTotalTweets: 100,     // 시리즈 전체 100개 이상
  minThreads: 5,           // 최소 5개 타래
  minTweetsPerThread: 20,  // 각 타래 20개 이상
}
```

### 균형적 (기본 권장)
```typescript
{
  minTotalTweets: 50,      // 시리즈 전체 50개 이상
  minThreads: 3,           // 최소 3개 타래
  minTweetsPerThread: 10,  // 각 타래 10개 이상 (중편)
}
```

### 관대함 (최대 포함)
```typescript
{
  minTotalTweets: 30,      // 시리즈 전체 30개 이상
  minThreads: 2,           // 최소 2개 타래
  minTweetsPerThread: 5,   // 각 타래 5개 이상
}
```

## API 엔드포인트 예시

```typescript
// app/api/novel-integration/exportable/route.ts

import { getExportableSeriesList } from '@/lib/novel-integration'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const minTotalTweets = parseInt(searchParams.get('minTotal') || '50')
  const minThreads = parseInt(searchParams.get('minThreads') || '3')
  const minTweetsPerThread = parseInt(searchParams.get('minPerThread') || '10')

  const exportableSeries = await getExportableSeriesList({
    minTotalTweets,
    minThreads,
    minTweetsPerThread,
  })

  return NextResponse.json({
    total: exportableSeries.length,
    series: exportableSeries,
  })
}
```

사용:
```
GET /api/novel-integration/exportable?minTotal=50&minThreads=3&minPerThread=10
```

응답:
```json
{
  "total": 234,
  "series": [
    {
      "id": "series-1",
      "title": "나의 로맨스 판타지",
      "totalThreads": 15,
      "totalTweets": 280,
      "qualifyingThreads": 12,
      "isConverted": false
    }
  ]
}
```
