# ThreadSaver 브라우저 익스텐션 🧵

트위터 타래를 쉽게 추출하고 저장하는 Chrome/Edge 익스텐션입니다.

## 📋 기능

- ✅ 트위터 타래 페이지에서 직접 데이터 추출
- ✅ 트윗 내용, 작성자, 시간, 통계, 미디어 URL 추출
- ✅ ThreadSaver 서버로 자동 전송
- ✅ **봇 회피 모드 토글** - 안전/빠른 추출 선택 가능
- ✅ **점진적 추출** - 세션 유지로 중단 없이 이어서 추출
- ✅ **카테고리 자동 분류** - 트윗 개수별 5단계 분류 (잡썰/짧썰/단편/중편/장편)
- ✅ 다크 테마 UI
- ✅ 실시간 진행 상태 표시

## 🚀 설치 방법

### 1단계: 아이콘 생성 (필수)

익스텐션이 로드되려면 아이콘이 필요합니다.

**옵션 A: HTML 생성기 사용**
```bash
# icons/create-icons.html을 브라우저로 열기
open extension/icons/create-icons.html

# 또는
# Windows: start extension/icons/create-icons.html
# Linux: xdg-open extension/icons/create-icons.html
```

다운로드 링크를 클릭하여 `icons/` 폴더에 저장하세요:
- icon16.png
- icon48.png
- icon128.png

**옵션 B: 기존 이미지 사용**

프로젝트의 `pixelated-heart-set-three.png`를 리사이즈:
```bash
# ImageMagick 사용 (설치 필요)
cd extension/icons
convert ../../pixelated-heart-set-three.png -resize 16x16 icon16.png
convert ../../pixelated-heart-set-three.png -resize 48x48 icon48.png
convert ../../pixelated-heart-set-three.png -resize 128x128 icon128.png
```

### 2단계: Chrome에 익스텐션 로드

1. **Chrome 열기**

2. **확장 프로그램 페이지로 이동**
   ```
   chrome://extensions/
   ```

3. **개발자 모드 활성화**
   - 오른쪽 상단의 "개발자 모드" 토글 켜기

4. **압축해제된 확장 프로그램을 로드합니다** 클릭

5. **extension 폴더 선택**
   ```
   /Users/blee/Desktop/blee-project/threadsaver/extension
   ```

6. **익스텐션 확인**
   - 🧵 ThreadSaver 아이콘이 툴바에 나타남
   - 에러가 없는지 확인

### 3단계: 서버 실행 확인

익스텐션이 데이터를 전송하려면 ThreadSaver 서버가 실행 중이어야 합니다:

```bash
# 프로젝트 루트에서
npm run dev
```

서버가 http://localhost:4000에서 실행되는지 확인하세요.

## 📖 사용 방법

### 기본 사용법 (증분 추출)

1. **트위터 타래 페이지로 이동**
   ```
   예: https://x.com/username/status/1234567890
   ```

2. **익스텐션 아이콘 클릭**
   - 툴바의 🧵 ThreadSaver 아이콘 클릭

3. **타래 추출 시작**
   - "📥 타래 추출 시작" 버튼 클릭
   - 봇 회피 모드 활성화 시: 3-5분 소요 (안전)
   - 봇 회피 모드 비활성화 시: 1-2분 소요 (빠르지만 위험)
   - 추출된 트윗 개수 및 마지막 트윗 미리보기 확인
   - **⚠️ 주의**: 팝업 창을 닫으면 추출이 중단됩니다!

4. **더 추출하기 (선택사항)**
   - 마지막 트윗을 보고 타래가 더 있다면:
     1. 다음 타래 트윗으로 **수동 이동**
     2. "➕ 계속 추출하기" 버튼 클릭
     3. 새로운 트윗들이 기존 데이터에 추가됨
     4. 필요시 반복
   - 세션 데이터가 유지되므로 팝업을 다시 열어도 이어서 추출 가능

5. **추출 완료 및 저장**
   - 모든 타래를 추출했다면 "✅ 추출 완료 및 저장" 버튼 클릭
   - 서버에 전체 타래 저장
   - 웹 앱에서 카테고리별로 확인 가능

### 봇 회피 모드 설정

**기본값: 활성화 (권장)**

익스텐션 팝업 하단 설정 섹션에서:

