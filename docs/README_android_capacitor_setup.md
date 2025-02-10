## Relies on previous ios setup

## Install Android Studio and set environment vars:

````bash
#Installer --> https://developer.android.com/studio?gclsrc=aw.ds&gad_source=1&gbraid=0AAAAAC-IOZlr9jQjAWG6n99C_Uu3hhx5O&gclid=EAIaIQobChMI0bn_-Lu1iwMVoCxECB0U9gUjEAAYASAAEgKybPD_BwE

#after installation, add environment vars to profile

sudo nano ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk    # for Mac
export PATH=$PATH:$ANDROID_HOME/platform-tools

## Verify andoid environment vars are working:

```bash
# Switch to zsh
source ~/.zshrc

adb --version
# Should show android sdk version
````

## Add android to capacitor:

```bash
# Use node v20
nvm use 20
# Nav to capacitor directory
cd src-capacitor

# Install dependencies for android
npm install @capacitor/android@6.2

# Add android project
npx cap add android

# Build quasar project
quasar build

# Copy the web assets to the android project:
npx cap copy android

# Update native plugins:
npx cap update android

# Open the project in Android Studio:
npx cap open android

```

## Setup Android Project

```bash
# Verify package name in build.gradle by opening android/app/build.gradle and checking the applicationId under defaultConfig

# Set up signing keys for release builds:
# cd to android keys folder
cd ../android-keys
keytool -genkey -v -keystore gridlights.keystore -alias gridlights -keyalg RSA -keysize 2048 -validity 10000

# Generate icon assets:
npx @capacitor/assets generate --android
#npx cap sync android (use this when needed to update project after edits)

# Build app for android platform:
quasar build -m capacitor -T android
#quasar dev -m capacitor -T android - use this to run in dev mode with hot-reload

## Setup project in Android Studio:

• Go to File → Project Structure
• Select "Modules" → "app"
• Go to "Signing Configs" tab
• Click "+" to create a new config
• Fill in your keystore details from the keytool command

    :: config name: gridlights_release
    :: store file: click the folder icon and navigate to the ./android-keys/gridlights.keystore
    :: password: the password you entered during keytool generation
    :: alias: gridlights
    :: Key Password: the password you entered during keytool generation
    :: click apply

• Under "Build Variants->Build Types", link this signing config to your release build

    :: select release
    :: scroll down to "Signing Config" and select $signingConfigs.gridlights_release
    :: click apply and ok

• Configure permissions in AndroidManifest.xml (can skip this step, reserved for future reference):

    :: in Android Studio, open app->manifests->AndroidManifest.xml
    :: Add any permissions we need, auto added-> <uses-permission android:name="android.permission.INTERNET" />
```

## Test App

```bash
• Connect Android device via USB with USB debugging enabled

    :: Settings->About Phone - tap Build Number 7 times (it should alert you saying you are now a developer)
    :: go back to Settings->System->Developer Options->Enable USB debugging (device will show up in Android Studio)
    :: Optional: Pair for wireless debuigging.
        - in Settings->System->Developer Options->Allow Wireless Debugging
        - now tap on "Wireless Debugging" and then tap "Pair device with QR code"
        - In Android Studio select "Pair Device Using Wifi" from the device menu up top

• Or use an emulator:

    :: click Tools → Device Manager
    -- (you can skip the next 3 steps and use the default "Medium Phone")
    :: click the + and "Create Virtual Device"
    :: select a phone (like Pixel 9)
    :: click next and select a system image (API 35)

• Click the green play button to the right of the device
```
