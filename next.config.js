/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '500mb', // Twitter Archive는 최대 500MB
    },
  },
  // API 라우트 body 크기 제한도 증가
  api: {
    bodyParser: {
      sizeLimit: '500mb',
    },
  },
}

module.exports = nextConfig