#### 🤖 봇 회피 모드 (기본값, 권장)
- **체크 ON**: 안전한 추출 (느리지만 차단 위험 최소화)
  - 랜덤 타이밍 지연 (2-6초)
  - 가변 스크롤 거리 및 속도
  - 마우스 움직임 시뮬레이션
  - 위/아래 랜덤 스크롤
  - 추출 시간: 약 3-5분

#### ⚡ 빠른 모드
- **체크 OFF**: 빠른 추출 (차단 위험 증가)
  - 고정 지연 시간 (1-1.5초)
  - 일정한 스크롤 패턴
  - 마우스 시뮬레이션 없음
  - 추출 시간: 약 1-2분
  - **주의**: 대용량 타래나 빈번한 추출 시 트위터 차단 가능

**설정 저장**: 변경 후 "⚙️ 설정 저장" 버튼 클릭

### 카테고리 시스템

추출된 타래는 트윗 개수에 따라 자동으로 분류됩니다:

| 카테고리 | 트윗 개수 | 설명 | 이모지 | URL |
|---------|----------|------|--------|-----|
| **잡썰** | 1-5개 | 짧은 이야기 | 💬 | `/series/category/jabsseol` |
| **짧썰** | 6-10개 | 가벼운 이야기 | 📝 | `/series/category/jjalbsseol` |
| **단편** | 11-20개 | 완성도 있는 이야기 | 📖 | `/series/category/danpyeon` |
| **중편** | 21-50개 | 긴 이야기 | 📚 | `/series/category/jungpyeon` |
| **장편** | 51개 이상 | 대작 | 📕 | `/series/category/jangpyeon` |

웹앱에서 확인:
- 전체 카테고리: `http://localhost:4000/series`
- 개별 카테고리: `http://localhost:4000/series/category/{카테고리slug}`

예: 130개 트윗 타래 → 장편 카테고리 (`http://localhost:4000/series/category/jangpyeon`)

### 증분 추출의 장점

- 자동 스크롤이 놓친 트윗을 수동으로 추가 가능
- 긴 타래를 여러 번에 나눠서 추출 가능
- 세션이 유지되어 페이지 이동 후에도 이어서 추출 가능
- 팝업을 닫았다가 다시 열어도 기존 추출 데이터 유지
- 중복 제거 자동 처리

### 설정 변경

익스텐션 팝업 하단에서:

1. **서버 URL 변경**
   - 기본값: `http://localhost:4000`
   - 다른 서버 사용 시 URL 입력
   - 연결 문제 시 `http://127.0.0.1:4000` 시도

2. **봇 회피 모드**
   - 체크박스로 활성화/비활성화
   - 기본값: 활성화 (권장)

3. **설정 저장**
   - "⚙️ 설정 저장" 버튼 클릭

## 🔍 문제 해결

### 익스텐션이 로드되지 않음

**증상**: "매니페스트 파일이 누락되었거나 읽을 수 없습니다"

**해결**:
- manifest.json 파일 위치 확인
- 폴더 전체를 선택했는지 확인 (파일 하나만 선택하면 안 됨)

---

**증상**: "필수 아이콘이 없습니다"

**해결**:
- icons/ 폴더에 아이콘 파일이 있는지 확인
- 위의 "1단계: 아이콘 생성" 참고

### "타래 추출하기" 버튼이 비활성화됨

**증상**: 버튼을 클릭할 수 없음

**원인**:
- 트위터 타래 페이지가 아님
- URL에 `/status/` 가 없음

**해결**:
- 트위터 타래의 첫 번째 트윗 URL로 이동
- URL 형식: `https://twitter.com/username/status/1234567890`

### "Could not establish connection" 오류

**증상**: "Extraction failed: Error: Could not establish connection. Receiving end does not exist"

**원인**: 콘텐츠 스크립트가 트위터 페이지에 로드되지 않음

**해결**:
1. **익스텐션 새로고침**:
   ```
   chrome://extensions/ → ThreadSaver → 🔄 새로고침
   ```

2. **트위터 페이지 완전 새로고침**:
   - F5 또는 Cmd+Shift+R (맥) / Ctrl+Shift+R (윈도우)
   - **중요**: 익스텐션만 새로고침하면 안 되고 페이지도 새로고침!

