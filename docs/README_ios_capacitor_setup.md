## Verify app runs in browser

```bash
quasar dev
# Ctrl c to exit back out
```

## Add Capacitor:

````bash
## Update Node version

## ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
##
## install nvm if you don't have it already:
##
##	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
##	After installation, add these lines to your shell's configuration file (~/.zshrc or ~/.bash_profile):
##
##	export NVM_DIR="$HOME/.nvm"
##		[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
##		[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
##
##	source ~/.zshrc   # if using zsh
##	nvm install 20
##	nvm use 20
##
## ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

source ~/.zshrc
nvm use 20

quasar mode add capacitor
# When prompted for app ID, use: com.gridlights.app

## Edit capacitor.config.json:

```bash
#add the following to src-capacitor/capacitor.config.json:
	,"ios": {
    "minVersion": "15.0"
  }
````

## Setup Capacitor dependencies:

```bash
# Nav to capacitor directory
cd src-capacitor

# Clean and reinstall dependencies
npm install @capacitor/core@5.5.0 @capacitor/ios@5.5.0
# Add iOS platform
npx cap add ios
```

## Build and handle web app content:

```bash
# Return to VSCode and nav back to project root
cd ..

# Build the app
# to run in dev with hot-reload:
quasar dev -m capacitor -T ios

#OR

# to build and deploy:
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
