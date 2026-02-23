package com.gridlights.solspektrum;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.gridlights.solspektrum.BuildConfig;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

    // Allow mixed content (HTTP within HTTPS context) for WebSocket support
    WebView webView = (WebView) this.bridge.getWebView();
    if (webView != null) {
      WebSettings settings = webView.getSettings();
      settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
  }
}
