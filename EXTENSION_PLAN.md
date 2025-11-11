# 🧩 브라우저 익스텐션 개발 계획

## 📊 현재 상황 분석

### ✅ 이미 구현된 것
1. **웹 인터페이스** (http://localhost:3001/dashboard)
   - 트위터 링크 입력 폼
   - VPS 스크래퍼 API 호출 (`/api/scrape`)
   - 시리즈 생성 및 관리

2. **백엔드 API**
   - `/api/scrape/extension` - 익스텐션에서 보낸 데이터 수신
   - 데이터베이스 저장 로직 완료

### ❌ 구현 필요한 것
**브라우저 익스텐션** - 트위터 페이지에서 직접 데이터 추출

---

## 🎯 브라우저 익스텐션 역할

### 웹 인터페이스 vs 익스텐션 차이점

| 구분 | 웹 인터페이스 | 브라우저 익스텐션 |
|------|--------------|------------------|
| **데이터 소스** | VPS 스크래퍼 API | 트위터 DOM 직접 추출 |
| **사용 시점** | 링크를 복사해서 입력 | 트위터 페이지 보면서 클릭 |
| **장점** | 안정적, 서버 기반 | 빠름, 실시간 |
| **단점** | VPS 의존성 | 트위터 DOM 변경에 민감 |

---

## 📋 상세 작업 계획

### Phase 1: 기본 구조 설정
**목표**: 익스텐션 프로젝트 초기화

#### Task 1.1: 디렉토리 구조 생성
```
extension/
├── manifest.json          # 익스텐션 설정
├── icons/                 # 아이콘 이미지
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                 # 팝업 UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── content/               # 트위터 페이지 스크립트
│   └── twitter-scraper.js
└── background/            # 백그라운드 서비스
    └── service-worker.js
```

**산출물**: 폴더 구조

---

#### Task 1.2: manifest.json 작성
**목적**: Chrome Extension Manifest V3 설정

**필수 구성요소**:
- `manifest_version: 3`
- `name`, `version`, `description`
- `permissions`: `activeTab`, `storage`
- `host_permissions`: `*://twitter.com/*`, `*://x.com/*`
- `action`: 팝업 설정
- `content_scripts`: 트위터 페이지에 주입
- `background`: 서비스 워커

**산출물**: `extension/manifest.json`

---

### Phase 2: 콘텐츠 스크립트 (핵심 기능)
**목표**: 트위터 DOM에서 타래 데이터 추출

#### Task 2.1: DOM 구조 분석
**작업 내용**:
1. 트위터 타래 페이지의 HTML 구조 파악
2. 트윗 요소 선택자 찾기
3. 데이터 추출 포인트 확인

**필요한 데이터**:
```javascript
{
  id: "트윗 ID",
  content: "트윗 내용",
  createdAt: "작성 시간",
  authorUsername: "작성자",
  likeCount: 좋아요 수,
  retweetCount: 리트윗 수,
  mediaUrls: ["이미지/비디오 URL"]
}
```

**산출물**: DOM 구조 문서

---

#### Task 2.2: 스크래퍼 함수 작성
**파일**: `extension/content/twitter-scraper.js`

**주요 함수**:
```javascript
// 1. 현재 타래 URL 확인
function isThreadPage()

// 2. 타래의 모든 트윗 추출
function extractThreadTweets()

// 3. 개별 트윗 데이터 파싱
function parseTweetElement(element)

// 4. 백그라운드로 데이터 전송
function sendToBackground(tweets)
```

**산출물**: `twitter-scraper.js` (약 200-300줄)

---

### Phase 3: 팝업 UI
**목표**: 사용자 인터페이스

#### Task 3.1: 팝업 HTML 작성
**파일**: `extension/popup/popup.html`

**화면 구성**:
```
┌─────────────────────────┐
│  ThreadSaver 🧵         │
├─────────────────────────┤
│ 현재 페이지: Twitter    │
│ 상태: 타래 감지됨       │
├─────────────────────────┤
│ [📥 타래 저장하기]      │
│                         │
│ 서버: localhost:3001   │
│ [⚙️ 설정]              │
└─────────────────────────┘
```

**산출물**: `popup.html`

---

#### Task 3.2: 팝업 스타일링
**파일**: `extension/popup/popup.css`

**디자인 컨셉**:
- 다크 테마 (메인 앱과 일치)
- 최소 크기: 320px × 400px
- 버튼 상태 표시 (로딩, 성공, 실패)

**산출물**: `popup.css`

---

#### Task 3.3: 팝업 로직
**파일**: `extension/popup/popup.js`

**주요 기능**:
```javascript
// 1. 현재 탭 확인
async function checkCurrentTab()

// 2. 타래 저장 버튼 클릭
async function handleSaveThread()

// 3. 상태 업데이트
function updateStatus(message, type)

// 4. 설정 저장/로드
async function loadSettings()
```

**산출물**: `popup.js` (약 100-150줄)

---

### Phase 4: 백그라운드 서비스 워커
**목표**: 익스텐션-서버 통신

#### Task 4.1: 서비스 워커 작성
**파일**: `extension/background/service-worker.js`

**주요 기능**:
```javascript
// 1. 콘텐츠 스크립트로부터 데이터 수신
chrome.runtime.onMessage.addListener()

// 2. 서버로 데이터 전송
async function sendToServer(data)

// 3. 응답 처리 및 팝업에 알림
function notifyPopup(result)
```

**API 호출**:
```javascript
fetch('http://localhost:3001/api/scrape/extension', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: threadUrl,
    tweets: extractedTweets
  })
})
```

**산출물**: `service-worker.js` (약 100줄)

---

### Phase 5: 아이콘 생성
**목표**: 익스텐션 아이콘 제작

#### Task 5.1: 아이콘 디자인
**필요한 크기**:
- 16×16px (툴바)
- 48×48px (확장 프로그램 관리)
- 128×128px (Chrome 웹 스토어)

**디자인 컨셉**:
- 실 아이콘 🧵 또는
- 하트 아이콘 (기존 브랜딩)

**산출물**: `icon16.png`, `icon48.png`, `icon128.png`

---

### Phase 6: 테스트 및 디버깅

#### Task 6.1: 로컬 테스트
**테스트 항목**:
1. ✅ manifest.json 유효성
2. ✅ 트위터 페이지에서 콘텐츠 스크립트 로드
3. ✅ 타래 데이터 추출 정확도
4. ✅ 팝업 UI 동작
5. ✅ 서버 전송 성공
6. ✅ 에러 핸들링

**테스트 방법**:
```
Chrome → 확장 프로그램 → 개발자 모드
→ "압축해제된 확장 프로그램을 로드합니다"
→ extension/ 폴더 선택
```

**산출물**: 테스트 체크리스트

---

#### Task 6.2: 디버깅
**디버그 포인트**:
- Console 로그 확인
- Network 탭에서 API 호출 검증
- Storage 확인 (설정 저장)

**산출물**: 버그 수정 완료

---

### Phase 7: 문서화

#### Task 7.1: 설치 가이드 작성
**파일**: `extension/README.md`

**내용**:
```markdown
# ThreadSaver 브라우저 익스텐션

## 설치 방법
1. Chrome 열기
2. chrome://extensions/ 접속
3. 개발자 모드 활성화
4. "압축해제된 확장 프로그램을 로드합니다" 클릭
5. extension/ 폴더 선택

## 사용 방법
1. Twitter 타래 페이지 방문
2. 익스텐션 아이콘 클릭
3. "타래 저장하기" 버튼 클릭

## 문제 해결
...
```

**산출물**: `extension/README.md`

---

## 🔄 작업 순서 요약

```
1. [디렉토리 구조] → 2. [manifest.json]
                    ↓
3. [Content Script - 스크래퍼]
                    ↓
4. [Popup UI] → 5. [Popup 로직]
                    ↓
6. [Background Service Worker]
                    ↓
7. [아이콘 제작]
                    ↓
8. [로컬 테스트] → 9. [디버깅]
                    ↓
10. [문서화 완료]
```

---

## ⏱️ 예상 작업 시간

| Phase | Task | 예상 시간 |
|-------|------|----------|
| 1 | 구조 + manifest | 30분 |
| 2 | 콘텐츠 스크립트 | 2시간 |
| 3 | 팝업 UI/로직 | 1.5시간 |
| 4 | 백그라운드 워커 | 1시간 |
| 5 | 아이콘 | 30분 |
| 6 | 테스트/디버깅 | 1시간 |
| 7 | 문서화 | 30분 |
| **합계** | | **약 7시간** |

---

## 🎯 첫 번째 단계 시작

**Task 1.1**: 디렉토리 구조 생성부터 시작하시겠습니까?

```bash
mkdir -p extension/{popup,content,background,icons}
```
