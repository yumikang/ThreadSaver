#!/bin/bash

# ThreadSaver 서버 시작 스크립트
echo "🚀 ThreadSaver 서버를 시작합니다..."

# 이미 실행 중인 서버가 있으면 종료
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null ; then
    echo "⚠️  4000 포트에서 실행 중인 서버를 종료합니다..."
    lsof -ti :4000 | xargs kill -9
    sleep 2
fi

# 프로젝트 디렉토리로 이동
cd "$(dirname "$0")"

# 서버 시작
echo "✅ 서버를 시작합니다 (포트 4000)"
echo "📱 브라우저에서 http://localhost:4000 으로 접속하세요"
echo "🛑 종료하려면 Ctrl+C를 누르세요"
echo ""

PORT=4000 npm run dev
