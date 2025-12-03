# ThreadSaver 배포 가이드

## 🚀 무료 배포 (Vercel + Supabase)

### 1. Supabase 데이터베이스 설정

1. [Supabase](https://supabase.com) 회원가입
2. **New Project** 클릭
3. 프로젝트 설정:
   - Name: `threadsaver`
   - Database Password: 안전한 비밀번호 설정
   - Region: **Singapore** (한국과 가장 가까움)
4. 프로젝트 생성 완료 후:
   - Settings → Database 이동
   - **Connection String** → **URI** 복사
   - 형식: `postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres`

### 2. Vercel 배포

```bash
# 1. Vercel CLI 설치
npm i -g vercel

# 2. 프로젝트 루트에서 배포
vercel

# 3. 질문에 답변:
# - Set up and deploy? → Y
# - Which scope? → 개인 계정
# - Link to existing project? → N
# - Project name? → threadsaver
# - In which directory? → ./
# - Override settings? → N
```

### 3. 환경 변수 설정

Vercel 대시보드 또는 CLI로 설정:

```bash
# DATABASE_URL 설정
vercel env add DATABASE_URL
# Supabase 연결 URL 붙여넣기

# NEXT_PUBLIC_APP_URL 설정
vercel env add NEXT_PUBLIC_APP_URL
# https://your-project.vercel.app 입력
```

### 4. 데이터베이스 초기화

```bash
# Prisma로 스키마 적용 (프로덕션)
npx prisma migrate deploy

# 또는 개발 환경
npx prisma db push
```

### 5. 프로덕션 배포

```bash
vercel --prod
```

## 📊 무료 플랜 제한

### Vercel
- ✅ 무제한 배포
- ✅ 100GB 대역폭/월
- ✅ 자동 HTTPS
- ⚠️ 서버리스 함수 실행시간 10초

### Supabase
- ✅ 500MB 데이터베이스
- ✅ 무제한 API 요청
- ✅ 50,000 월간 활성 사용자
- ⚠️ 7일간 비활성 시 일시 중지 (재활성화 가능)

**예상 사용량** (2-30명 기준):
- DB 크기: ~50-200MB (충분함)
- 대역폭: ~5-20GB/월 (충분함)

## 🔧 브라우저 익스텐션 설정

배포 후 익스텐션의 서버 URL을 변경해야 합니다:

1. `extension/manifest.json`:
```json
"host_permissions": [
  "*://twitter.com/*",
  "*://x.com/*",
  "https://your-app.vercel.app/*"
]
```

2. `extension/popup/popup.html`:
```html
<input
  value="https://your-app.vercel.app"
  placeholder="https://your-app.vercel.app"
>
```

3. `extension/background/service-worker.js`:
```javascript
serverUrl: 'https://your-app.vercel.app'
```

## 📝 사용자에게 공유

배포 완료 후 다음 정보를 공유하세요:

1. **웹 앱 URL**: `https://your-app.vercel.app`
2. **익스텐션 설치 가이드**: `extension/README.md` 참고
3. **익스텐션 파일**: `extension/` 폴더 ZIP으로 공유

## ⚠️ 주의사항

1. **환경 변수 보안**: `.env.local` 파일은 Git에 커밋하지 마세요
2. **데이터베이스 백업**: Supabase 대시보드에서 주기적으로 백업
3. **익스텐션 업데이트**: 서버 URL 변경 시 익스텐션도 함께 업데이트

## 🆘 문제 해결

### 배포 실패
```bash
# 로그 확인
vercel logs

# 재배포
vercel --prod --force
```

### 데이터베이스 연결 오류
- Supabase 프로젝트가 활성화되어 있는지 확인
- DATABASE_URL이 올바른지 확인
- Vercel 환경 변수가 제대로 설정되었는지 확인

### 익스텐션 연결 오류
- CORS 설정 확인
- 서버 URL이 HTTPS인지 확인
- manifest.json의 host_permissions 확인
