# ThreadSaver ↔ NovelMind 통합 UI 가이드

## 완료된 작업 (ThreadSaver)

### 1. API 엔드포인트 생성
**파일**: [app/api/novel-integration/export/route.ts](app/api/novel-integration/export/route.ts)

```typescript
POST /api/novel-integration/export

Request Body:
{
  "seriesId": "uuid",
  "minTweetsPerThread": 10  // 옵션, 기본값 10
}

Response (성공):
{
  "success": true,
  "data": {
    "projectId": "uuid",
    "episodeCount": 12,
    "noteCount": 280
  }
}

Response (실패):
{
  "success": false,
  "error": "Series has only 40 tweets (minimum: 50)"
}
```

### 2. Series 상세 페이지 UI 추가
**파일**: [app/series/[slug]/page.tsx](app/series/[slug]/page.tsx)

**변경 사항**:
- `BookOpen` 아이콘 import 추가
- `exporting` state 추가
- `handleExportToNovelMind()` 함수 추가
- Series 정보 섹션에 "NovelMind로 내보내기" 카드 추가

**조건부 표시**:
- `series.totalTweets >= 50` 일 때만 버튼 표시
- 50개 미만 트윗 시리즈는 버튼 숨김

**UI 위치**:
```
Series 상세 페이지
├─ 헤더 (제목, 작가, 통계)
├─ [NovelMind로 내보내기 카드] ← 여기!
└─ 트윗 목록
```

## 아직 안 한 작업 (NovelMind)

### 1. NovelMind 프로젝트 설정
```bash
cd /Users/blee/Desktop/blee-project/Novel

# 통합 스키마로 교체
cp /Users/blee/Desktop/blee-project/threadsaver/prisma/schema-integrated.prisma prisma/schema.prisma

# .env에서 DATABASE_URL을 ThreadSaver와 동일하게 설정
# ThreadSaver의 .env 파일에서 DATABASE_URL 복사

# Prisma Client 재생성
npx prisma generate
```

### 2. NovelMind API 엔드포인트 (예정)
**파일**: `app/api/import/series/route.ts` (생성 필요)

```typescript
GET /api/import/series?minTotal=50&minThreads=3&minPerThread=10

Response:
{
  "total": 234,
  "series": [
    {
      "id": "uuid",
      "title": "나의 로맨스 판타지",
      "authorUsername": "writer123",
      "totalThreads": 15,
      "totalTweets": 280,
      "qualifyingThreads": 12,
      "isConverted": false
    }
  ]
}
```

### 3. NovelMind UI (예정)
**파일**: `app/projects/page.tsx` (수정 필요)

```tsx
// 프로젝트 목록 페이지에 버튼 추가

export default async function ProjectsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1>내 프로젝트</h1>
        <div className="flex gap-2">
          <Button onClick={handleNewProject}>새 프로젝트</Button>
          <Button variant="outline" onClick={openImportModal}>
            📥 ThreadSaver에서 가져오기
          </Button>
        </div>
      </div>

      {/* 프로젝트 목록 */}
    </div>
  )
}
```

**모달 컴포넌트 (예정)**:
```tsx
// components/ImportSeriesModal.tsx

export function ImportSeriesModal({ open, onClose }) {
  const [series, setSeries] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchExportableSeries()
    }
  }, [open])

  async function fetchExportableSeries() {
    setLoading(true)
    const res = await fetch('/api/import/series?minTotal=50&minThreads=3&minPerThread=10')
    const data = await res.json()
    setSeries(data.series)
    setLoading(false)
  }

  async function handleImport(seriesId: string) {
    const res = await fetch('/api/novel-integration/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seriesId, minTweetsPerThread: 10 }),
    })

    const result = await res.json()
    if (result.success) {
      alert('가져오기 완료!')
      onClose()
      // 프로젝트 목록 새로고침
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ThreadSaver에서 가져오기</DialogTitle>
          <DialogDescription>
            중편/장편 연재물을 NovelMind 프로젝트로 변환합니다.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div>로딩 중...</div>
        ) : (
          <div className="space-y-4">
            {series.map((s) => (
              <div key={s.id} className="border p-4 rounded">
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-muted-foreground">
                  @{s.authorUsername} · {s.totalThreads}개 타래 · {s.totalTweets}개 트윗
                  <br />
                  중편 이상: {s.qualifyingThreads}개 타래
                </p>
                {s.isConverted ? (
                  <Badge>이미 가져옴</Badge>
                ) : (
                  <Button size="sm" onClick={() => handleImport(s.id)}>
                    가져오기
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## 데이터 흐름

### ThreadSaver → NovelMind 내보내기
```
1. 사용자: Series 상세 페이지에서 "내보내기" 클릭
2. ThreadSaver: POST /api/novel-integration/export
3. 서버: createProjectFromSeries() 실행
   - Series 조회
   - 10개 이상 트윗 타래 필터링
   - OriginalWork 생성
   - Project 생성
   - Thread → Episode 변환
   - Tweet → EpisodeNote 변환
   - SeriesProject 연결 생성
4. 응답: 생성된 프로젝트 정보 반환
5. 사용자: 성공 메시지 확인
```

### NovelMind에서 가져오기 (예정)
```
1. 사용자: NovelMind 프로젝트 목록에서 "가져오기" 클릭
2. 모달: GET /api/import/series 호출
3. 서버: getExportableSeriesList() 실행
   - 50개 이상 트윗, 3개 이상 타래 조회
   - 각 시리즈의 중편 이상 타래 개수 계산
   - 이미 변환된 프로젝트 확인
4. 모달: Series 목록 표시
5. 사용자: 원하는 Series 선택
6. NovelMind: POST /api/novel-integration/export (ThreadSaver API)
7. 서버: Project 생성
8. 사용자: 프로젝트 목록에서 확인
```

## 테스트 시나리오

### ThreadSaver 테스트
1. ✅ 50개 이상 트윗 시리즈 → 내보내기 버튼 표시됨
2. ✅ 50개 미만 트윗 시리즈 → 내보내기 버튼 숨겨짐
3. ⏳ 내보내기 버튼 클릭 → API 호출 → 성공 메시지
4. ⏳ 중편 미만 타래만 있을 경우 → 에러 메시지
5. ⏳ 이미 내보낸 시리즈 → 중복 방지 (현재 미구현)

### NovelMind 테스트 (예정)
1. ⏳ 가져오기 버튼 클릭 → 모달 표시
2. ⏳ Series 목록 조회 → 필터링된 목록 표시
3. ⏳ Series 선택 → Project 생성
4. ⏳ Project 목록에서 확인 → Episode/Note 확인

## 다음 단계

1. ⏳ NovelMind 프로젝트 DATABASE_URL 설정
2. ⏳ NovelMind Prisma schema 업데이트
3. ⏳ NovelMind API 엔드포인트 생성
4. ⏳ NovelMind UI 구현 (가져오기 모달)
5. ⏳ 중복 방지 로직 추가 (같은 Series 여러 번 내보내기 방지)
6. ⏳ 실제 DB로 테스트

## 현재 상태

- ✅ ThreadSaver: 완료 (API + UI)
- ⏳ NovelMind: 대기 중
- ⏳ DB 마이그레이션: 대기 중
