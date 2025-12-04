# ThreadSaver ↔ NovelMind 통합 계획

## 통합 전략: DB 레벨 통합 (Shared Database Architecture)

두 프로젝트가 **같은 Supabase PostgreSQL DB를 공유**하되, 각자 독립적으로 작동하는 방식.

```
ThreadSaver (Next.js 15)          NovelMind (Next.js 16)
       ↓                                  ↓
   [Prisma Client]              [Prisma Client]
       ↓                                  ↓
   ================== Shared Supabase PostgreSQL ====================
   │ ThreadSaver Tables  │  NovelMind Tables  │  Bridge Tables    │
   │ - threads           │  - original_works  │  - series_projects│
   │ - tweets            │  - characters      │                   │
   │ - series            │  - projects        │                   │
   │                     │  - episodes        │                   │
   │                     │  - episode_notes   │                   │
   ==================================================================
```

## 왜 이 방식인가?

### 장점
- ✅ **실시간 동기화 가능**: Series 업데이트 → Project 자동 반영
- ✅ **데이터 일관성**: Foreign Key 제약으로 무결성 보장
- ✅ **독립적 배포**: 각 앱은 독립적으로 배포/운영 가능
- ✅ **코드베이스 분리**: 서로의 코드에 영향 없음
- ✅ **단순한 구현**: JSON export보다 강력하지만, Full Integration보다 단순

### 단점
- ⚠️ **Supabase 공유 필요**: 두 프로젝트가 같은 DB 인스턴스 사용
- ⚠️ **스키마 조정 필요**: 양쪽 프로젝트 모두 스키마 업데이트 필요

## 구현된 파일

### 1. `prisma/schema-integrated.prisma`
- ThreadSaver의 기존 테이블 유지
- NovelMind 테이블 추가
- `SeriesProject` 브릿지 테이블 추가 (Series ↔ Project 연결)

### 2. `lib/novel-integration.ts`
통합 로직 함수들:
- `createProjectFromSeries()`: Series → Project 변환
- `isSeriesConvertedToProject()`: 변환 여부 확인
- `unlinkSeriesFromProject()`: 연결 해제
- `updateSyncStatus()`: 동기화 상태 업데이트
- `generateNovelMindPromptFromSeries()`: AI 프롬프트 생성

## 구현 단계

### Phase 1: DB 마이그레이션 (30분)
```bash
# ThreadSaver 프로젝트에서
cd /Users/blee/Desktop/blee-project/threadsaver

# 기존 schema.prisma 백업
cp prisma/schema.prisma prisma/schema-original.prisma

# 통합 스키마로 교체
cp prisma/schema-integrated.prisma prisma/schema.prisma

# 마이그레이션 생성 및 적용
npx prisma migrate dev --name add_novel_integration

# Prisma Client 재생성
npx prisma generate
```

### Phase 2: NovelMind 프로젝트 스키마 업데이트 (30분)
```bash
# NovelMind 프로젝트에서
cd /Users/blee/Desktop/blee-project/Novel

# 통합 스키마 복사
cp /Users/blee/Desktop/blee-project/threadsaver/prisma/schema.prisma prisma/schema.prisma

# DATABASE_URL을 ThreadSaver와 동일하게 설정
# .env 파일에서 Supabase URL 통일

# Prisma Client 재생성
npx prisma generate
```

### Phase 3: ThreadSaver UI 추가 (1시간)
Series 상세 페이지에 "NovelMind로 내보내기" 버튼 추가:
```tsx
// app/series/[slug]/page.tsx에 추가

import { createProjectFromSeries } from '@/lib/novel-integration'

async function handleExportToNovelMind() {
  const result = await createProjectFromSeries({
    seriesId: series.id,
  })

  if (result.success) {
    alert(`프로젝트 생성 완료! ${result.episodeCount}개 에피소드, ${result.noteCount}개 노트`)
  }
}
```

