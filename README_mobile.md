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

# update src-capacitor/android/app/src/main/java/com/gridlights/app/MainActivity.java

```
package com.gridlights.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Bridge;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Access the WebView through the Capacitor bridge
    WebView webView = (WebView) this.bridge.getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
  }
}
```

# Update src-capacitor/capacitor.config.json

add this:

```
"server": {
    "cleartext": true,
    "hostname": "localhost"
  },
```

so like this:

```
{
  "appId": "com.gridlights.app",
  "appName": "Gridlights",
  "webDir": "www",
  "server": {
    "cleartext": true,
    "hostname": "localhost"
  },
  "ios": {
    "minVersion": "15.0"
  },
  "plugins": {
    "@capacitor/assets": {
      "ios": {
        "iconBackground": "#ffffff",
        "icon": "resources/ios/icon.png"
      },
      "android": {
        "iconBackground": "#ffffff",
        "icon": "resources/ios/icon.png",
        "iconForeground": "resources/ios/icon.png"
      }
    }
  }
}
```
