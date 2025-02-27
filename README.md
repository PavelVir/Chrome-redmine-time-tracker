# Redmine Time Tracker Chrome Extension

A Chrome extension that adds enhanced time tracking functionality to Redmine time entries. This extension provides a convenient timer interface with powerful features for tracking your work time efficiently.

## Features

- ⏱️ Visual timer display with hours, minutes, and seconds
- ▶️ Play/Pause functionality for time tracking
- 📝 Manual time input field (in hours)
- 🔄 Reset button to clear timer
- 💾 Automatic state preservation between page reloads
- 🔄 Synchronization with Redmine's time entry field
- 📱 Responsive and user-friendly interface
- 🔔 Work break reminders with customizable intervals
- ⚙️ Configurable time format (decimal or HH:MM)
- 📊 Recent tasks tracking and history
- 🎯 Quick access popup for managing timers
- 🔒 Fallback storage when extension context is invalidated

## Installation

### Для пользователей
1. Скачайте или клонируйте этот репозиторий
2. Откройте Chrome и перейдите по адресу `chrome://extensions/`
3. Включите "Режим разработчика" в правом верхнем углу
4. Нажмите "Загрузить распакованное расширение"
5. Выберите папку, содержащую файлы расширения

### For Users

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the directory containing the extension files

### For Developers

```bash
# Clone the repository
git clone https://github.com/your-username/redmine-time-tracker.git

# Enter the project directory
cd redmine-time-tracker
```

## Project Structure

```
redmine-time-tracker/
├── manifest.json        # Extension configuration
├── content.js           # Main extension logic for Redmine pages
├── background.js        # Background service worker for notifications
├── popup.html           # Quick access popup interface
├── popup.js             # Popup logic
├── options.html         # Settings page
├── options.js           # Settings logic
├── styles.css           # Styling for timer interface
├── icons/               # Extension icons
│   ├── icon16.svg       # Small icon
│   ├── icon48.svg       # Medium icon
│   └── icon128.svg      # Large icon
└── README.md            # Documentation
```

## Usage

### Basic Usage
1. Navigate to a Redmine time entry page or issue page
2. The timer interface will appear next to the hours input field
3. You can:
   - Click Play to start the timer
   - Click Pause to stop the timer
   - Enter time manually in the hours field
   - Click Reset to clear all values

### Advanced Features
1. Click the extension icon in the browser toolbar to:
   - View current timer status
   - Control the timer without switching tabs
   - Access recent tasks you've worked on
   - Open the settings page

2. Access settings page to:
   - Configure work break reminder intervals
   - Change time format display (decimal or HH:MM)
   - Export/import your time tracking data
   - Reset settings to defaults

## Features in Detail

### Timer Display
- Shows time in HH:MM:SS format
- Updates in real-time when timer is running
- Syncs with manually entered values

### Manual Time Input
- Accepts decimal hours (e.g., "0.5" for 30 minutes)
- Supports both dot (.) and comma (,) as decimal separators
- Configurable format (decimal or HH:MM)
- Automatically updates the timer display and Redmine field

### Timer Controls
- Play: Starts the timer from current value
- Pause: Stops the timer while preserving the current value
- Reset: Clears timer and all input fields

### State Management
- Preserves timer state between page reloads
- Handles editing of existing time entries
- Maintains synchronization between timer and Redmine field
- Fallback storage when extension context is invalidated

### Work Break Reminders
- Customizable reminder intervals
- Browser notifications when it's time to take a break
- Multiple fallback notification methods
- Can be enabled/disabled in settings

### Recent Tasks Tracking
- Automatically saves information about tasks you work on
- Quick access to recent tasks from the popup
- Records time spent on each task

### Data Management
- Export your time tracking data as JSON
- Import previously exported data
- Clear all saved data if needed

## Browser Compatibility

- Google Chrome (latest versions)
- Chromium-based browsers (Edge, Brave, etc.)

## Known Issues and Solutions

- **Extension context invalidated errors:** The extension now has multiple fallback mechanisms to prevent data loss when the extension context is invalidated
- **Notification permissions:** The extension will request notification permissions for work break reminders
- **Time format differences:** The extension supports both decimal and HH:MM formats for compatibility with different Redmine configurations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## Development

To modify the extension:

1. Make changes to the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload any active Redmine pages

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Inspired by the need for better time tracking in Redmine
- Thanks to the Redmine community

## Support

For support, please create an issue in the GitHub repository.
