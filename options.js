// Default settings
const DEFAULT_SETTINGS = {
  reminderInterval: 60, // minutes
  enableReminders: true,
  timeFormat: 'decimal' // 'decimal' or 'hhmm'
};

// Elements
const reminderIntervalInput = document.getElementById('reminderInterval');
const enableRemindersCheckbox = document.getElementById('enableReminders');
const formatDecimalRadio = document.getElementById('formatDecimal');
const formatHHMMRadio = document.getElementById('formatHHMM');
const exportDataButton = document.getElementById('exportData');
const importDataButton = document.getElementById('importData');
const clearDataButton = document.getElementById('clearData');
const importFileInput = document.getElementById('importFile');
const saveSettingsButton = document.getElementById('saveSettings');
const resetSettingsButton = document.getElementById('resetSettings');
const statusElement = document.getElementById('status');

// Load settings
function loadSettings() {
  chrome.storage.local.get('settings', (result) => {
    const settings = result.settings || DEFAULT_SETTINGS;
    
    // Apply settings to form
    reminderIntervalInput.value = settings.reminderInterval;
    enableRemindersCheckbox.checked = settings.enableReminders;
    
    if (settings.timeFormat === 'decimal') {
      formatDecimalRadio.checked = true;
    } else {
      formatHHMMRadio.checked = true;
    }
  });
}

// Save settings
function saveSettings() {
  const settings = {
    reminderInterval: parseInt(reminderIntervalInput.value, 10),
    enableReminders: enableRemindersCheckbox.checked,
    timeFormat: formatDecimalRadio.checked ? 'decimal' : 'hhmm'
  };
  
  chrome.storage.local.set({ settings }, () => {
    showStatus('Settings saved successfully!', 'success');
  });
}

// Reset settings
function resetSettings() {
  chrome.storage.local.set({ settings: DEFAULT_SETTINGS }, () => {
    loadSettings();
    showStatus('Settings reset to defaults!', 'success');
  });
}

// Export data
function exportData() {
  chrome.storage.local.get(null, (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `redmine-time-tracker-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showStatus('Data exported successfully!', 'success');
  });
}

// Import data
function importData() {
  importFileInput.click();
}

// Handle file selection
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      chrome.storage.local.clear(() => {
        chrome.storage.local.set(data, () => {
          loadSettings();
          showStatus('Data imported successfully!', 'success');
        });
      });
    } catch (error) {
      showStatus('Error importing data: ' + error.message, 'error');
    }
  };
  reader.readAsText(file);
}

// Clear all data
function clearData() {
  if (confirm('Are you sure you want to clear all saved data? This cannot be undone.')) {
    chrome.storage.local.clear(() => {
      loadSettings();
      showStatus('All data has been cleared!', 'success');
    });
  }
}

// Show status message
function showStatus(message, type) {
  statusElement.textContent = message;
  statusElement.className = 'status ' + type;
  statusElement.style.display = 'block';
  
  setTimeout(() => {
    statusElement.style.display = 'none';
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', loadSettings);
saveSettingsButton.addEventListener('click', saveSettings);
resetSettingsButton.addEventListener('click', resetSettings);
exportDataButton.addEventListener('click', exportData);
importDataButton.addEventListener('click', importData);
clearDataButton.addEventListener('click', clearData);
importFileInput.addEventListener('change', handleFileSelect);