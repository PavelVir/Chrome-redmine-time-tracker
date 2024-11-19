I've created a Chrome extension that adds time tracking functionality to Redmine time entries. Here's what the extension does:

Adds a timer display and Play/Pause buttons next to the hours input field
Tracks time when Play is clicked and updates the hours field automatically
Persists the timer state even if the page is refreshed
Displays time in HH:MM:SS format while tracking in real-time
Converts the tracked time to hours for the Redmine input field

To install and use this extension:

Create a new directory for the extension
Create three files: manifest.json, content.js, and styles.css
Copy the code from the artifact into these respective files
In Chrome, go to chrome://extensions/
Enable "Developer mode" (top right)
Click "Load unpacked" and select your extension directory

The extension will automatically run on any Redmine time entry page. When you:

Click "Play": Timer starts and updates the hours field in real-time
Click "Pause": Timer stops but maintains the current value
Refresh the page: Timer state is preserved

The timer converts the tracked time to hours automatically in the format Redmine expects (decimal hours).
