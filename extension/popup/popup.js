/**
 * ThreadSaver - Popup Script
 * 팝업 UI 로직 및 사용자 인터랙션 처리
 */

// DOM 요소
const elements = {
  pageStatus: document.getElementById('pageStatus'),
  tweetCount: document.getElementById('tweetCount'),
  extractBtn: document.getElementById('extractBtn'),
  saveBtn: document.getElementById('saveBtn'),
  progressSection: document.getElementById('progressSection'),
  progressFill: document.getElementById('progressFill'),
  progressText: document.getElementById('progressText'),
  messageSection: document.getElementById('messageSection'),
  messageText: document.getElementById('messageText'),
  serverUrl: document.getElementById('serverUrl'),
  saveSettingsBtn: document.getElementById('saveSettingsBtn')
};

// 전역 상태
let currentThreadData = null;
let currentTab = null;

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  console.log('ThreadSaver Popup: Initializing...');

  await loadSettings();
  await checkCurrentTab();

  setupEventListeners();
});

// 이벤트 리스너 설정
function setupEventListeners() {
  elements.extractBtn.addEventListener('click', handleExtract);
  elements.saveBtn.addEventListener('click', handleSave);
  elements.saveSettingsBtn.addEventListener('click', handleSaveSettings);
}

// 설정 로드
async function loadSettings() {
  try {
    const result = await chrome.storage.sync.get(['serverUrl']);
    if (result.serverUrl) {
      elements.serverUrl.value = result.serverUrl;
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
}

// 설정 저장
async function handleSaveSettings() {
  const serverUrl = elements.serverUrl.value.trim();

  if (!serverUrl) {
    showMessage('서버 URL을 입력해주세요', 'error');
    return;
  }

  try {
    await chrome.storage.sync.set({ serverUrl });
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

// 타래 추출 처리
async function handleExtract() {
  if (!currentTab) {
    showMessage('현재 탭을 찾을 수 없습니다', 'error');
    return;
  }

  showProgress('타래 데이터 추출 중...');
  elements.extractBtn.disabled = true;

  try {
    // 콘텐츠 스크립트에 메시지 전송
    const response = await chrome.tabs.sendMessage(currentTab.id, {
      action: 'EXTRACT_THREAD'
    });

    console.log('Extract response:', response);

    if (response.success && response.data && response.data.tweets) {
      currentThreadData = response.data;
      const tweetCount = response.data.tweets.length;

      elements.tweetCount.textContent = `${tweetCount}개`;
      elements.saveBtn.disabled = false;

      hideProgress();
      showMessage(`${tweetCount}개의 트윗을 추출했습니다`, 'success');
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

// 서버에 저장 처리
async function handleSave() {
  if (!currentThreadData) {
    showMessage('먼저 타래를 추출해주세요', 'error');
    return;
  }

  const serverUrl = elements.serverUrl.value.trim();
  if (!serverUrl) {
    showMessage('서버 URL을 설정해주세요', 'error');
    return;
  }

  showProgress('서버에 저장 중...');
  elements.saveBtn.disabled = true;

  try {
    const apiUrl = `${serverUrl}/api/scrape/extension`;

    console.log('Sending to server:', apiUrl);
    console.log('Data:', currentThreadData);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(currentThreadData)
    });

    console.log('Server response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `서버 오류 (${response.status})`);
    }

    const result = await response.json();
    console.log('Server response:', result);

    hideProgress();
    showMessage('타래가 성공적으로 저장되었습니다! 🎉', 'success');

    // 저장 후 버튼 비활성화
    elements.saveBtn.disabled = true;

    // 3초 후 자동으로 팝업 닫기
    setTimeout(() => {
      window.close();
    }, 3000);

  } catch (error) {
    console.error('Save failed:', error);
    hideProgress();
    showMessage(`저장 실패: ${error.message}`, 'error');
    elements.saveBtn.disabled = false;
  }
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

  // 성공 메시지는 5초 후 자동으로 숨김
  if (type === 'success') {
    setTimeout(() => {
      elements.messageSection.style.display = 'none';
    }, 5000);
  }
}

// 메시지 숨김
function hideMessage() {
  elements.messageSection.style.display = 'none';
}

console.log('ThreadSaver Popup: Script loaded');
