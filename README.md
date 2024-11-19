# Redmine Time Tracker Chrome Extension

A Chrome extension that adds enhanced time tracking functionality to Redmine time entries. This extension provides a convenient timer interface with manual time input and tracking capabilities.

## Features

- ⏱️ Visual timer display with hours, minutes, and seconds
- ▶️ Play/Pause functionality for time tracking
- 📝 Manual time input field (in hours)
- 🔄 Reset button to clear timer
- 💾 Automatic state preservation between page reloads
- 🔄 Synchronization with Redmine's time entry field
- 📱 Responsive and user-friendly interface

## Installation

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
├── content.js          # Main extension logic
├── styles.css          # Styling for timer interface
└── README.md          # Documentation
```

## Usage

1. Navigate to a Redmine time entry page or issue page
2. The timer interface will appear next to the hours input field
3. You can:
   - Click Play to start the timer
   - Click Pause to stop the timer
   - Enter time manually in the hours field
   - Click Reset to clear all values

## Features in Detail

### Timer Display
- Shows time in HH:MM:SS format
- Updates in real-time when timer is running
- Syncs with manually entered values

### Manual Time Input
- Accepts decimal hours (e.g., "0.5" for 30 minutes)
- Supports both dot (.) and comma (,) as decimal separators
- Automatically updates the timer display and Redmine field

### Timer Controls
- Play: Starts the timer from current value
- Pause: Stops the timer while preserving the current value
- Reset: Clears timer and all input fields

### State Management
- Preserves timer state between page reloads
- Handles editing of existing time entries
- Maintains synchronization between timer and Redmine field

## Browser Compatibility

- Google Chrome (latest versions)
- Chromium-based browsers (Edge, Brave, etc.)

## Known Issues

- Timer state is stored per browser and not per task
- Manual time entry requires pressing Enter or losing focus to update

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
