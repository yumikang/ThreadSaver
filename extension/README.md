# ThreadSaver 브라우저 익스텐션 🧵

트위터 타래를 쉽게 추출하고 저장하는 Chrome/Edge 익스텐션입니다.

## 📋 기능

- ✅ 트위터 타래 페이지에서 직접 데이터 추출
- ✅ 트윗 내용, 작성자, 시간, 통계, 미디어 URL 추출
- ✅ ThreadSaver 서버로 자동 전송
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

### 기본 사용법

1. **트위터 타래 페이지로 이동**
   ```
   예: https://twitter.com/username/status/1234567890
   ```

2. **익스텐션 아이콘 클릭**
   - 툴바의 🧵 ThreadSaver 아이콘 클릭
   - 또는 익스텐션 메뉴에서 선택

3. **타래 추출하기**
   - "📥 타래 추출하기" 버튼 클릭
   - 페이지가 자동으로 스크롤되며 모든 트윗 로드
   - 추출된 트윗 개수 확인

4. **서버에 저장하기**
   - "💾 서버에 저장하기" 버튼 클릭
   - 성공 메시지 확인
   - 웹 앱에서 저장된 타래 확인

### 설정 변경

익스텐션 팝업 하단에서:

1. **서버 URL 변경**
   - 기본값: `http://localhost:4000`
   - 다른 서버 사용 시 URL 입력

2. **설정 저장**
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

### 추출은 되는데 저장이 안됨

**증상**: "서버에 저장하기" 실패

**원인**:
1. 서버가 실행되지 않음
2. 서버 URL이 잘못됨
3. CORS 오류

**해결**:

1. **서버 확인**
   ```bash
   # 새 터미널에서
   cd /Users/blee/Desktop/blee-project/threadsaver
   npm run dev
   ```

2. **서버 URL 확인**
   - 익스텐션 팝업에서 URL 확인
   - `http://localhost:4000` (기본값)

3. **브라우저 콘솔 확인**
   - F12 (개발자 도구)
   - Console 탭에서 에러 메시지 확인

### 트윗이 일부만 추출됨

**증상**: 실제 타래보다 적은 트윗이 추출됨

**원인**:
- 트위터가 모든 트윗을 로드하지 않음
- 스크롤이 충분하지 않음

**해결**:
- 익스텐션 사용 전에 페이지를 끝까지 수동 스크롤
- 또는 콘텐츠 스크립트의 `maxScrolls` 값 증가
  ```javascript
  // content/twitter-scraper.js
  const maxScrolls = 100; // 기본값: 50
  ```

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

### 코드 수정

**트윗 추출 로직 수정**:
```javascript
// content/twitter-scraper.js
function parseTweetElement(article, index) {
  // 여기서 DOM 선택자 수정
}
```

**UI 스타일 변경**:
```css
/* popup/popup.css */
/* 원하는 스타일 수정 */
```

**서버 URL 기본값 변경**:
```javascript
// background/service-worker.js
chrome.storage.sync.set({
  serverUrl: 'https://your-server.com' // 기본 URL
});
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
