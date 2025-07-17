import ExpoModulesCore
import AppLinksSDK
import Combine

public class ExpoApplinksModule: Module {
  private var linkSubscription: AnyCancellable?
  
  public func definition() -> ModuleDefinition {
    Name("ExpoApplinks")

    Events("onLinkHandled")
    
    OnStartObserving {
      self.linkSubscription = AppLinksSDK.shared.linkPublisher
        .sink { [weak self] linkResult in
          self?.sendLinkResult(linkResult)
        }
    }
    
    OnStopObserving {
      self.linkSubscription?.cancel()
    }

    AsyncFunction("initialize") { (config: [String: Any]) in
      guard let apiKey = config["apiKey"] as? String else {
        throw Exception(name: "InvalidConfig", description: "API key is required")
      }
      
      let logLevel: AppLinksSDKLogLevel
      if let logLevelString = config["logLevel"] as? String {
        switch logLevelString {
        case "none": logLevel = .none
        case "error": logLevel = .error
        case "warning": logLevel = .warning
        case "info": logLevel = .info
        case "debug": logLevel = .debug
        default: logLevel = .info
        }
      } else {
        logLevel = .info
      }
      
      // Get plugin configuration from Info.plist
      let supportedDomains = Set(Bundle.main.object(forInfoDictionaryKey: "ExpoAppLinksSupportedDomains") as? [String] ?? [])
      let supportedSchemes = Set(Bundle.main.object(forInfoDictionaryKey: "ExpoAppLinksSupportedSchemes") as? [String] ?? [])
      
      // Initialize AppLinksSDK
      AppLinksSDK.initialize(
        apiKey: apiKey,
        supportedDomains: supportedDomains,
        supportedSchemes: supportedSchemes,
        logLevel: logLevel
      )
      
      // Mark SDK as initialized and process any pending URLs
      ExpoApplinksAppDelegate.markSDKInitialized()
    }


    Function("getVersion") {
      return AppLinksSDK.version
    }
  }
  
  private func sendLinkResult(_ result: LinkHandlingResult) {
    let eventData: [String: Any] = [
      "handled": result.handled,
      "originalUrl": result.originalUrl.absoluteString,
      "path": result.path,
      "params": result.params,
      "metadata": result.metadata,
      "error": result.error as Any
    ]
    
    sendEvent("onLinkHandled", eventData)
  }
}
