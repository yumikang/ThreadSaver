# 🐛 익스텐션 디버깅 가이드

"Could not establish connection" 오류가 발생하면 다음 단계를 따라주세요.

## 1단계: 익스텐션 재로드 ✅

1. 크롬에서 `chrome://extensions/` 열기
2. "ThreadSaver" 카드 찾기
3. 🔄 새로고침 버튼 클릭
4. 에러가 있는지 확인 (빨간색 "오류" 버튼이 보이면 클릭해서 확인)

## 2단계: 트위터 페이지 새로고침 ✅

1. 트위터 타래 페이지로 이동 (예: `https://x.com/username/status/123456789`)
2. **F5** 또는 **Cmd+Shift+R** (맥) / **Ctrl+Shift+R** (윈도우)로 **하드 리프레시**
3. 페이지가 완전히 로드될 때까지 기다리기

## 3단계: 콘솔에서 로그 확인 🔍

1. 트위터 페이지에서 **F12** (개발자 도구 열기)
2. **Console** 탭 클릭
3. 다음 로그 메시지들이 보이는지 확인:

```
✅ 정상 로드된 경우:
🧵 ThreadSaver: Content script INITIALIZING...
🧵 ThreadSaver: Current URL: https://x.com/...
🧵 ThreadSaver: Hostname: x.com
🧵 ThreadSaver: Content script loaded and listeners registered
🧵 ThreadSaver: Page fully loaded, content script ready
🧵 ThreadSaver: ✅ Content script fully ready and waiting for messages!
```

**아무 로그도 안 보이면**: 콘텐츠 스크립트가 로드되지 않은 것입니다.

## 4단계: 익스텐션 팝업 열기 🧵

1. 크롬 툴바에서 ThreadSaver 아이콘 클릭
2. 팝업이 열리면서 다음 로그가 **트위터 페이지 콘솔**에 나타나야 함:

```
🧵 ThreadSaver: Received message from popup: {action: "EXTRACT_THREAD"}
🧵 ThreadSaver: Starting thread extraction...
```

## 5단계: 로그 패턴별 문제 진단 🔧

### 패턴 A: 아무 로그도 안 보임
**원인**: 콘텐츠 스크립트가 로드되지 않음
**해결**:
1. `chrome://extensions/`에서 "오류" 버튼 확인
2. manifest.json에 JavaScript 에러가 있을 수 있음
3. 익스텐션 권한 확인 (twitter.com, x.com 접근 허용되었는지)

### 패턴 B: 초기 로그는 보이는데 "ready" 로그가 안 보임
**원인**: 스크립트 중간에 에러 발생
**해결**:
1. Console에서 빨간색 에러 메시지 확인
2. JavaScript 문법 에러나 Chrome API 에러 가능성

### 패턴 C: "ready" 로그는 보이는데 "Received message" 로그가 안 보임
**원인**: 팝업에서 메시지 전송 실패
**해결**:
1. 팝업 우클릭 → "검사" → Console 확인
2. popup.js에서 에러 발생했는지 확인

### 패턴 D: 모든 로그가 보이는데 extraction 도중 에러
**원인**: Twitter DOM 구조 변경 또는 추출 로직 오류
**해결**:
1. 콘솔에서 상세 에러 메시지 확인
2. DOM 선택자가 변경되었을 가능성

## 6단계: 권한 확인 🔐

1. `chrome://extensions/` → ThreadSaver → "세부정보"
2. "사이트 액세스" 섹션 확인
3. "모든 사이트에서" 또는 "특정 사이트에서" 선택되어 있어야 함
4. twitter.com과 x.com이 허용되어 있는지 확인

## 7단계: 완전 재설치 (최후의 수단) 🔄

1. `chrome://extensions/`에서 ThreadSaver 제거
2. 크롬 재시작
3. 익스텐션 재설치:
   - "압축해제된 확장 프로그램을 로드합니다" 클릭
   - `/Users/blee/Desktop/blee-project/threadsaver/extension` 폴더 선택

## 자주 발생하는 실수 ⚠️

1. ❌ 익스텐션만 새로고침하고 트위터 페이지는 안 새로고침
   → ✅ **둘 다** 새로고침 필요!

2. ❌ 트위터 메인 페이지(피드)에서 테스트
   → ✅ 반드시 **타래 페이지** (URL에 `/status/` 포함)에서 테스트

3. ❌ 개발자 도구 Console에서 로그 필터링됨
   → ✅ Console에서 "ThreadSaver" 또는 "🧵" 검색

4. ❌ 익스텐션이 비활성화됨
   → ✅ `chrome://extensions/`에서 토글이 켜져있는지 확인

## 도움이 필요하면 📸

다음 스크린샷을 찍어주세요:

1. `chrome://extensions/`의 ThreadSaver 카드 전체
2. 트위터 타래 페이지의 F12 Console (🧵 로그 전체)
3. ThreadSaver 팝업 (에러 메시지 포함)
4. `chrome://extensions/`의 "오류" 버튼 클릭 후 화면 (에러가 있는 경우)