### Phase 4: NovelMind UI 추가 (1시간)
Project 목록에 "ThreadSaver에서 가져온 프로젝트" 표시:
```tsx
// NovelMind의 Project 목록 컴포넌트에서

const linkedSeries = await prisma.seriesProject.findFirst({
  where: { projectId: project.id },
  include: { series: true }
})

if (linkedSeries) {
  return (
    <Badge>
      📚 ThreadSaver에서 가져옴: {linkedSeries.series.title}
    </Badge>
  )
}
```

## 사용 시나리오

### 시나리오 1: 트위터 연재를 소설로 확장
1. ThreadSaver에서 트위터 타래 아카이브 수집
2. Series 상세 페이지에서 "NovelMind로 내보내기" 클릭
3. NovelMind에서 자동으로 Project 생성됨
4. 기존 트윗은 EpisodeNote로 저장되어 참고 가능
5. AI에게 "다음 전개 아이디어" 요청 시 기존 트윗 컨텍스트 활용

### 시나리오 2: 작가의 창작 워크플로우
```
트위터에서 연재
  ↓
ThreadSaver로 아카이브 (읽기 편한 형태로 보관)
  ↓
NovelMind로 변환 (캐릭터/플롯 분석 시작)
  ↓
AI와 함께 다음 전개 구상
  ↓
트위터에 다시 연재 또는 웹소설 플랫폼으로 확장
```

## 데이터 흐름

### Series → Project 변환 시
```
Series (ThreadSaver)
├─ SeriesThread 1
│  └─ Thread
│     ├─ Tweet 1 → EpisodeNote 1
│     ├─ Tweet 2 → EpisodeNote 2
│     └─ Tweet 3 → EpisodeNote 3
├─ SeriesThread 2
│  └─ Thread
│     ├─ Tweet 1 → EpisodeNote 1
│     └─ Tweet 2 → EpisodeNote 2

↓ 변환

Project (NovelMind)
├─ Episode 1 (from SeriesThread 1)
│  ├─ EpisodeNote 1 (from Tweet 1)
│  ├─ EpisodeNote 2 (from Tweet 2)
│  └─ EpisodeNote 3 (from Tweet 3)
└─ Episode 2 (from SeriesThread 2)
   ├─ EpisodeNote 1 (from Tweet 1)
   └─ EpisodeNote 2 (from Tweet 2)
```

### 브릿지 테이블 구조
```sql
series_projects
├─ id (uuid)
├─ series_id (FK → series.id)
├─ project_id (FK → projects.id)
├─ sync_enabled (boolean) -- 자동 동기화 여부
├─ last_sync_at (timestamp) -- 마지막 동기화 시간
└─ created_at (timestamp)
```

## 예상 소요 시간

| 단계 | 작업 | 소요 시간 |
|------|------|----------|
| Phase 1 | DB 마이그레이션 | 30분 |
| Phase 2 | NovelMind 스키마 업데이트 | 30분 |
| Phase 3 | ThreadSaver UI (Export 버튼) | 1시간 |
| Phase 4 | NovelMind UI (Imported 표시) | 1시간 |
| **총합** | | **3시간** |

## 다음 단계

1. ✅ **완료**: 통합 스키마 설계 (`schema-integrated.prisma`)
2. ✅ **완료**: 변환 로직 구현 (`novel-integration.ts`)
3. ⏳ **대기**: DB 마이그레이션 실행 여부 확인
4. ⏳ **대기**: UI 구현 (ThreadSaver Export 버튼)
5. ⏳ **대기**: UI 구현 (NovelMind Import 표시)

## 의사결정 필요 사항

1. **지금 바로 마이그레이션 진행할까요?**
   - Yes → Phase 1 실행
   - No → 나중에 진행 (문서만 저장)

2. **NovelMind 프로젝트도 같은 Supabase DB 사용하도록 설정할까요?**
   - Yes → .env 파일 DATABASE_URL 통일 필요
   - No → JSON Export 방식으로 변경

3. **자동 동기화 기능이 필요한가요?**
   - Series에 새 Thread 추가 시 자동으로 Episode 생성
   - 현재는 수동 변환만 구현됨