3. **콘솔에서 로드 확인**:
   - 트위터 페이지에서 F12 (개발자 도구)
   - Console 탭에서 다음 메시지 확인:
   ```
   🧵 ThreadSaver: Content script INITIALIZING...
   🧵 ThreadSaver: Content script loaded and listeners registered
   🧵 ThreadSaver: ✅ Content script fully ready and waiting for messages!
   ```

4. **위 로그가 안 보이면**:
   - `chrome://extensions/`에서 "오류" 버튼 확인
   - 익스텐션 권한 확인 (twitter.com, x.com 접근 허용)
   - 필요시 익스텐션 제거 후 재설치

**자세한 디버깅 가이드**: `extension/DEBUG.md` 파일 참고

### 추출은 되는데 저장이 안됨

**증상**: "Save failed: TypeError: Failed to fetch" 또는 "ERR_CONNECTION_REFUSED"

**원인**:
1. 서버가 실행되지 않음
2. 서버 URL이 잘못됨
3. 네트워크 연결 문제
4. localhost 해석 문제

**해결**:

1. **서버 실행 확인**
   ```bash
   # 서버가 실행 중인지 확인
   lsof -i :4000

   # 서버 응답 테스트
   curl http://localhost:4000
   ```

2. **서버 시작 (실행되지 않는 경우)**
   ```bash
   # 새 터미널에서
   cd /Users/blee/Desktop/blee-project/threadsaver
   PORT=4000 npm run dev
   ```

3. **서버 URL 변경 시도**
   - 익스텐션 설정에서 URL을 `http://127.0.0.1:4000`으로 변경
   - 일부 환경에서 `localhost` 대신 `127.0.0.1` 필요
   - "설정 저장" 버튼 클릭

4. **Chrome 재시작**
   - Chrome을 완전히 종료 후 재실행
   - 익스텐션 재로드 (`chrome://extensions/` → 새로고침)

5. **브라우저 콘솔 확인**
   - F12 (개발자 도구)
   - Console 탭에서 에러 메시지 확인

### 저장된 시리즈가 웹앱에 안 보임

**증상**: 추출 완료 후 웹앱에서 시리즈가 보이지 않음

**원인**:
1. 브라우저 캐시
2. 잘못된 카테고리 확인

**해결**:

1. **하드 리프레시**
   - Mac: Cmd + Shift + R
   - Windows/Linux: Ctrl + Shift + R

2. **시크릿 모드에서 확인**
   - 캐시 영향 없이 확인 가능

3. **올바른 카테고리 확인**
   - 트윗 개수에 따라 자동 분류됩니다
   - 예시:
     - 25개 트윗 → 중편 (`/series/category/jungpyeon`)
     - 80개 트윗 → 장편 (`/series/category/jangpyeon`)
     - 101개 트윗 → 장편 (`/series/category/jangpyeon`)
     - 130개 트윗 → 장편 (`/series/category/jangpyeon`)

4. **API 직접 확인**
   ```bash
   # 저장된 시리즈 목록 확인
   curl -s "http://localhost:4000/api/series?limit=10" | jq
   ```

### 트윗이 일부만 추출됨

**증상**: 실제 타래보다 적은 트윗이 추출됨

**원인**:
- 트위터의 느린 로딩
- 매우 긴 타래 (100개 이상)
- 팝업 창이 중간에 닫힘

**해결**:

1. **팝업 창을 열린 상태로 유지**
   - 추출 중 팝업을 닫으면 작업이 중단됩니다
   - 경고 메시지: "⚠️ 창을 닫으면 추출이 중단됩니다!"

2. **점진적 추출 활용**
   - 추출이 중단되어도 세션 데이터는 유지됩니다
   - 팝업을 다시 열면 기존 트윗 개수가 표시됩니다
   - "계속 추출하기" 버튼으로 이어서 추출 가능

3. **봇 회피 모드 활성화**
   - 봇 회피 모드가 비활성화되면 일부 트윗을 놓칠 수 있습니다
   - 설정에서 봇 회피 모드 체크 후 저장

4. **긴 타래 처리**
   - 익스텐션이 자동으로 스크롤하며 로드합니다 (최대 100회)
   - 긴 타래는 3-5분 정도 대기하세요
   - 브라우저 콘솔(F12)에서 진행 상황 확인 가능
   - 더 긴 타래는 여러 번에 나눠서 추출 권장

### 봇 차단 당함

