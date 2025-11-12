/**
 * ThreadSaver - Popup Script
 * 팝업 UI 로직 및 증분 추출 처리
 */

// DOM 요소
const elements = {
  pageStatus: document.getElementById('pageStatus'),
  tweetCount: document.getElementById('tweetCount'),
  extractBtn: document.getElementById('extractBtn'),
  continueBtn: document.getElementById('continueBtn'),
  completeBtn: document.getElementById('completeBtn'),
  lastTweetSection: document.getElementById('lastTweetSection'),
  lastTweetPreview: document.getElementById('lastTweetPreview'),
  lastTweetLink: document.getElementById('lastTweetLink'),
  progressSection: document.getElementById('progressSection'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  messageSection: document.getElementById('messageSection'),
  messageText: document.getElementById('messageText'),
  serverUrl: document.getElementById('serverUrl'),
  botAvoidance: document.getElementById('botAvoidance'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn')
};

// 전역 상태
let accumulatedTweets = []; // 누적된 트윗 데이터
let threadUrl = null; // 타래 URL
let currentTab = null;

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('ThreadSaver Popup: Initializing...');

  await loadSettings();
  await loadSessionData(); // 세션 데이터 복원
  await checkCurrentTab();

  setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
  elements.extractBtn.addEventListener('click', handleInitialExtract);
  elements.continueBtn.addEventListener('click', handleContinueExtract);
  elements.completeBtn.addEventListener('click', handleComplete);
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
}

// 설정 로드
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['serverUrl', 'botAvoidance']);
    if (result.serverUrl) {
      elements.serverUrl.value = result.serverUrl;
    }
    // 봇 회피 모드는 기본값 true
    elements.botAvoidance.checked = result.botAvoidance !== undefined ? result.botAvoidance : true;
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// 세션 데이터 로드 (페이지 새로고침 대비)
async function loadSessionData() {
  try {
    const result = await chrome.storage.local.get(['accumulatedTweets', 'threadUrl']);

    if (result.accumulatedTweets && result.accumulatedTweets.length > 0) {
      accumulatedTweets = result.accumulatedTweets;
      threadUrl = result.threadUrl;

      // UI 업데이트
      updateUIAfterExtraction();
      console.log(`Restored session: ${accumulatedTweets.length} tweets`);
    }
  } catch (error) {
    console.error('Failed to load session data:', error);
  }
}

// 세션 데이터 저장
async function saveSessionData() {
  try {
    await chrome.storage.local.set({
      accumulatedTweets,
      threadUrl
    });
  } catch (error) {
    console.error('Failed to save session data:', error);
  }
}

// 세션 데이터 클리어
async function clearSessionData() {
  try {
    await chrome.storage.local.remove(['accumulatedTweets', 'threadUrl']);
    accumulatedTweets = [];
    threadUrl = null;
  } catch (error) {
    console.error('Failed to clear session data:', error);
  }
}

// 설정 저장
async function handleSaveSettings() {
  const serverUrl = elements.serverUrl.value.trim();
  const botAvoidance = elements.botAvoidance.checked;

  if (!serverUrl) {
    showMessage('서버 URL을 입력해주세요', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ serverUrl, botAvoidance });
    showMessage('설정이 저장되었습니다', 'success');
  } catch (error) {
    showMessage('설정 저장에 실패했습니다', 'error');
    console.error('Failed to save settings:', error);
  }
}

// 현재 탭 확인
async function checkCurrentTab() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    currentTab = tab;

    if (!tab) {
      updatePageStatus('탭을 찾을 수 없습니다', 'error');
      return;
    }

    const url = tab.url || '';

    // 트위터 페이지인지 확인
    if (url.includes('twitter.com') || url.includes('x.com')) {
      // 타래 페이지인지 확인
      if (url.includes('/status/')) {
        updatePageStatus('트위터 타래 페이지', 'success');
        elements.extractBtn.disabled = false;
      } else {
        updatePageStatus('트위터 (타래 아님)', 'info');
      }
    } else {
      updatePageStatus('트위터가 아님', 'error');
    }
  } catch (error) {
    console.error('Failed to check current tab:', error);
    updatePageStatus('오류 발생', 'error');
  }
}

// 페이지 상태 업데이트
function updatePageStatus(text, type) {
  elements.pageStatus.textContent = text;
  elements.pageStatus.className = `status-value ${type}`;
}

