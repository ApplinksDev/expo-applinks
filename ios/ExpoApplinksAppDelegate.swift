import ExpoModulesCore
import AppLinksSDK
import UIKit

public class ExpoApplinksAppDelegate: ExpoAppDelegateSubscriber {
  private static var pendingURLs: [URL] = []
  private static var isSDKInitialized = false
  
  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    // AppLinksSDK will be initialized when the JS module calls initialize()
    return true
  }
  
  public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Handle custom URL schemes
    Self.handleLinkSafely(url)
    return true
  }
  
  public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    // Handle universal links
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
      Self.handleLinkSafely(url)
    }
    return true
  }
  
  static func handleLinkSafely(_ url: URL) {
    if isSDKInitialized {
      AppLinksSDK.shared.handleLink(url)
    } else {
      pendingURLs.append(url)
    }
  }
  
  static func markSDKInitialized() {
    isSDKInitialized = true
    // Process any pending URLs
    for url in pendingURLs {
      AppLinksSDK.shared.handleLink(url)
    }
    pendingURLs.removeAll()
  }
}
