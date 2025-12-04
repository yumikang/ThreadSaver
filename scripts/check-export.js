const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkLatestExport() {
  try {
    // 가장 최근 내보낸 프로젝트 조회
    const latestProject = await prisma.project.findFirst({
      orderBy: { createdAt: 'desc' },
      include: {
        linkedSeries: {
          include: {
            series: true,
          },
        },
        episodes: {
          include: {
            notes: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!latestProject) {
      console.log('❌ 내보낸 프로젝트가 없습니다.')
      return
    }

    console.log('✅ 가장 최근 내보낸 프로젝트:')
    console.log('━'.repeat(60))
    console.log(`📚 프로젝트 제목: ${latestProject.title}`)
    console.log(`🆔 프로젝트 ID: ${latestProject.id}`)
    console.log(`⏰ 생성 시간: ${latestProject.createdAt}`)
    console.log(`🔗 연결된 시리즈: ${latestProject.linkedSeries?.series?.title || 'N/A'}`)
    console.log(`📊 통계:`)
    console.log(`   - 에피소드 수: ${latestProject.episodes.length}개`)

    const totalNotes = latestProject.episodes.reduce((sum, ep) => sum + ep.notes.length, 0)
    console.log(`   - 총 노트 수: ${totalNotes}개`)

    console.log('\n📖 에피소드 상세:')
    latestProject.episodes.forEach((episode, idx) => {
      console.log(`   ${idx + 1}. ${episode.title} (${episode.notes.length}개 노트)`)
    })

    // 첫 번째 에피소드의 첫 3개 노트 샘플
    if (latestProject.episodes.length > 0 && latestProject.episodes[0].notes.length > 0) {
      console.log('\n📝 첫 번째 에피소드 노트 샘플 (처음 3개):')
      latestProject.episodes[0].notes.slice(0, 3).forEach((note, idx) => {
        const preview = note.content.substring(0, 50)
        console.log(`   ${idx + 1}. ${preview}${note.content.length > 50 ? '...' : ''}`)
      })
    }

    console.log('━'.repeat(60))
  } catch (error) {
    console.error('❌ 오류:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkLatestExport()
