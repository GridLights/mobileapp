##

##

## !!! See Docs folder for IOS and Android device setup instructions

##

##

## Use Node 20 (if not already, build may fail if not)

```bash
# Switch to zsh
source ~/.zshrc
nvm use 20
```

## Build for ios:

```bash
# From project root...

# To run in dev with hot-reload:
quasar dev -m capacitor -T ios

# To build and deploy:

quasar build -m capacitor -T ios
```

## Run in Xcode:

```bash
# Nav to src-capacitor
cd src-capacitor
# Open Xcode project
npx cap open ios
```

:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

## Build for android:

```bash
# From project root...

# To run in dev with hot-reload:
quasar dev -m capacitor -T android

# To build and deploy:

quasar build -m capacitor -T android
```

## Run in Android Studio:

```bash
# Nav to src-capacitor
cd src-capacitor
# Open Xcode project
npx cap open android
```

## Manual Updates to Configure Android App
# Mobile App Build Instructions

## Prerequisites

### Setup Node Version
```bash
source ~/.zshrc 
nvm use 20
```

## Initial Capacitor Setup

### Add Capacitor Mode
```bash
quasar mode add capacitor
```

**Configuration prompts:**
- **Package ID:** `com.gridlights.solspektrum`
- **App Name:** `Sol-Spektrum`

### Initialize Capacitor
```bash
npx cap init
```

**Configuration prompts:**
- **Name:** `Sol-Spektrum`
- **Package ID:** `com.gridlights.solspektrum`
- **Web assets directory:** `www`

## Configuration Files

### 1. Capacitor Configuration
**File:** `src-capacitor/capacitor.config.json`
```json
{
  "appId": "com.gridlights.solspektrum",
  "appName": "Gridlights",
  "webDir": "www",
  "server": {
    "hostname": "localhost",
    "androidScheme": "http"
  },
  "plugins": {
    "CapacitorHttp": {
      "enabled": false
    }
  }
}
```

### 2. Network Security Configuration (Android)
**File:** `src-capacitor/android/app/src/main/res/xml/network_security_config.xml`
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>
```

### 3. Android Manifest
**File:** `src-capacitor/android/app/src/main/AndroidManifest.xml`

Add these attributes to the `<application>` tag:
```xml
android:usesCleartextTraffic="true" 
android:networkSecurityConfig="@xml/network_security_config"
```

### 4. MainActivity Configuration
**File:** `src-capacitor/android/app/src/main/java/com/gridlights/solspektrum/MainActivity.java`
```java
package com.gridlights.solspektrum;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView.setWebContentsDebuggingEnabled(true);
    
    // Access the WebView through the Capacitor bridge
    WebView webView = (WebView) this.bridge.getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
  }
}
```

### 5. Gradle Wrapper Configuration
**File:** `src-capacitor/android/gradle/wrapper/gradle-wrapper.properties`
```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-9.0-milestone-1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

### 6. App Build Configuration
**File:** `src-capacitor/android/app/build.gradle`

Update the `versionCode`:
```gradle
versionCode 2
```

### 7. SDK Versions Configuration
**File:** `src-capacitor/android/variables.gradle`
```gradle
ext {
    minSdkVersion = 22
    compileSdkVersion = 35
    targetSdkVersion = 35
    // ... other variables
}
```

## Building the App

### Build Command
```bash
npx quasar build -m capacitor -T android
```

### Generate Signed Release Bundle
From Android Studio:
1. **Build → Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Choose your keystore and enter credentials
4. Select **release** build type
5. Click **Finish**

Or from command line:
```bash
cd src-capacitor/android
./gradlew bundleRelease
```

The signed bundle will be located at:
```
src-capacitor/android/app/build/outputs/bundle/release/app-release.aab
```


## Troubleshooting

### WebSocket Connection Issues

- Check Chrome DevTools: `chrome://inspect/#devices`

### Cleartext Traffic Blocked
- Verify `network_security_config.xml` exists
- Confirm `AndroidManifest.xml` includes cleartext attributes
- Check `androidScheme` is set to `"http"` in capacitor config

### Build Failures
- Clear Gradle cache: `rm -rf ~/.gradle/caches/`
```
