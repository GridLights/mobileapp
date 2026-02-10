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

source ~/.zshrc 
nvm use 20 
quasar mode add capacitor
use: com.gridlights.solspektrum
appName: Sol-Spektrum
npx cap init
name: Sol-Spektrum
com.gridlights.solspektrum
webassets: www

# src-capacitor/capacitor.config.json
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

# mobileapp/src-capacitor/android/app/src/main/res/xml/network_security_config.xml
< ?xml version="1.0" encoding="utf-8"? >
<network-security-config>
    <base-config cleartextTrafficPermitted="true">
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </base-config>
</network-security-config>

# src-capacitor/android/app/src/main/AndroidManifest.xml
android:usesCleartextTraffic="true" android:networkSecurityConfig="@xml/network_security_config"


# android/app/src/main/java/…./MainActivity.java
package com.gridlights.solspektrum;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;


import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;


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

# /src-capacitor/android/gradle/wrapper/gradle-wrapper.properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-9.0-milestone-1-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists


# android/app/build.gradle
versionCode 2

# android/variables.gradle
    compileSdkVersion = 35
    targetSdkVersion = 35

to rebuild… npx quasar build -m capacitor -T android
```
