// Quick script to check series data in database
require('dotenv/config')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  try {
    // Get total series count
    const totalCount = await prisma.series.count()
    console.log(`Total series in database: ${totalCount}`)

    // Get recent series with details
    const recentSeries = await prisma.series.findMany({
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        totalThreads: true,
        totalTweets: true,
        isPublic: true,
        createdAt: true,
      }
    })

    console.log('\nRecent series:')
    recentSeries.forEach(s => {
      console.log(`- ${s.title} (${s.slug})`)
      console.log(`  Threads: ${s.totalThreads}, Tweets: ${s.totalTweets}, Public: ${s.isPublic}`)
    })
  } catch (error) {
    console.error('Error querying database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