// 초기 추출 처리
async function handleInitialExtract() {
  if (!currentTab) {
    showMessage('현재 탭을 찾을 수 없습니다', 'error');
    return;
  }

  // 봇 회피 설정 로드
  const settings = await chrome.storage.sync.get(['botAvoidance']);
  const botAvoidance = settings.botAvoidance !== undefined ? settings.botAvoidance : true;

  const timeEstimate = botAvoidance ? '3-5분' : '1-2분';
  showProgress(`타래 데이터 추출 중... (${timeEstimate} 소요될 수 있습니다)`);
  elements.extractBtn.disabled = true;

  try {
    // 콘텐츠 스크립트에 메시지 전송
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'EXTRACT_THREAD',
      botAvoidance: botAvoidance
    });

    console.log('Extract response:', response);

    if (response.success && response.data && response.data.tweets) {
      // 초기 추출이므로 누적 데이터를 리셋하고 새로 시작
      accumulatedTweets = response.data.tweets;
      threadUrl = response.data.url;

      // 세션 저장
      await saveSessionData();

      // UI 업데이트
      updateUIAfterExtraction();

      hideProgress();
      showMessage(`${accumulatedTweets.length}개의 트윗을 추출했습니다. 더 추출하려면 다음 타래로 이동 후 "계속 추출하기"를 클릭하세요.`, 'success');
    } else {
      throw new Error(response.error || '트윗을 찾을 수 없습니다');
    }
  } catch (error) {
    console.error('Extraction failed:', error);
    hideProgress();
    showMessage(`추출 실패: ${error.message}`, 'error');
    elements.extractBtn.disabled = false;
  }
}

// 계속 추출 처리 (증분 추출)
async function handleContinueExtract() {
  if (!currentTab) {
    showMessage('현재 탭을 찾을 수 없습니다', 'error');
    return;
  }

  // 봇 회피 설정 로드
  const settings = await chrome.storage.sync.get(['botAvoidance']);
  const botAvoidance = settings.botAvoidance !== undefined ? settings.botAvoidance : true;

  showProgress('추가 트윗 추출 중...');
  elements.continueBtn.disabled = true;

  try {
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'EXTRACT_THREAD',
      botAvoidance: botAvoidance
    });

    console.log('Continue extract response:', response);

    if (response.success && response.data && response.data.tweets) {
      const newTweets = response.data.tweets;

      console.log(`📊 현재 누적: ${accumulatedTweets.length}개`);
      console.log(`📊 새로 추출: ${newTweets.length}개`);

      // 중복 제거: 기존 트윗 ID 목록
      const existingIds = new Set(accumulatedTweets.map(t => t.id));
      console.log(`📊 기존 ID 개수: ${existingIds.size}`);

      // 새로운 트윗만 필터링
      const uniqueNewTweets = newTweets.filter(t => !existingIds.has(t.id));
      console.log(`📊 중복 제거 후 새 트윗: ${uniqueNewTweets.length}개`);

      if (uniqueNewTweets.length > 0) {
        // 디버깅: 새 트윗 ID들 출력
        console.log('📊 새 트윗 IDs (first 5):', uniqueNewTweets.map(t => t.id).slice(0, 5));

        // 누적 데이터에 추가
        accumulatedTweets = [...accumulatedTweets, ...uniqueNewTweets];

        // 시간순 정렬 (오래된 순)
        accumulatedTweets.sort((a, b) => {
          const timeA = a.createdAtTimestamp || new Date(a.createdAt).getTime();
          const timeB = b.createdAtTimestamp || new Date(b.createdAt).getTime();
          return timeA - timeB;
        });

        console.log('✅ Sorted tweets by timestamp (oldest first)');

        // 세션 저장
        await saveSessionData();

        // UI 업데이트
        updateUIAfterExtraction();

        hideProgress();
        showMessage(`${uniqueNewTweets.length}개의 새 트윗을 추가했습니다. 총 ${accumulatedTweets.length}개 (시간순 정렬됨)`, 'success');
      } else {
        hideProgress();

        // 디버깅 정보 추가
        console.log('⚠️ 새 트윗이 없음');
        console.log('⚠️ 추출된 트윗 샘플:', newTweets.slice(0, 3).map(t => ({
          id: t.id,
          content: t.content.slice(0, 50) + '...',
          time: t.createdAt
        })));
        console.log('⚠️ 기존 트윗 샘플:', accumulatedTweets.slice(0, 3).map(t => ({
          id: t.id,
          content: t.content.slice(0, 50) + '...',
          time: t.createdAt
        })));

        showMessage(`새로운 트윗이 없습니다. 모든 트윗이 이미 추출되었을 수 있습니다. (현재 총 ${accumulatedTweets.length}개)`, 'info');
      }
    } else {
      throw new Error(response.error || '트윗을 찾을 수 없습니다');
    }
  } catch (error) {
    console.error('Continue extraction failed:', error);
    hideProgress();
    showMessage(`추출 실패: ${error.message}`, 'error');
  } finally {
    elements.continueBtn.disabled = false;
  }
}

