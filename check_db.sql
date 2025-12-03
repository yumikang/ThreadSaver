-- Thread 테이블 확인
SELECT 
  'Thread' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT "authorUsername") as unique_authors
FROM "Thread";

-- Series 테이블 확인  
SELECT 
  'Series' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT "authorUsername") as unique_authors
FROM "Series";

-- Tweet 테이블 확인
SELECT 
  'Tweet' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT "authorUsername") as unique_authors
FROM "Tweet";

-- SeriesThread 연결 확인
SELECT 
  'SeriesThread' as table_name,
  COUNT(*) as total_count
FROM "SeriesThread";
