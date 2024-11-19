class RedmineTimer {
    constructor() {
      console.log('RedmineTimer: Initializing...');
  
      this.isRunning = false;
      this.startTime = 0;
      this.elapsedTime = 0;
      this.timerInterval = null;
      this.timeInput = document.querySelector('#time_entry_hours');
      this.setup();
    }
  
    setup() {
      console.log('RedmineTimer: Setting up timer controls...');
  
      this.createTimerControls();
      this.loadSavedState();
    }
  
    createTimerControls() {
      const container = document.createElement('div');
      container.className = 'timer-controls';
  
      this.timerDisplay = document.createElement('span');
      this.timerDisplay.className = 'timer-display';
      this.timerDisplay.textContent = '00:00:00';
  
      this.playButton = document.createElement('button');
      this.playButton.className = 'timer-button play-button';
      this.playButton.textContent = 'Play';
      this.playButton.type = 'button';  // Явно указываем тип кнопки
      this.playButton.onclick = (e) => {
          e.preventDefault();  // Предотвращаем действие по умолчанию
          e.stopPropagation();  // Останавливаем всплытие события
          this.startTimer();
      };
  
      this.pauseButton = document.createElement('button');
      this.pauseButton.className = 'timer-button pause-button';
      this.pauseButton.textContent = 'Pause';
      this.pauseButton.type = 'button';  // Явно указываем тип кнопки
      this.pauseButton.onclick = (e) => {
          e.preventDefault();  // Предотвращаем действие по умолчанию
          e.stopPropagation();  // Останавливаем всплытие события
          this.pauseTimer();
      };
      this.pauseButton.style.display = 'none';
  
      container.append(this.timerDisplay, this.playButton, this.pauseButton);
      this.timeInput.parentNode.appendChild(container);
    }
  
    startTimer() {
      if (!this.isRunning) {
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.playButton.style.display = 'none';
        this.pauseButton.style.display = 'inline-block';
        this.saveState();
      }
    }
  
    pauseTimer() {
      if (this.isRunning) {
        this.isRunning = false;
        clearInterval(this.timerInterval);
        this.playButton.style.display = 'inline-block';
        this.pauseButton.style.display = 'none';
        this.saveState();
      }
    }
  
    updateTimer() {
      this.elapsedTime = Date.now() - this.startTime;
      const hours = Math.floor(this.elapsedTime / 3600000);
      const minutes = Math.floor((this.elapsedTime % 3600000) / 60000);
      const seconds = Math.floor((this.elapsedTime % 60000) / 1000);
  
      this.timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // Update Redmine time input (converting to hours)
      const totalHours = (this.elapsedTime / 3600000).toFixed(2);
      this.timeInput.value = totalHours;
    }
  
    saveState() {
      const state = {
        isRunning: this.isRunning,
        startTime: this.startTime,
        elapsedTime: this.elapsedTime
      };
      chrome.storage.local.set({ timerState: state });
    }
  
    async loadSavedState() {
      const result = await chrome.storage.local.get('timerState');
      if (result.timerState) {
        const { isRunning, startTime, elapsedTime } = result.timerState;
        this.elapsedTime = elapsedTime;
        this.startTime = startTime;
        if (isRunning) {
          this.startTimer();
        } else {
          this.updateTimer();
        }
      }
    }
  }
  
  // Initialize the timer immediately and also watch for dynamically added elements
  function initTimer() {
    // Try to find the time input field
    const timeInput = document.querySelector('#time_entry_hours');
    if (timeInput) {
      console.log('RedmineTimer: Found time input field, initializing timer...');
      new RedmineTimer();
    }
  }
  
  // Create a mutation observer to watch for dynamically added time input field
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const timeInput = node.matches('#time_entry_hours') ? 
            node : node.querySelector('#time_entry_hours');
          if (timeInput) {
            console.log('RedmineTimer: Time input field dynamically added, initializing timer...');
            observer.disconnect(); // Stop observing once we found our element
            new RedmineTimer();
          }
        }
      });
    });
  });
  
  // Start observing
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Try to initialize immediately
  initTimer();
  
  // Also try on DOMContentLoaded as backup
  document.addEventListener('DOMContentLoaded', initTimer);