// 추출 완료 및 저장
async function handleComplete() {
  console.log('🔵 handleComplete called');
  console.log('🔵 accumulatedTweets.length:', accumulatedTweets.length);
  console.log('🔵 accumulatedTweets:', accumulatedTweets);

  if (accumulatedTweets.length === 0) {
    console.log('🔴 No tweets - returning');
    showMessage('추출된 트윗이 없습니다', 'error');
    return;
  }

  const serverUrl = elements.serverUrl.value.trim();
  console.log('🔵 Server URL:', serverUrl);

  if (!serverUrl) {
    console.log('🔴 No server URL - returning');
    showMessage('서버 URL을 설정해주세요', 'error');
    return;
  }

  showProgress('서버에 저장 중...');
  elements.completeBtn.disabled = true;

  try {
    const apiUrl = `${serverUrl}/api/scrape/extension`;

    const payload = {
      url: threadUrl,
      tweets: accumulatedTweets
    };

    console.log('Sending to server:', apiUrl);
    console.log('Total tweets:', accumulatedTweets.length);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Server response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `서버 오류 (${response.status})`);
    }

    const result = await response.json();
    console.log('Server response:', result);

    // 성공 메시지 먼저 (초기화 전에!)
    const savedCount = accumulatedTweets.length;
    hideProgress();
    showMessage(`${savedCount}개의 트윗이 성공적으로 저장되었습니다! 🎉`, 'success');

    // 세션 데이터 클리어
    await clearSessionData();

    // UI 초기화
    accumulatedTweets = [];
    threadUrl = null;
    updateUIAfterSave();

  } catch (error) {
    console.error('Save failed:', error);
    hideProgress();
    showMessage(`저장 실패: ${error.message}`, 'error');
    elements.completeBtn.disabled = false;
  }
}

// 추출 후 UI 업데이트
function updateUIAfterExtraction() {
  // 트윗 개수 업데이트
  elements.tweetCount.textContent = `${accumulatedTweets.length}개`;

  // 마지막 트윗 미리보기 및 링크
  if (accumulatedTweets.length > 0) {
    const lastTweet = accumulatedTweets[accumulatedTweets.length - 1];
    const preview = lastTweet.content.slice(0, 150) + (lastTweet.content.length > 150 ? '...' : '');

    elements.lastTweetPreview.textContent = preview;

    // 마지막 트윗 링크 생성
    const tweetUrl = `https://x.com/${lastTweet.authorUsername}/status/${lastTweet.id}`;
    elements.lastTweetLink.href = tweetUrl;

    elements.lastTweetSection.style.display = 'block';

    console.log(`🔗 Last tweet link: ${tweetUrl}`);
  }

  // 버튼 상태 업데이트
  elements.extractBtn.style.display = 'none';
  elements.continueBtn.style.display = 'block';
  elements.completeBtn.style.display = 'block';

  elements.continueBtn.disabled = false;
  elements.completeBtn.disabled = false;
}

// 저장 후 UI 업데이트 (초기화)
function updateUIAfterSave() {
  elements.tweetCount.textContent = '-';
  elements.lastTweetSection.style.display = 'none';

  elements.extractBtn.style.display = 'block';
  elements.continueBtn.style.display = 'none';
  elements.completeBtn.style.display = 'none';

  elements.extractBtn.disabled = false;
}

// 진행 상태 표시
function showProgress(text) {
  elements.progressSection.style.display = 'block';
  elements.progressText.textContent = text;
  elements.progressFill.style.width = '100%';
  elements.messageSection.style.display = 'none';
}

// 진행 상태 숨김
function hideProgress() {
  elements.progressSection.style.display = 'none';
  elements.progressFill.style.width = '0%';
}

// 메시지 표시
function showMessage(text, type) {
  elements.messageSection.style.display = 'block';
  elements.messageSection.className = `message-section ${type}`;
  elements.messageText.textContent = text;

  // 성공/정보 메시지는 8초 후 자동으로 숨김
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      elements.messageSection.style.display = 'none';
    }, 8000);
  }
}

console.log('ThreadSaver Popup: Script loaded');
