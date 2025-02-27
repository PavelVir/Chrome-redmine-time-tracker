// Обработка сообщений от content.js и popup.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Обработка уведомлений
  if (message.action === 'showNotification') {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: message.icon || 'icons/icon128.svg',
      title: message.title,
      message: message.message
    });
    sendResponse({ success: true });
    return true;
  }
  
  // Обработка состояния таймера
  if (message.action === 'saveState') {
    chrome.storage.local.set({ timerState: message.state }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'loadState') {
    chrome.storage.local.get('timerState', (result) => {
      sendResponse({ state: result.timerState || null });
    });
    return true;
  }
  
  // Сохранение недавней задачи
  if (message.action === 'saveTask') {
    saveRecentTask(message.task, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  // Получение статистики отслеживания времени
  if (message.action === 'getTimeStats') {
    getTimeTrackingStats((stats) => {
      sendResponse({ stats });
    });
    return true;
  }
});

// Обработка нажатия на уведомление
chrome.notifications.onClicked.addListener((notificationId) => {
  // Можно добавить логику для перехода на таб с Redmine
  chrome.notifications.clear(notificationId);
});

// Функция сохранения недавних задач
function saveRecentTask(task, callback) {
  chrome.storage.local.get('recentTasks', (result) => {
    let recentTasks = result.recentTasks || [];
    
    // Проверяем, существует ли уже такая задача
    const existingIndex = recentTasks.findIndex(t => t.issueId === task.issueId);
    
    if (existingIndex !== -1) {
      // Обновляем существующую задачу
      recentTasks[existingIndex] = {
        ...recentTasks[existingIndex],
        hours: task.hours, 
        lastUpdated: Date.now()
      };
    } else {
      // Добавляем новую задачу
      recentTasks.unshift({
        ...task,
        lastUpdated: Date.now()
      });
      
      // Ограничиваем количество недавних задач (максимум 10)
      if (recentTasks.length > 10) {
        recentTasks = recentTasks.slice(0, 10);
      }
    }
    
    // Сортируем по дате обновления (сначала самые новые)
    recentTasks.sort((a, b) => b.lastUpdated - a.lastUpdated);
    
    // Сохраняем в хранилище
    chrome.storage.local.set({ recentTasks }, callback);
  });
}

// Функция получения статистики отслеживания времени
function getTimeTrackingStats(callback) {
  chrome.storage.local.get(['timerState', 'recentTasks'], (result) => {
    const stats = {
      currentSession: result.timerState ? (result.timerState.elapsedTime / 3600000).toFixed(2) : 0,
      todayTotal: 0,
      weekTotal: 0,
      recentTasksCount: result.recentTasks ? result.recentTasks.length : 0
    };
    
    // Если есть недавние задачи, вычисляем общее время
    if (result.recentTasks && result.recentTasks.length > 0) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const oneWeekAgo = today - (7 * 24 * 60 * 60 * 1000);
      
      result.recentTasks.forEach(task => {
        if (task.lastUpdated >= today) {
          stats.todayTotal += task.hours;
        }
        if (task.lastUpdated >= oneWeekAgo) {
          stats.weekTotal += task.hours;
        }
      });
    }
    
    callback(stats);
  });
}