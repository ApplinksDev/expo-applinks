package expo.modules.applinks

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import expo.modules.core.interfaces.ReactActivityLifecycleListener

class ExpoApplinksReactActivityLifecycleListener : ReactActivityLifecycleListener {
  private var currentActivity: Activity? = null
  
  override fun onCreate(activity: Activity, savedInstanceState: Bundle?) {
    currentActivity = activity
    // Handle intent when activity is created
    activity.intent?.let { intent ->
      ExpoApplinksPlugin.handleIntent(activity, intent)
    }
  }
  
  override fun onNewIntent(intent: Intent?): Boolean {
    // Handle new intent when activity is already running
    intent?.let {
      currentActivity?.let { activity ->
        ExpoApplinksPlugin.handleIntent(activity, it)
      }
    }
    return false
  }
  
  override fun onDestroy(activity: Activity) {
    if (currentActivity == activity) {
      currentActivity = null
    }
  }
}