**증상**: "Rate limit exceeded" 또는 트위터 접속 제한

**원인**: 빠른 모드로 대용량 타래를 빈번하게 추출

**해결**:

1. **봇 회피 모드 활성화**
   - 설정에서 "🤖 봇 회피 모드" 체크
   - "설정 저장" 클릭

2. **추출 속도 조절**
   - 한 번에 너무 많은 타래를 추출하지 않기
   - 타래 간 간격을 두고 추출

3. **대기 후 재시도**
   - 차단 후 몇 시간 대기
   - 다음날 다시 시도

4. **다른 방법 활용**
   - 시크릿 모드 사용
   - 다른 계정으로 시도 (권장하지 않음)

### 데이터가 정확하지 않음

**증상**:
- 트윗 내용이 잘못됨
- 통계가 이상함

**원인**: 트위터 DOM 구조 변경

**해결**:
- 브라우저 콘솔에서 에러 확인
- GitHub Issues에 보고
- DOM 선택자 업데이트 필요

## 🐛 디버깅

### 콘솔 로그 확인

**콘텐츠 스크립트 로그**:
```
1. 트위터 페이지에서 F12
2. Console 탭
3. "ThreadSaver" 필터링
```

**백그라운드 스크립트 로그**:
```
1. chrome://extensions/
2. ThreadSaver 카드에서 "서비스 워커" 클릭
3. Console 확인
```

**팝업 로그**:
```
1. 익스텐션 아이콘 우클릭
2. "팝업 검사" 클릭
3. Console 탭
```

### 일반적인 로그 메시지

✅ **정상**:
```
ThreadSaver: Content script loaded
ThreadSaver: Background service worker loaded
ThreadSaver Popup: Initializing...
ThreadSaver: Extracted 15 tweets
```

❌ **오류**:
```
Failed to load settings: [에러]
Extract response: {success: false, error: "..."}
Server response status: 500
```

## 📁 프로젝트 구조

```
extension/
├── manifest.json          # 익스텐션 설정
├── icons/                 # 아이콘 파일
│   ├── icon16.png        # 16x16 (툴바)
│   ├── icon48.png        # 48x48 (관리 페이지)
│   ├── icon128.png       # 128x128 (스토어)
│   └── create-icons.html # 아이콘 생성기
├── popup/                 # 팝업 UI
│   ├── popup.html        # HTML 구조
│   ├── popup.css         # 스타일
│   └── popup.js          # 로직
├── content/               # 콘텐츠 스크립트
│   └── twitter-scraper.js # 트위터 DOM 추출
├── background/            # 백그라운드
│   └── service-worker.js # 서비스 워커
└── README.md             # 이 파일
```

## 🔧 개발자 정보

### 주요 기술 스택

- **Manifest V3**: Chrome Extension API
- **Chrome Storage API**: 설정 및 세션 데이터 저장
  - `chrome.storage.sync`: 서버 URL, 봇 회피 모드 설정
  - `chrome.storage.local`: 추출 세션 데이터 (트윗 누적)
- **Content Scripts**: 트위터 DOM 파싱 및 데이터 추출
- **Message Passing**: Popup ↔ Content Script 통신
- **Fetch API**: 서버와 통신

### 봇 회피 기술 상세

확장 프로그램은 다음 기술로 인간의 행동을 시뮬레이션합니다:

1. **Bezier Curve 기반 랜덤 타이밍**
   ```javascript
   function cubicBezier(t, p0, p1, p2, p3) {
     const u = 1 - t;
     return u*u*u*p0 + 3*u*u*t*p1 + 3*u*t*t*p2 + t*t*t*p3;
   }

   // 2-6초 사이의 자연스러운 랜덤 지연
   function getHumanDelay() {
     const t = Math.random();
     return Math.round(cubicBezier(t, 2000, 2500, 4500, 6000));
   }
   ```

2. **가변 스크롤 거리**
   ```javascript
   function getRandomScrollDistance() {
     const baseScroll = window.innerHeight * 0.6;
     const variance = window.innerHeight * 0.4;
     return baseScroll + (Math.random() * variance);
   }
   ```

3. **마우스 움직임 시뮬레이션**
   ```javascript
   function simulateMouseMove() {
     const event = new MouseEvent('mousemove', {
       clientX: Math.random() * window.innerWidth,
       clientY: Math.random() * window.innerHeight
     });
     document.dispatchEvent(event);
   }
   ```

