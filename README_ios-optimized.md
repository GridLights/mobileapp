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

## Open and configure Xcode project:

```bash
# Add iOS platform
npx cap add ios

# Open in Xcode
npx cap open ios
````

## In Xcode set up the project:

• Click on the "App" project in the left navigator
• Go to "Signing & Capabilities" tab
• Make sure "Automatically manage signing" is checked
• Select your Team (Personal Team) from your developer account
• Under "General" tab, set Minimum Deployment to IOS 15
:: If you build and run now, the vue app will not show, we need to do a few more steps

## Build and handle web app content:

```bash
# Return to VSCode and nav back to project root
cd ..

# Build the app
# Note: Will show errors and fail but continue to next steps...
quasar build -m capacitor -T ios
```

## Run in Xcode:

• Return to the project inXcode, if project is no longer open you can use commandline:

```bash
# Nav back to src-capacitor
cd src-capacitor
# Open in Xcode again
npx cap open ios
```

• Under "General" tab, make sure Minimum Deployment to IOS 15
• Click the Play button or press Cmd + R
• The app should now show
