/**
 * ThreadSaver - Twitter Content Script
 * 트위터 타래 데이터를 추출하는 콘텐츠 스크립트
 */

console.log('ThreadSaver: Content script loaded');

// 트위터 페이지인지 확인
function isTwitterPage() {
  return window.location.hostname === 'twitter.com' || window.location.hostname === 'x.com';
}

// 타래 페이지인지 확인 (status URL)
function isThreadPage() {
  const url = window.location.pathname;
  return url.includes('/status/');
}

// URL에서 트윗 ID 추출
function getTweetIdFromUrl() {
  const match = window.location.pathname.match(/\/status\/(\d+)/);
  return match ? match[1] : null;
}

// 대기 함수
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// "Show replies" 또는 "더 보기" 버튼 클릭
function clickShowMoreButtons() {
  let clickedCount = 0;

  try {
    // 모든 버튼 찾기
    const buttons = document.querySelectorAll('div[role="button"], span[role="button"]');

    buttons.forEach(button => {
      try {
        const text = button.textContent?.toLowerCase() || '';

        // "show", "replies", "더 보기", "답글" 등의 키워드 포함 시 클릭
        // 하지만 메인 액션 버튼은 제외 (retweet, like 등)
        if ((text.includes('show') ||
             text.includes('replies') ||
             text.includes('더 보기') ||
             text.includes('더보기') ||
             text.includes('답글')) &&
            !text.includes('retweet') &&
            !text.includes('like') &&
            !text.includes('share') &&
            !text.includes('bookmark')) {

          button.click();
          clickedCount++;
        }
      } catch (e) {
        // 개별 버튼 클릭 실패는 무시
        console.log('ThreadSaver: Button click failed (safe to ignore):', e.message);
      }
    });

    if (clickedCount > 0) {
      console.log(`ThreadSaver: Clicked ${clickedCount} "Show more" buttons`);
    }
  } catch (e) {
    console.error('ThreadSaver: Error in clickShowMoreButtons:', e);
  }

  return clickedCount;
}

// 스크롤하여 모든 트윗 로드
async function loadAllTweets() {
  const maxScrolls = 150; // 최대 스크롤 횟수 더 증가
  let previousTweetCount = 0;
  let stableCount = 0; // 트윗 개수가 변하지 않은 횟수
  let scrollCount = 0;

  console.log('ThreadSaver: Starting aggressive scroll to load all tweets...');
  console.log('ThreadSaver: This may take 1-3 minutes for long threads');

  while (scrollCount < maxScrolls) {
    // 현재 트윗 개수 확인
    const currentTweetCount = document.querySelectorAll('article[data-testid="tweet"]').length;

    console.log(`ThreadSaver: Scroll ${scrollCount + 1}, tweets: ${currentTweetCount}, stable: ${stableCount}`);

    // "더 보기" 버튼 클릭 시도
    const buttonsClicked = clickShowMoreButtons();
    if (buttonsClicked > 0) {
      // 버튼 클릭 후 추가 대기
      await wait(1000);
      stableCount = 0; // 버튼 클릭했으면 카운터 리셋
    }

    // 트윗 개수가 변하지 않으면 카운트 증가
    if (currentTweetCount === previousTweetCount) {
      stableCount++;
      // 5번 연속 변화 없으면 종료
      if (stableCount >= 5) {
        console.log('ThreadSaver: No new tweets loaded after 5 attempts, stopping');
        break;
      }
    } else {
      console.log(`ThreadSaver: Found ${currentTweetCount - previousTweetCount} new tweets!`);
      stableCount = 0; // 변화가 있으면 리셋
      previousTweetCount = currentTweetCount;
    }

    // 스크롤 - 여러 방법 시도
    window.scrollTo(0, document.documentElement.scrollHeight);
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    window.scrollBy(0, 1000); // 추가 스크롤

    // 더 긴 대기 시간 (트위터 로딩 시간 충분히 확보)
    await wait(1500);

    scrollCount++;
  }

  console.log(`ThreadSaver: Scroll complete. Waiting for final loading...`);

  // 마지막으로 버튼 클릭 한 번 더 시도
  clickShowMoreButtons();
  await wait(1000);

  // 마지막으로 충분히 대기 (로딩 완료 확인)
  await wait(2000);

  // 맨 위로 스크롤
  window.scrollTo(0, 0);
  await wait(500);

  const finalCount = document.querySelectorAll('article[data-testid="tweet"]').length;
  console.log(`ThreadSaver: ✅ Successfully loaded ${finalCount} tweets after ${scrollCount} scrolls`);
}

// 트윗 요소들 찾기
function findTweetElements() {
  // 트위터의 트윗 article 요소들
  const articles = document.querySelectorAll('article[data-testid="tweet"]');
  console.log(`ThreadSaver: Found ${articles.length} tweet elements`);
  return Array.from(articles);
}

// 트윗 ID 추출
function extractTweetId(article) {
  // 트윗 링크에서 ID 추출
  const link = article.querySelector('a[href*="/status/"]');
  if (link) {
    const match = link.getAttribute('href').match(/\/status\/(\d+)/);
    if (match) return match[1];
  }
  return null;
}

