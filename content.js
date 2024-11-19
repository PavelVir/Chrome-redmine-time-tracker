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
  }

  createControls() {
    // Create container
    this.container = document.createElement('div');
    this.container.className = 'timer-controls';

    // Timer display
    this.timerDisplay = document.createElement('span');
    this.timerDisplay.className = 'timer-display';
    this.timerDisplay.textContent = '00:00:00';

    // Manual input
    this.manualInput = document.createElement('input');
    this.manualInput.type = 'text';
    this.manualInput.className = 'timer-manual-input';
    this.manualInput.placeholder = 'Hours';
    this.manualInput.title = 'Enter hours (e.g. 0.5)';

    // Buttons
    this.playButton = this.createButton('Play', 'play-button');
    this.pauseButton = this.createButton('Pause', 'pause-button');
    this.resetButton = this.createButton('Reset', 'reset-button');
    this.pauseButton.style.display = 'none';

    // Add everything to container
    this.container.append(
      this.timerDisplay,
      this.manualInput,
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

    this.manualInput.addEventListener('change', (e) => {
      const hours = parseFloat(e.target.value.replace(',', '.'));
      if (!isNaN(hours) && hours >= 0) {
        this.setTime(hours);
      }
    });
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

  resetTimer() {
    this.pauseTimer();
    this.elapsedTime = 0;
    this.startTime = 0;
    this.updateDisplay();
    this.timeInput.value = '0';
    this.manualInput.value = '';
    this.saveState();
  }

  setTime(hours) {
    this.elapsedTime = Math.floor(hours * 3600000);
    this.timeInput.value = hours.toString();
    this.manualInput.value = hours.toString();
    this.updateDisplay();
    if (this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
    }
    this.saveState();
  }

  updateTimer() {
    this.elapsedTime = Date.now() - this.startTime;
    this.updateDisplay();
    // Update Redmine input
    const hours = (this.elapsedTime / 3600000).toFixed(2);
    this.timeInput.value = hours;
    this.manualInput.value = hours;
  }

  updateDisplay() {
    const hours = Math.floor(this.elapsedTime / 3600000);
    const minutes = Math.floor((this.elapsedTime % 3600000) / 60000);
    const seconds = Math.floor((this.elapsedTime % 60000) / 1000);

    this.timerDisplay.textContent = 
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  async saveState() {
    try {
      const state = {
        isRunning: this.isRunning,
        startTime: this.startTime,
        elapsedTime: this.elapsedTime
      };
      await chrome.storage.local.set({ timerState: state });
    } catch (error) {
      console.error('Error saving state:', error);
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
        const result = await chrome.storage.local.get('timerState');
        if (result.timerState) {
          const { isRunning, startTime, elapsedTime } = result.timerState;
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