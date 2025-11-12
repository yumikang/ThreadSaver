/**
 * ThreadSaver - Twitter Content Script
 * 트위터 타래 데이터를 추출하는 콘텐츠 스크립트
 */

// 즉시 로드 확인 (최우선)
console.log('🧵 ThreadSaver: Content script INITIALIZING...');
console.log('🧵 ThreadSaver: Current URL:', window.location.href);
console.log('🧵 ThreadSaver: Hostname:', window.location.hostname);

// 완전히 로드되었음을 알림
window.addEventListener('load', () => {
  console.log('🧵 ThreadSaver: Page fully loaded, content script ready');
});

console.log('🧵 ThreadSaver: Content script loaded and listeners registered');

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

// 스마트 스크롤 - Listly 스타일
async function loadAllTweets() {
  const maxScrolls = 200; // 최대 시도 횟수
  let previousTweetCount = 0;
  let noChangeCount = 0; // 연속으로 변화 없는 횟수
  let scrollCount = 0;
  let totalButtonClicks = 0;

  console.log('🔄 ThreadSaver: Starting smart scroll (Listly-style)...');
  console.log('⏱️ This may take 2-5 minutes for very long threads');

  while (scrollCount < maxScrolls) {
    // 현재 트윗 개수
    const currentTweetCount = document.querySelectorAll('article[data-testid="tweet"]').length;

    console.log(`📊 Scroll #${scrollCount + 1}: ${currentTweetCount} tweets (stable: ${noChangeCount})`);

    // 1. "더 보기" 버튼 찾아서 클릭
    const buttonsClicked = clickShowMoreButtons();
    if (buttonsClicked > 0) {
      totalButtonClicks += buttonsClicked;
      console.log(`🔘 Clicked ${buttonsClicked} buttons (total: ${totalButtonClicks})`);

      // 버튼 클릭 후 컨텐츠 로드 대기
      await wait(2000); // 2초 대기 (네트워크 요청 시간)
      noChangeCount = 0; // 버튼 클릭했으면 리셋
      continue; // 다시 확인
    }

    // 2. 트윗 개수 변화 확인
    if (currentTweetCount > previousTweetCount) {
      const newTweets = currentTweetCount - previousTweetCount;
      console.log(`✅ +${newTweets} new tweets loaded!`);
      previousTweetCount = currentTweetCount;
      noChangeCount = 0;
    } else {
      noChangeCount++;
      console.log(`⏳ No change (${noChangeCount}/8)`);
    }

    // 3. 종료 조건: 8번 연속 변화 없음
    if (noChangeCount >= 8) {
      console.log('🛑 No new tweets after 8 attempts, stopping');
      break;
    }

    // 4. 다양한 스크롤 전략
    // 전략 A: 페이지 끝까지
    window.scrollTo(0, document.documentElement.scrollHeight);
    await wait(500);

    // 전략 B: 조금씩 스크롤 (트위터가 감지하도록)
    window.scrollBy(0, 1000);
    await wait(500);

    // 전략 C: documentElement.scrollTop 직접 설정
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    await wait(500);

    // 5. 네트워크 대기 (트위터 API 응답 시간)
    await wait(2000); // 총 3.5초 대기

    scrollCount++;

    // 6. 진행 상황 로그 (매 10회)
    if (scrollCount % 10 === 0) {
      console.log(`🔄 Progress: ${scrollCount} scrolls, ${currentTweetCount} tweets, ${totalButtonClicks} buttons clicked`);
    }
  }

  console.log(`\n🎯 Scroll phase complete!`);
  console.log(`📊 Stats: ${scrollCount} scrolls, ${totalButtonClicks} buttons clicked`);

  // 최종 정리
  console.log('🔍 Final cleanup: checking for remaining buttons...');

  // 마지막으로 한 번 더 버튼 클릭 시도
  const finalButtons = clickShowMoreButtons();
  if (finalButtons > 0) {
    console.log(`🔘 Found ${finalButtons} more buttons, waiting for load...`);
    await wait(3000);
  }

  // 맨 위로 스크롤 (DOM 안정화)
  console.log('⬆️ Scrolling to top...');
  window.scrollTo(0, 0);
  await wait(1000);

  const finalCount = document.querySelectorAll('article[data-testid="tweet"]').length;
  console.log(`\n✅ COMPLETE: ${finalCount} tweets loaded after ${scrollCount} scrolls`);
  console.log(`🔘 Total buttons clicked: ${totalButtonClicks}\n`);
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
      createdAtTimestamp: new Date(createdAt).getTime(), // 타임스탬프 추가
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

// 타래 전체 추출 - 증분 추출 방식
async function extractThreadData() {
  if (!isTwitterPage() || !isThreadPage()) {
    return { error: 'Not a Twitter thread page' };
  }

  const tweetId = getTweetIdFromUrl();
  if (!tweetId) {
    return { error: 'Could not extract tweet ID from URL' };
  }

  console.log('🧵 ThreadSaver: ===== Starting thread extraction =====');
  console.log('🧵 ThreadSaver: Current URL:', window.location.href);
  console.log('🧵 ThreadSaver: Tweet ID:', tweetId);

  // 누적 트윗 저장
  const allTweets = new Map(); // ID를 키로 사용하여 중복 방지

  console.log('🧵 ThreadSaver: Starting incremental extraction with scroll...');

  const maxScrolls = 100;
  let scrollCount = 0;
  let noChangeCount = 0;
  let previousTweetCount = 0;

  while (scrollCount < maxScrolls) {
    // 현재 보이는 트윗들 추출
    const currentElements = document.querySelectorAll('article[data-testid="tweet"]');
    console.log(`📊 Scroll #${scrollCount + 1}: ${currentElements.length} visible tweets`);

    // 현재 보이는 트윗들을 바로 저장
    for (let i = 0; i < currentElements.length; i++) {
      const tweetData = parseTweetElement(currentElements[i], i);
      if (tweetData && tweetData.id) {
        if (!allTweets.has(tweetData.id)) {
          allTweets.set(tweetData.id, tweetData);
          console.log(`✅ Saved new tweet: ${tweetData.id}`);
        }
      }
    }

    const currentTotalCount = allTweets.size;
    console.log(`📦 Total unique tweets collected: ${currentTotalCount}`);

    // "더 보기" 버튼 클릭
    const buttonsClicked = clickShowMoreButtons();
    if (buttonsClicked > 0) {
      console.log(`🔘 Clicked ${buttonsClicked} buttons`);
      await wait(2000);
      noChangeCount = 0;
      continue;
    }

    // 변화 확인
    if (currentTotalCount > previousTweetCount) {
      console.log(`✨ Progress: +${currentTotalCount - previousTweetCount} new tweets`);
      previousTweetCount = currentTotalCount;
      noChangeCount = 0;
    } else {
      noChangeCount++;
      console.log(`⏳ No new tweets (${noChangeCount}/8)`);
    }

    // 종료 조건
    if (noChangeCount >= 8) {
      console.log('🛑 No new tweets after 8 attempts, stopping');
      break;
    }

    // 스크롤
    window.scrollTo(0, document.documentElement.scrollHeight);
    await wait(500);
    window.scrollBy(0, 1000);
    await wait(500);
    document.documentElement.scrollTop = document.documentElement.scrollHeight;
    await wait(2000);

    scrollCount++;
  }

  console.log(`\n🎯 Extraction complete!`);
  console.log(`📊 Total scrolls: ${scrollCount}`);
  console.log(`📦 Total unique tweets: ${allTweets.size}`);

  // Map을 Array로 변환
  const tweets = Array.from(allTweets.values());

  // 시간순 정렬
  tweets.sort((a, b) => {
    const timeA = a.createdAtTimestamp || new Date(a.createdAt).getTime();
    const timeB = b.createdAtTimestamp || new Date(b.createdAt).getTime();
    return timeA - timeB;
  });

  // sequenceNumber 재할당
  tweets.forEach((tweet, index) => {
    tweet.sequenceNumber = index + 1;
  });

  console.log(`✅ Final: ${tweets.length} tweets (sorted by time)\n`);

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

// 메시지 리스너 - 강화된 에러 핸들링
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🧵 ThreadSaver: Received message from popup:', message);

  if (message.action === 'EXTRACT_THREAD') {
    console.log('🧵 ThreadSaver: Starting thread extraction...');

    extractThreadData()
      .then(result => {
        console.log('🧵 ThreadSaver: ✅ Extraction complete!', result);
        sendResponse({ success: true, data: result });
      })
      .catch(error => {
        console.error('🧵 ThreadSaver: ❌ Extraction failed:', error);
        sendResponse({ success: false, error: error.message });
      });

    return true; // 비동기 응답을 위해 true 반환 (중요!)
  } else {
    console.warn('🧵 ThreadSaver: Unknown action received:', message.action);
    sendResponse({ success: false, error: 'Unknown action' });
  }
});

console.log('🧵 ThreadSaver: ✅ Content script fully ready and waiting for messages!');