// 트윗 내용 추출
function extractTweetContent(article) {
  const tweetTextElement = article.querySelector('[data-testid="tweetText"]');
  if (!tweetTextElement) return '';

  // 텍스트 노드와 링크를 조합하여 완전한 내용 추출
  let content = '';
  tweetTextElement.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      content += node.textContent;
    } else if (node.tagName === 'A') {
      content += node.textContent;
    } else if (node.tagName === 'SPAN') {
      content += node.textContent;
    }
  });

  return content.trim();
}

// 작성자 정보 추출
function extractAuthorUsername(article) {
  // 작성자 링크에서 username 추출
  const authorLink = article.querySelector('a[href^="/"][href*="/status/"]');
  if (authorLink) {
    const href = authorLink.getAttribute('href');
    const match = href.match(/^\/([^\/]+)\//);
    if (match) return match[1];
  }
  return 'unknown';
}

// 시간 정보 추출
function extractCreatedAt(article) {
  const timeElement = article.querySelector('time');
  if (timeElement) {
    const datetime = timeElement.getAttribute('datetime');
    if (datetime) return datetime;
  }
  return new Date().toISOString();
}

// 통계 정보 추출 (좋아요, 리트윗)
function extractStats(article) {
  const stats = {
    likeCount: 0,
    retweetCount: 0
  };

  // 좋아요 수
  const likeButton = article.querySelector('[data-testid="like"]');
  if (likeButton) {
    const likeText = likeButton.getAttribute('aria-label');
    const likeMatch = likeText?.match(/(\d+)/);
    if (likeMatch) stats.likeCount = parseInt(likeMatch[1], 10);
  }

  // 리트윗 수
  const retweetButton = article.querySelector('[data-testid="retweet"]');
  if (retweetButton) {
    const retweetText = retweetButton.getAttribute('aria-label');
    const retweetMatch = retweetText?.match(/(\d+)/);
    if (retweetMatch) stats.retweetCount = parseInt(retweetMatch[1], 10);
  }

  return stats;
}

// 미디어 URL 추출
function extractMediaUrls(article) {
  const mediaUrls = [];

  // 이미지
  const images = article.querySelectorAll('img[src*="media"]');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && !src.includes('profile_images') && !src.includes('emoji')) {
      mediaUrls.push(src);
    }
  });

  // 비디오
  const videos = article.querySelectorAll('video');
  videos.forEach(video => {
    const src = video.getAttribute('src');
    if (src) mediaUrls.push(src);
  });

  return mediaUrls;
}

// 개별 트윗 데이터 파싱
function parseTweetElement(article, index) {
  try {
    const id = extractTweetId(article);
    if (!id) {
      console.warn('ThreadSaver: Could not extract tweet ID', article);
      return null;
    }

    const content = extractTweetContent(article);
    const authorUsername = extractAuthorUsername(article);
    const createdAt = extractCreatedAt(article);
    const stats = extractStats(article);
    const mediaUrls = extractMediaUrls(article);

    return {
      id,
      content,
      authorUsername,
      createdAt,
      sequenceNumber: index + 1,
      likeCount: stats.likeCount,
      retweetCount: stats.retweetCount,
      mediaUrls,
      replyToId: null // 트위터 DOM에서 직접 추출하기 어려움
    };
  } catch (error) {
    console.error('ThreadSaver: Error parsing tweet', error);
    return null;
  }
}

// 타래 전체 추출
async function extractThreadData() {
  if (!isTwitterPage() || !isThreadPage()) {
    return { error: 'Not a Twitter thread page' };
  }

  const tweetId = getTweetIdFromUrl();
  if (!tweetId) {
    return { error: 'Could not extract tweet ID from URL' };
  }

  console.log('ThreadSaver: Starting thread extraction...');

  // 모든 트윗 로드
  await loadAllTweets();

  // 트윗 요소들 찾기
  const tweetElements = findTweetElements();

  if (tweetElements.length === 0) {
    return { error: 'No tweets found on this page' };
  }

  // 각 트윗 파싱
  const tweets = [];
  for (let i = 0; i < tweetElements.length; i++) {
    const tweetData = parseTweetElement(tweetElements[i], i);
    if (tweetData) {
      tweets.push(tweetData);
    }
  }

  console.log(`ThreadSaver: Extracted ${tweets.length} tweets`);

  return {
    url: window.location.href,
    tweets
  };
}

// 백그라운드 스크립트로 데이터 전송
function sendToBackground(data) {
  chrome.runtime.sendMessage({
    action: 'THREAD_EXTRACTED',
    data
  });
}

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('ThreadSaver: Received message', message);

  if (message.action === 'EXTRACT_THREAD') {
    extractThreadData()
      .then(result => {
        console.log('ThreadSaver: Extraction complete', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('ThreadSaver: Extraction failed', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // 비동기 응답을 위해 true 반환
  }
});

console.log('ThreadSaver: Content script ready');
