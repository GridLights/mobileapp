## Verify app runs in browser

```bash
quasar dev
# Ctrl c to exit back out
```

## Add Capacitor:

```bash
quasar mode add capacitor
# When prompted for app ID, use: com.gridlights.app
# When prompted for npm/yarn, hit return to use npm
```

## Edit capacitor.config.json:

```bash
#add the following to src-capacitor/capacitor.config.json:
	"ios": {
    "minVersion": "15.0"
  }
```

## Setup Capacitor dependencies:

````bash
# Nav to capacitor directory
cd src-capacitor

```bash
# Add iOS platform
npx cap add ios
````

## Build and handle web app content:

```bash
# Return to VSCode and nav back to project root
cd ..

# Build the app
# to run in dev with hot-reload:
quasar dev -m capacitor -T ios

#OR

# to build and deploy:
# Note: Will show errors and fail but continue to next steps...
quasar build -m capacitor -T ios
```

## Run in Xcode:

```bash
# Nav back to src-capacitor
cd src-capacitor
# Open in Xcode again
npx cap open ios
```

• Click on the "App" project in the left navigator
• Go to "Signing & Capabilities" tab
• Make sure "Automatically manage signing" is checked
• Select your Team (Personal Team) from your developer account
• Under "General" tab, set Minimum Deployment to IOS 15
• Click the Play button or press Cmd + R
• The app should now show
