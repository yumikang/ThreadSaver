/**
 * ThreadSaver - Background Service Worker
 * 백그라운드 처리 및 메시지 중계
 */

console.log('ThreadSaver: Background service worker loaded');

// 익스텐션 설치 시
chrome.runtime.onInstalled.addListener((details) => {
  console.log('ThreadSaver: Extension installed', details);

  if (details.reason === 'install') {
    // 기본 설정 저장
    chrome.storage.sync.set({
      serverUrl: 'http://localhost:4000'
    });

    console.log('ThreadSaver: Default settings saved');
  }
});

// 메시지 리스너
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('ThreadSaver: Background received message', message);

  if (message.action === 'THREAD_EXTRACTED') {
    handleThreadExtracted(message.data, sender);
  }

  // 비동기 처리를 위해 true 반환
  return true;
});

// 타래 추출 완료 처리
function handleThreadExtracted(data, sender) {
  console.log('ThreadSaver: Thread extracted', data);

  // 여기서 추가적인 처리를 할 수 있습니다
  // 예: 로컬 스토리지에 임시 저장, 통계 수집 등

  // 알림 표시 (옵션)
  if (data.tweets && data.tweets.length > 0) {
    showNotification(
      'ThreadSaver',
      `${data.tweets.length}개의 트윗이 추출되었습니다`
    );
  }
}

// 알림 표시
function showNotification(title, message) {
  // 알림 권한이 있을 때만 표시
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icons/icon48.png',
    title: title,
    message: message
  }).catch(error => {
    console.log('ThreadSaver: Notification not available', error);
  });
}

// 아이콘 클릭 처리 (옵션)
chrome.action.onClicked.addListener((tab) => {
  console.log('ThreadSaver: Extension icon clicked', tab);
});

// 탭 업데이트 감지 (옵션)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // 페이지가 완전히 로드되었고 트위터 타래 페이지인 경우
  if (changeInfo.status === 'complete' && tab.url) {
    const url = tab.url;
    if ((url.includes('twitter.com') || url.includes('x.com')) && url.includes('/status/')) {
      console.log('ThreadSaver: Twitter thread page detected', url);

      // 배지에 표시 (옵션)
      chrome.action.setBadgeText({
        tabId: tabId,
        text: '🧵'
      }).catch(err => console.log('Badge not supported'));
    }
  }
});

console.log('ThreadSaver: Background service worker ready');
