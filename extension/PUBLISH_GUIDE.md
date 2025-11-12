# Chrome 웹 스토어 배포 가이드

## 사전 준비

### 1. Chrome 개발자 계정 등록
1. [Chrome 웹 스토어 개발자 대시보드](https://chrome.google.com/webstore/devconsole) 접속
2. Google 계정으로 로그인
3. **$5 USD 일회성 등록 비용** 결제 (평생 유효)
4. 개발자 정보 입력 (이메일, 개인/회사 정보)

### 2. 필수 준비물

#### 아이콘 (이미 준비됨 ✅)
- ✅ 16x16px - `icons/icon16.png`
- ✅ 48x48px - `icons/icon48.png`
- ✅ 128x128px - `icons/icon128.png`

#### 스크린샷 (필수)
**요구사항:**
- 최소 1개, 최대 5개
- 크기: 1280x800 또는 640x400
- 형식: PNG 또는 JPEG
- 용량: 각 2MB 이하

**포함할 내용:**
1. 익스텐션 팝업 UI (타래 추출 전)
2. 추출 진행 중 화면
3. 추출 완료 후 화면
4. 설정 화면
5. 웹앱에서 저장된 시리즈 확인

#### 프로모션 타일 (선택사항, 권장)
- 크기: 440x280px
- 형식: PNG 또는 JPEG
- Chrome 웹 스토어 홈페이지 노출 시 사용

#### 설명 자료
- **짧은 설명** (132자 이하): 검색 결과에 표시
- **상세 설명** (16,000자 이하): 확장 프로그램 페이지에 표시
- **개인정보 보호정책** URL (필수)

## 배포 준비

### 1. manifest.json 검증

현재 manifest.json이 웹 스토어 요구사항을 충족하는지 확인:

```json
{
  "manifest_version": 3,  // ✅ 최신 버전
  "name": "ThreadSaver",  // ✅ 명확한 이름
  "version": "1.0.0",     // ✅ 유효한 버전
  "description": "트위터 타래를 추출하고 저장하는 확장 프로그램",
  "permissions": ["activeTab", "storage"],  // ✅ 필요한 권한만
  "host_permissions": [
    "*://twitter.com/*",
    "*://x.com/*",
    "http://localhost:4000/*"  // ⚠️ 배포 시 제거 필요
  ]
}
```

**배포 전 수정 필요:**
- `localhost` host_permission 제거 또는 옵션으로 변경
- 프로덕션 서버 URL로 변경

### 2. ZIP 파일 생성

```bash
cd /Users/blee/Desktop/blee-project/threadsaver/extension
zip -r threadsaver-extension-v1.0.0.zip . \
  -x "*.DS_Store" \
  -x "*.git*" \
  -x "DEBUG.md" \
  -x "QUICK_FIX.md" \
  -x "README.md" \
  -x "PUBLISH_GUIDE.md"
```

**포함되어야 할 파일:**
- ✅ manifest.json
- ✅ popup/popup.html, popup.css, popup.js
- ✅ content/twitter-scraper.js
- ✅ background/service-worker.js
- ✅ icons/ (모든 아이콘 파일)

**제외해야 할 파일:**
- ❌ 개발 문서 (README, DEBUG 등)
- ❌ .git, .DS_Store
- ❌ 테스트 파일

### 3. 개인정보 보호정책 작성

웹 스토어는 **개인정보 보호정책 URL**을 요구합니다.

**포함할 내용:**
```markdown
# ThreadSaver 개인정보 보호정책

## 수집하는 정보
- 추출된 트위터 타래 데이터 (트윗 내용, 작성자, 날짜)
- 사용자 설정 (서버 URL, 봇 회피 모드 설정)

## 데이터 저장
- 모든 데이터는 사용자의 로컬 Chrome 스토리지에 저장됩니다
- 사용자가 지정한 서버로만 데이터를 전송합니다
- 제3자와 데이터를 공유하지 않습니다

## 권한 사용
- activeTab: 현재 트위터 페이지의 타래 추출
- storage: 추출된 데이터 임시 저장 및 설정 저장
- host_permissions: 트위터(twitter.com, x.com) 접근

## 문의
이메일: [your-email@example.com]
```

GitHub Pages나 개인 웹사이트에 호스팅하세요.

## 배포 단계

### 1. Chrome 웹 스토어 대시보드 접속
[Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

### 2. 새 항목 추가
1. "새 항목" 버튼 클릭
2. ZIP 파일 업로드
3. 자동 검증 대기 (몇 분 소요)

### 3. 스토어 등록정보 작성

#### 제품 세부정보
**이름:** ThreadSaver

**짧은 설명 (132자):**
```
트위터 타래를 쉽게 추출하고 저장하세요. 봇 회피 기술로 안전하게, 웹소설처럼 편하게 읽을 수 있습니다.
```

**상세 설명:**
```markdown
# ThreadSaver - 트위터 타래를 웹소설처럼

트위터(X)의 긴 타래를 웹소설처럼 편하게 읽고 저장하세요.

## 주요 기능

🤖 **봇 회피 모드**
- 안전한 추출: 느리지만 차단 위험 최소화
- 빠른 추출: 빠르지만 차단 위험 증가
- 사용자가 선택 가능

📚 **자동 카테고리 분류**
- 잡썰 (1-5트윗): 짧은 이야기
- 짧썰 (6-10트윗): 가벼운 이야기
- 단편 (11-20트윗): 완성도 있는 이야기
- 중편 (21-50트윗): 긴 이야기
- 장편 (51+트윗): 대작

💾 **점진적 추출**
- 세션 유지로 중단 없이 이어서 추출
- 팝업을 닫아도 데이터 보존
- 대용량 타래도 안전하게 추출

📖 **웹소설처럼 읽기**
- 깔끔한 리더 UI
- 북마크 및 읽기 진행 상황 저장
- 다크 모드 지원

## 사용 방법

1. 트위터 타래 페이지로 이동
2. 익스텐션 아이콘 클릭
3. "타래 추출 시작" 클릭
4. 추출 완료 후 "저장" 클릭
5. 웹앱에서 편하게 읽기

## 개인정보 보호

- 모든 데이터는 사용자의 로컬 저장소에 보관
- 사용자가 지정한 서버로만 데이터 전송
- 제3자와 데이터 공유 없음

## 지원

문의사항이나 버그 리포트는 GitHub Issues로 보내주세요.
```

**카테고리:**
- 주 카테고리: 생산성 (Productivity)
- 부 카테고리: 소셜 & 커뮤니케이션

**언어:** 한국어 (Korean)

#### 그래픽 자료
1. **아이콘 128x128** - 자동으로 manifest.json에서 가져옴
2. **스크린샷** - 최소 1개, 최대 5개 업로드
3. **프로모션 타일** (선택사항)

#### 개인정보 보호
1. **개인정보 보호정책 URL** 입력
2. **권한 사용 목적** 설명:
   - `activeTab`: 현재 트위터 페이지의 타래 데이터 추출
   - `storage`: 추출 세션 및 사용자 설정 저장
   - `host_permissions (twitter.com, x.com)`: 트위터 타래 페이지 접근

#### 배포 옵션
- **공개 범위:** 
  - 공개 (누구나 검색 및 설치 가능)
  - 비공개 (링크를 아는 사람만)
  - 테스터 그룹 (지정된 사용자만)

- **지역:** 전 세계 또는 특정 국가

### 4. 심사 제출

1. "검토를 위해 제출" 클릭
2. **자동 검토**: 몇 분 ~ 몇 시간
3. **수동 검토**: 며칠 ~ 1주일
4. 승인 또는 거절 이메일 수신

## 심사 통과 팁

### ✅ 승인 확률을 높이는 방법

1. **명확한 설명**
   - 확장 프로그램이 무엇을 하는지 명확히 설명
   - 권한이 왜 필요한지 구체적으로 설명

2. **필수 권한만 요청**
   - 불필요한 권한 제거
   - 각 권한의 사용 목적 문서화

3. **품질 높은 스크린샷**
   - 실제 사용 화면 캡처
   - 주요 기능 시연
   - 깔끔하고 전문적인 이미지

4. **개인정보 보호정책**
   - 명확하고 투명한 정책
   - 데이터 수집/사용/저장 방식 설명

5. **코드 품질**
   - 악성 코드 없음
   - 난독화되지 않은 코드
   - 명확한 주석

### ❌ 거절 사유

1. **권한 남용**
   - 불필요한 권한 요청
   - 권한 사용 목적 불명확

2. **개인정보 보호 위반**
   - 개인정보 보호정책 없음
   - 사용자 동의 없이 데이터 수집

3. **악성 코드**
   - 악의적인 기능
   - 광고/트래커 과다

4. **저작권 침해**
   - 타인의 상표/로고 무단 사용
   - 중복 확장 프로그램

5. **명확하지 않은 기능**
   - 설명과 실제 기능 불일치
   - 숨겨진 기능

## 배포 후

### 버전 업데이트

1. manifest.json 버전 증가
2. ZIP 파일 재생성
3. 대시보드에서 "패키지 업데이트" 업로드
4. 변경사항 설명 작성
5. 제출

### 사용자 피드백 관리

- Chrome 웹 스토어 리뷰 모니터링
- GitHub Issues 관리
- 주기적인 버전 업데이트

## 배포 전 체크리스트

- [ ] 개발자 계정 등록 ($5 결제)
- [ ] localhost 권한 제거/수정
- [ ] 프로덕션 서버 URL 설정
- [ ] 아이콘 3종 준비 (16, 48, 128px)
- [ ] 스크린샷 1-5개 준비
- [ ] 개인정보 보호정책 작성 및 호스팅
- [ ] 짧은 설명 작성 (132자 이하)
- [ ] 상세 설명 작성
- [ ] ZIP 파일 생성 (개발 파일 제외)
- [ ] 모든 설명 검토
- [ ] 테스트 설치 및 동작 확인

## 유용한 링크

- [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
- [Chrome Extension 개발자 정책](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Extension 심사 가이드](https://developer.chrome.com/docs/webstore/review-process/)
- [개인정보 보호 가이드](https://developer.chrome.com/docs/webstore/user_data/)

## 예상 타임라인

| 단계 | 소요 시간 |
|------|----------|
| 개발자 등록 | 즉시 |
| 자료 준비 (스크린샷, 정책) | 1-2일 |
| 스토어 등록정보 작성 | 1-2시간 |
| 자동 검토 | 몇 분 ~ 몇 시간 |
| 수동 검토 | 1-7일 |
| **총 예상 시간** | **2-10일** |

## 문의

배포 과정에서 문제가 발생하면:
1. Chrome Web Store 지원팀에 문의
2. [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-extension) 검색
3. GitHub Issues에 질문

---

Made with ❤️ for Twitter threads
