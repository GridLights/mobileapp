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

## Setup Capacitor dependencies:

```bash
# Nav to capacitor directory
cd src-capacitor

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

# Clean and reinstall dependencies
sudo rm -rf node_modules ios package-lock.json
npm install
npm install @capacitor/core@5.5.0 @capacitor/ios@5.5.0 --save-exact

# Add iOS platform
# Note: Will show errors but continue to next step
npx cap add ios
```

## Configure iOS project:

```bash
cd ios/App
nano Podfile

# Replace contents with:
platform :ios, '15.0'
use_frameworks!

def capacitor_pods
  pod 'Capacitor', :path => '../../node_modules/@capacitor/ios'
  pod 'CapacitorCordova', :path => '../../node_modules/@capacitor/ios'
end

target 'App' do
  capacitor_pods
end

post_install do |installer|
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.0'
    end
  end
end

```

## Install pods:

```bash
pod cache clean --all
rm -rf Pods Podfile.lock
pod install
```

## Open and configure Xcode project:

```bash
# Nav back to src-capacitor
cd ../..

# Open in Xcode
npx cap open ios
```

## In Xcode set up the project:

• Click on the "App" project in the left navigator
• Go to "Signing & Capabilities" tab
• Make sure "Automatically manage signing" is checked
• Select your Team (Personal Team) from your developer account
• Under "General" tab, set Minimum Deployment to IOS 15
:: If you build and run now, the vue app will not show, we need to do a few more steps

## Build and handle app content:

```bash
# Return to VSCode and nav back to project root
cd ..

# Build the app
# Note: Will show errors and fail but continue to next steps...
quasar build -m capacitor -T ios

# Go to iOS App directory
cd src-capacitor/ios/App

# IMPORTANT: Check Podfile - it probably reverted to iOS 11.0
nano Podfile
#Verify first line is: platform :ios, '15.0'

# Clean and reinstall pods
pod cache clean --all
rm -rf Pods Podfile.lock
pod install

# Nav back to src-capacitor
cd ../..

# Open in Xcode again
#
npx cap open ios
```

## Run in Xcode:

• Under "General" tab, make sure Minimum Deployment to IOS 15
• Click the Play button or press Cmd + R
• The app should now show
