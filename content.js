class RedmineTimer {
  constructor() {
    this.isRunning = false;
    this.startTime = Date.now();
    this.elapsedTime = 0;
    this.timerInterval = null;
    // Initialize input fields
    document.getElementById('time_entry_hours').addEventListener('input', (e) => {
      const hours = parseFloat(e.target.value.replace(',', '.')); // Convert comma to dot for decimals
      if (!isNaN(hours)) {
        this.setTime(hours);
      }
    });
  }

  setup() {
    this.createControls();
    this.loadState();
  }

  createControls() {
    this.container.append(
      this.timerDisplay,
      this.manualInput,
      this.playButton,
      this.pauseButton,
      this.resetButton
    );

    // Add container after the time input field
    document.getElementById('time_entry_hours').appendChild(this.container);
  }

  createButton(text, className) {
    const button = document.createElement('button');
    button.type = 'button';
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

    document.getElementById('manual_input').addEventListener('input', (e) => {  // Changed to manualInput
      const hours = parseFloat(e.target.value.replace(',', '.'));
      if (!isNaN(hours)) {
        this.setTime(hours);
      }
    });
  }

  startTimer() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime; // Set startTime now
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
      this.playButton.style.display = 'none';
      this.pauseButton.style.display = 'inline-block';
    }
  }

  pauseTimer() {
    if (this.isRunning) {
      this.isRunning = false;
      clearInterval(this.timerInterval);
      this.playButton.style.display = 'inline-block';
      this.pauseButton.style.display = 'none';
    }
  }

  resetTimer() {
    // Ensure timer starts fresh
    this.elapsedTime = 0;
    this.startTime = Date.now();
    this.updateDisplay();
    this.timeInput.value = '0';
    this.manualInput.value = '';
    this.saveState();
  }

  setTime(hours) {
    this.elapsedTime = Math.floor(hours * 3600000); // Convert hours to milliseconds
    this.timeInput.value = `${hours.toFixed(2)}${hours % 1 >= 0 ? '.' : ''}`; // Fix time display formatting
    this.manualInput.value = this.getTimeString(); // Update manual input too

    if (this.isRunning) {
      this.startTime = Date.now() - this.elapsedTime;
    }

    this.updateDisplay();
    this.saveState();
  }

  updateTimer() {
    const now = Date.now();
    this_elapsed_time = now - this.startTime; // Use this to avoid race condition
    this.elapsedTime = Math.floor(this_elapsed_time / 1000); // Update in seconds

    this.updateDisplay(); // Ensure display is always current

    // Update Redmine input values
    const hours = (this.elapsedTime / 3600000).toFixed(2);
    this.timeInput.value = `${hours}">${this.getSeconds().padStart(2, '0')}`;
    this.manualInput.value = `${hours} ${this.getSeconds().padStart(2, '0')}`;

    if (!this.isRunning) {
      this.saveState();
    }
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
      const isEditMode = window.location.href.includes('/edit');
      if (isEditMode) {
        this.timeInput.value = '0';
      } else {
        // Load from storage
        const saved = await chrome.storage.local.get('timerState');
        if (saved) {
          this.elapsedTime = saved.elapsedTime;
          this.startTime = saved.startTime;
          this.isRunning = saved.isRunning;

          // Force recalculate in case something is wrong
          if (!this.isRunning) {
            this.updateDisplay();
          }
        }
      }
    } catch (error) {
      console.error('Error loading state:', error);
    }
  }

  async startTimer() {  // Changed to ensure initial start sets startTime correctly
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime; // Set now
      this.timerInterval = setInterval(() => this.updateTimer(), 1000);
    }
  }


}

  // Initial setup
  new RedmineTimer();