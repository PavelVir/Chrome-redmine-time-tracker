// Elements
const timerDisplay = document.getElementById('timerDisplay');
const playButton = document.getElementById('playButton');
const pauseButton = document.getElementById('pauseButton');
const resetButton = document.getElementById('resetButton');
const settingsButton = document.getElementById('settingsButton');
const statusText = document.getElementById('statusText');
const currentActiveTimer = document.getElementById('currentActiveTimer');
const noActiveTimer = document.getElementById('noActiveTimer');
const recentTasksList = document.getElementById('recentTasksList');

// Variables
let isRunning = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;
let activeTabId = null;

// Initialize
document.addEventListener('DOMContentLoaded', initialize);

// Event listeners
playButton.addEventListener('click', startTimer);
pauseButton.addEventListener('click', pauseTimer);
resetButton.addEventListener('click', resetTimer);
settingsButton.addEventListener('click', openSettings);

function initialize() {
  // Загружаем недавние задачи в любом случае
  loadRecentTasks();
  
  // Получаем текущую активную вкладку
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || tabs.length === 0) {
      // Не нашли активную вкладку
      currentActiveTimer.style.display = 'none';
      noActiveTimer.style.display = 'block';
      noActiveTimer.innerHTML = 'Unable to detect active tab.<br>Open a Redmine page to use the timer.';
      return;
    }
    
    activeTabId = tabs[0].id;
    
    // Проверяем, является ли это страницей Redmine
    const url = tabs[0].url;
    const isRedminePage = url && (url.includes('/time_entries') || url.includes('/issues/'));
    
    if (isRedminePage) {
      // Загружаем состояние
      loadState();
      // Показываем интерфейс таймера
      currentActiveTimer.style.display = 'block';
      noActiveTimer.style.display = 'none';
    } else {
      // Показываем сообщение об отсутствии таймера
      currentActiveTimer.style.display = 'none';
      noActiveTimer.style.display = 'block';
    }
  });
}

function loadState() {
  try {
    chrome.storage.local.get('timerState', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading state:', chrome.runtime.lastError);
        statusText.textContent = 'Error loading timer state';
        return;
      }
      
      if (result.timerState) {
        const { isRunning: running, startTime: start, elapsedTime: elapsed } = result.timerState;
        
        isRunning = running;
        startTime = start;
        elapsedTime = elapsed;
        
        updateButtonState();
        updateStatusText();
        
        if (isRunning) {
          startTimerInterval();
        } else {
          updateDisplay();
        }
      }
    });
  } catch (error) {
    console.error('Error in loadState:', error);
    statusText.textContent = 'Error loading timer state';
  }
}

function updateButtonState() {
  if (isRunning) {
    playButton.style.display = 'none';
    pauseButton.style.display = 'inline-block';
  } else {
    playButton.style.display = 'inline-block';
    pauseButton.style.display = 'none';
  }
}

function updateStatusText() {
  if (isRunning) {
    statusText.textContent = 'Tracking time...';
  } else if (elapsedTime > 0) {
    statusText.textContent = 'Paused';
  } else {
    statusText.textContent = 'Not tracking time';
  }
}

function startTimerInterval() {
  timerInterval = setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateDisplay();
  }, 1000);
}

function updateDisplay() {
  const hours = Math.floor(elapsedTime / 3600000);
  const minutes = Math.floor((elapsedTime % 3600000) / 60000);
  const seconds = Math.floor((elapsedTime % 60000) / 1000);
  
  timerDisplay.textContent = 
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startTimer() {
  isRunning = true;
  startTime = Date.now() - elapsedTime;
  
  updateButtonState();
  updateStatusText();
  startTimerInterval();
  
  // Send message to content script
  sendMessageToContentScript('startTimer');
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  
  updateButtonState();
  updateStatusText();
  
  // Send message to content script
  sendMessageToContentScript('pauseTimer');
}

function resetTimer() {
  isRunning = false;
  elapsedTime = 0;
  startTime = 0;
  
  clearInterval(timerInterval);
  updateDisplay();
  updateButtonState();
  updateStatusText();
  
  // Send message to content script
  sendMessageToContentScript('resetTimer');
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}

function sendMessageToContentScript(action) {
  if (!activeTabId) {
    console.error('No active tab ID found');
    statusText.textContent = 'Error: No active Redmine tab';
    return;
  }
  
  chrome.tabs.sendMessage(activeTabId, { action }, (response) => {
    // Handle response if needed
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError);
      statusText.textContent = 'Error: Cannot communicate with Redmine page';
    }
  });
}

function loadRecentTasks() {
  try {
    chrome.storage.local.get('recentTasks', (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading recent tasks:', chrome.runtime.lastError);
        recentTasksList.innerHTML = '<div class="info-message">Error loading recent tasks</div>';
        return;
      }
      
      const recentTasks = result.recentTasks || [];
      
      if (recentTasks.length === 0) {
        recentTasksList.innerHTML = '<div class="info-message">No recent tasks</div>';
        return;
      }
      
      recentTasksList.innerHTML = '';
      
      recentTasks.forEach((task) => {
        try {
          const taskItem = document.createElement('div');
          taskItem.className = 'task-item';
          taskItem.dataset.issueId = task.issueId;
          taskItem.dataset.url = task.url;
          
          const timeSpan = document.createElement('span');
          timeSpan.className = 'time';
          timeSpan.textContent = formatHours(task.hours);
          
          const titleText = document.createTextNode(task.title || `Task #${task.issueId}`);
          taskItem.appendChild(titleText);
          taskItem.appendChild(timeSpan);
          
          taskItem.addEventListener('click', () => {
            try {
              chrome.tabs.create({ url: task.url });
            } catch (e) {
              console.error('Error creating tab:', e);
            }
          });
          
          recentTasksList.appendChild(taskItem);
        } catch (e) {
          console.error('Error rendering task item:', e);
        }
      });
    });
  } catch (error) {
    console.error('Error in loadRecentTasks:', error);
    recentTasksList.innerHTML = '<div class="info-message">Error loading recent tasks</div>';
  }
}

function formatHours(hours) {
  return `${hours.toFixed(2)}h`;
}