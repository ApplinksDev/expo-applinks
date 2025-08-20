import ExpoModulesCore
import AppLinksSDK
import UIKit

public class ExpoApplinksAppDelegate: ExpoAppDelegateSubscriber {
  private static var pendingURLs: [URL] = []
  private static var isSDKInitialized = false
  private static var autoHandleLinks = false
  static var initialLink: URL? = nil
  
  public func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    // AppLinksSDK will be initialized when the JS module calls initialize()
    return true
  }
  
  public func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
    // Handle custom URL schemes
    if Self.autoHandleLinks {
      return Self.handleLinkSafely(url)
    }
    return false
  }
  
  public func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
    // Handle universal links
    if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
       let url = userActivity.webpageURL {
      if Self.autoHandleLinks {
        return Self.handleLinkSafely(url)
      }
    }
    return true
  }
  
  static func handleLinkSafely(_ url: URL) -> Bool {
    if (Self.initialLink == nil) {
      Self.initialLink = url
    }
    
    if isSDKInitialized {
      return AppLinksSDK.shared.handleLink(url)
    } else {
      pendingURLs.append(url)
    }
    
    return false
  }
  
  static func markSDKInitialized(autoHandleLinks: Bool = false) {
    Self.autoHandleLinks = autoHandleLinks
    isSDKInitialized = true
    // Process any pending URLs
    if autoHandleLinks {
      for url in pendingURLs {
        _ = AppLinksSDK.shared.handleLink(url)
      }
    }
    pendingURLs.removeAll()
  }
}