4. **랜덤 방향 스크롤** (재확인 행동 시뮬레이션)
   - 80% 확률로 아래로 스크롤
   - 20% 확률로 위로 스크롤

### 세션 관리 아키텍처

```javascript
// chrome.storage.local에 저장되는 세션 데이터
{
  accumulatedTweets: [...],  // 누적된 트윗 배열
  threadUrl: "...",           // 타래 URL
  sessionActive: true         // 세션 활성 상태
}

// 생명주기
// 1. 시작: 첫 "타래 추출 시작" 클릭 → 세션 생성
// 2. 누적: "계속 추출하기" → 기존 세션에 트윗 추가
// 3. 유지: 팝업 닫아도 chrome.storage.local에 보존
// 4. 저장: "추출 완료 및 저장" → 서버 전송
// 5. 초기화: 저장 완료 후 세션 데이터 삭제
```

### 데이터 흐름

```
┌─────────────┐
│  Popup UI   │
│             │
│ [시작 버튼]  │
└──────┬──────┘
       │ chrome.tabs.sendMessage({
       │   action: 'EXTRACT_THREAD',
       │   botAvoidance: true/false
       │ })
       ↓
┌─────────────────────┐
│  Content Script     │
│  (twitter-scraper)  │
│                     │
│ extractThreadData() │ ← 봇 회피 로직 실행
│ parseTweetElement() │ ← DOM 파싱
└──────┬──────────────┘
       │ sendResponse({
       │   success: true,
       │   data: { tweets: [...] }
       │ })
       ↓
┌─────────────┐
│  Popup UI   │
│             │
│ [저장 버튼]  │
└──────┬──────┘
       │ fetch('http://localhost:4000/api/scrape/extension', {
       │   method: 'POST',
       │   body: JSON.stringify({
       │     tweets: [...],
       │     threadUrl: "...",
       │     authorUsername: "..."
       │   })
       │ })
       ↓
┌──────────────────┐
│ ThreadSaver API  │
│ (localhost:4000) │
│                  │
│ /api/scrape/     │ ← 데이터베이스 저장
│   extension      │
└──────────────────┘
```

### 코드 수정 가이드

**트윗 추출 로직 수정**:
```javascript
// content/twitter-scraper.js
function parseTweetElement(article, index) {
  // 여기서 DOM 선택자 수정
}

// 봇 회피 파라미터 조정
function extractThreadData(botAvoidance = true) {
  // botAvoidance가 true일 때의 동작 수정
}
```

**UI 스타일 변경**:
```css
/* popup/popup.css */
/* 원하는 스타일 수정 */
```

**서버 URL 기본값 변경**:
```javascript
// popup/popup.js
async function loadSettings() {
  const result = await chrome.storage.sync.get(['serverUrl', 'botAvoidance']);
  if (result.serverUrl) {
    elements.serverUrl.value = result.serverUrl;
  } else {
    elements.serverUrl.value = 'http://localhost:4000'; // 기본 URL
  }
  // 봇 회피 모드 기본값: true
  elements.botAvoidance.checked = result.botAvoidance !== undefined ? result.botAvoidance : true;
}
```

### 재로드

코드를 수정한 후:
```
1. chrome://extensions/
2. ThreadSaver 카드에서 🔄 (새로고침) 클릭
3. 또는 "업데이트" 버튼 클릭
```

## 📝 API 엔드포인트

익스텐션이 호출하는 API:

```
POST /api/scrape/extension
Content-Type: application/json

{
  "url": "https://twitter.com/username/status/123",
  "tweets": [
    {
      "id": "123",
      "content": "트윗 내용",
      "authorUsername": "username",
      "createdAt": "2024-01-01T00:00:00Z",
      "sequenceNumber": 1,
      "likeCount": 10,
      "retweetCount": 5,
      "mediaUrls": [],
      "replyToId": null
    }
  ]
}
```

응답:
```json
{
  "success": true,
  "data": {
    "threadId": "uuid",
    "message": "Thread saved successfully"
  }
}
```

## 🤝 기여

버그 리포트나 기능 제안은 GitHub Issues에 올려주세요.

## 📜 라이선스

MIT License

---

Made with ❤️ for Twitter threads
