class RedmineTimer {
  constructor() {
    this.isRunning = false;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.timeInput = document.querySelector('#time_entry_hours');
    if (!this.timeInput) {
      return;
    }
    this.setup();
  }

  setup() {
    this.createControls();
    this.loadState();
    this.setupEventListeners();
    this.requestNotificationPermission();
    this.setupMessageListener();
  }

  createControls() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'timer-controls';

    // Timer display
    this.timerDisplay = document.createElement('span');
    this.timerDisplay.className = 'timer-display';
    this.timerDisplay.textContent = '00:00:00';

    // Buttons
    this.playButton = this.createButton('Play', 'play-button');
    this.pauseButton = this.createButton('Pause', 'pause-button');
    this.resetButton = this.createButton('Reset', 'reset-button');
    this.pauseButton.style.display = 'none';

    // Add everything to container
    this.container.append(
      this.timerDisplay,
      this.playButton,
      this.pauseButton,
      this.resetButton
    );

    // Add container after the time input field
    this.timeInput.parentNode.appendChild(this.container);
  }

  createButton(text, className) {
    const button = document.createElement('button');
    button.type = 'button'; // Prevent form submission
    button.textContent = text;
    button.className = `timer-button ${className}`;
    return button;
  }

  setupEventListeners() {
    this.playButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.startTimer();
    });

    this.pauseButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.pauseTimer();
    });

    this.resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.resetTimer();
    });

    this.timeInput.addEventListener('change', (e) => {
      const hours = parseFloat(e.target.value.replace(',', '.'));
      if (!isNaN(hours) && hours >= 0) {
        this.setTime(hours);
      }
    });
    
    // Listen for form submission to save task info
    const form = this.timeInput.closest('form');
    if (form) {
      form.addEventListener('submit', () => this.saveTaskInfo());
    }
  }
  
  // Setup listener for messages from popup
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const response = this.handleMessage(message);
      if (response) {
        sendResponse(response);
      }
    });
  }
  
  // Handle messages from popup
  handleMessage(message) {
    if (message.action === 'startTimer') {
      this.startTimer();
      return true;
    }
    
    if (message.action === 'pauseTimer') {
      this.pauseTimer();
      return true;
    }
    
    if (message.action === 'resetTimer') {
      this.resetTimer();
      return true;
    }
    
    if (message.action === 'setTime') {
      this.setTime(message.hours);
      return true;
    }
    
    if (message.action === 'getState') {
      return {
        isRunning: this.isRunning,
        elapsedTime: this.elapsedTime,
        startTime: this.startTime
      };
    }
    
    return false;
  }
  
  // Save task information when submitting form
  saveTaskInfo() {
    try {
      // Get issue ID and title
      const issueIdMatch = window.location.href.match(/issues\/(\d+)/);
      let issueId = issueIdMatch ? issueIdMatch[1] : null;
      
      if (!issueId) {
        // Try to find on the page
        const issueField = document.querySelector('#time_entry_issue_id');
        if (issueField) {
          issueId = issueField.value;
        }
      }
      
      // If no ID found, exit
      if (!issueId) return;
      
      // Get issue title
      let title = null;
      const issueTitle = document.querySelector('.subject h3');
      if (issueTitle) {
        title = issueTitle.textContent.trim();
      } else {
        // Try another selector
        const selectField = document.querySelector('#time_entry_issue_id option:checked');
        if (selectField) {
          title = selectField.textContent.trim();
        }
      }
      
      // If no title found, use a fallback
      title = title || `Task #${issueId}`;
      
      // Get spent time
      const hours = parseFloat(this.timeInput.value.replace(',', '.'));
      
      // Save task info
      if (!isNaN(hours) && hours > 0) {
        chrome.runtime.sendMessage({
          action: 'saveTask',
          task: {
            issueId,
            title,
            hours,
            url: window.location.href
          }
        });
      }
    } catch (e) {
      console.info('Error saving task info:', e);
    }
  }

  // Request notification permission
  requestNotificationPermission() {
    if (Notification && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }

  // Show notification
  showNotification(title, message) {
    // Try using background script
    if (chrome && chrome.runtime && chrome.runtime.id) {
      try {
        chrome.runtime.sendMessage({
          action: 'showNotification',
          title: title,
          message: message,
          icon: 'icons/icon128.svg'
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.info('Background notification failed:', chrome.runtime.lastError);
            this.fallbackNotification(title, message);
          }
        });
        return;
      } catch (e) {
        console.info('Failed to send message to background:', e);
      }
    }
    
    this.fallbackNotification(title, message);
  }
  
  // Fallback notification methods
  fallbackNotification(title, message) {
    // Try standard Notification API
    if (Notification && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: 'icons/icon128.svg'
        });
        return;
      } catch (e) {
        console.info('Standard Notification API failed:', e);
      }
    }
    
    // If all else fails, use alert as a last resort
    console.info('Using alert as a fallback notification');
    alert(`${title}: ${message}`);
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime;
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
      this.saveState();

      // Set reminder based on settings
      this.setupReminderTimeout();
    }
  }
  
  // Set up reminder timeout based on settings
  setupReminderTimeout() {
    try {
      // Get settings
      chrome.storage.local.get('settings', (result) => {
        const settings = result.settings || { reminderInterval: 60, enableReminders: true };
        
        // If reminders are disabled, exit
        if (!settings.enableReminders) return;
        
        // Set timer with specified interval
        const reminderTime = settings.reminderInterval * 60 * 1000; // Convert minutes to milliseconds
        
        this.reminderTimeout = setTimeout(() => {
          this.showNotification(
            'Time Tracking Reminder', 
            `You have been working for ${settings.reminderInterval} minutes continuously. Consider taking a break.`
          );
          
          // Set up next reminder
          this.setupReminderTimeout();
        }, reminderTime);
      });
    } catch (e) {
      console.info('Failed to set reminder timeout:', e);
    }
  }

  pauseTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timerInterval);
      this.playButton.style.display = 'inline-block';
      this.pauseButton.style.display = 'none';
      this.saveState();
      
      // Clear reminder timer
      if (this.reminderTimeout) {
        clearTimeout(this.reminderTimeout);
        this.reminderTimeout = null;
      }
    }
  }

  resetTimer() {
    this.pauseTimer();
    this.elapsedTime = 0;
    this.startTime = 0;
    this.updateDisplay();
    this.timeInput.value = '0';
    this.saveState();
  }

  setTime(hours) {
    this.elapsedTime = Math.floor(hours * 3600000);
    this.timeInput.value = hours.toString();
    this.updateDisplay();
    if (this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
    }
    this.saveState();
  }

  updateTimer() {
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay();
    // Updating Redmine input happens in updateDisplay()
  }

  updateDisplay() {
    const hours = Math.floor(this.elapsedTime / 3600000);
    const minutes = Math.floor((this.elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);

    this.timerDisplay.textContent = 
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update Redmine input field based on time format
    this.updateRedmineInput();
  }

  // Update Redmine input based on format
  updateRedmineInput() {
    chrome.storage.local.get('settings', (result) => {
      const settings = result.settings || { timeFormat: 'decimal' };
      const hours = this.elapsedTime / 3600000;
      
      if (settings.timeFormat === 'decimal') {
        // Decimal format
        this.timeInput.value = hours.toFixed(2);
      } else {
        // HH:MM format
        const wholeHours = Math.floor(hours);
        const minutes = Math.floor((hours - wholeHours) * 60);
        this.timeInput.value = `${wholeHours}:${String(minutes).padStart(2, '0')}`;
      }
    });
  }

  async saveState() {
    try {
      if (!chrome.runtime || !chrome.runtime.id) {
        console.info('Extension context is invalid, using localStorage instead');
        // Fallback to localStorage
        localStorage.setItem('redmineTimerState', JSON.stringify({
          isRunning: this.isRunning,
          startTime: this.startTime,
          elapsedTime: this.elapsedTime
        }));
        return;
      }
      
      const state = {
        isRunning: this.isRunning,
        startTime: this.startTime,
        elapsedTime: this.elapsedTime
      };
      await chrome.storage.local.set({ timerState: state });
    } catch (error) {
      console.info('Error saving state:', error);
      // Fallback to localStorage
      try {
        localStorage.setItem('redmineTimerState', JSON.stringify({
          isRunning: this.isRunning,
          startTime: this.startTime,
          elapsedTime: this.elapsedTime
        }));
      } catch (e) {
        console.info('Fallback storage also failed:', e);
      }
    }
  }

  async loadState() {
    try {
      // Check if we're editing an existing entry
      const isEditMode = window.location.href.includes('/edit');
      
      if (isEditMode && this.timeInput.value) {
        // Use the existing value
        const hours = parseFloat(this.timeInput.value.replace(',', '.'));
        if (!isNaN(hours)) {
          this.setTime(hours);
        }
      } else {
        // Try to load saved state
        let state = null;
        
        // First try chrome.storage if extension context is valid
        if (chrome.runtime && chrome.runtime.id) {
          try {
            const result = await chrome.storage.local.get('timerState');
            if (result.timerState) {
              state = result.timerState;
            }
          } catch (e) {
            console.info('Chrome storage failed, trying fallback', e);
          }
        }
        
        // If that fails, try localStorage
        if (!state) {
          try {
            const fallbackData = localStorage.getItem('redmineTimerState');
            if (fallbackData) {
              state = JSON.parse(fallbackData);
            }
          } catch (e) {
            console.info('Fallback storage failed too:', e);
          }
        }
        
        if (state) {
          const { isRunning, startTime, elapsedTime } = state;
          this.elapsedTime = elapsedTime;
          this.startTime = startTime;
          if (isRunning) {
            this.startTimer();
          } else {
            this.updateDisplay();
          }
        }
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RedmineTimer();
});

// Also try to initialize immediately
new RedmineTimer();