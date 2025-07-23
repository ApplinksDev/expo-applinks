package expo.modules.applinks

import android.app.Activity
import android.content.Intent
import android.net.Uri
import com.applinks.android.AppLinksSDK
import java.util.concurrent.ConcurrentLinkedQueue

object ExpoApplinksPlugin {
  private var isSDKInitialized = false
  private val pendingUrls = ConcurrentLinkedQueue<Uri>()
  var initialLink: Uri? = null

  fun markSDKInitialized() {
    isSDKInitialized = true
    processPendingUrls()
  }
  
  fun handleIntent(activity: Activity, intent: Intent) {
    intent.data?.let { uri ->
      if (initialLink == null) {
        initialLink = uri
      }

      if (isSDKInitialized) {
        try {
          AppLinksSDK.getInstance().handleLink(uri)
        } catch (e: Exception) {
          // SDK not initialized yet
          pendingUrls.offer(uri)
        }
      } else {
        pendingUrls.offer(uri)
      }
    }
  }
  
  private fun processPendingUrls() {
    while (pendingUrls.isNotEmpty()) {
      val uri = pendingUrls.poll()
      uri?.let {
        try {
          AppLinksSDK.getInstance().handleLink(it)
        } catch (e: Exception) {
          // Failed to process URL
        }
      }
    }
  }
}