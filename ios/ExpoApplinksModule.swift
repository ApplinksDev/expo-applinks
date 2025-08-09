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

    AsyncFunction("createLink") { (params: [String: Any]) -> String in
      guard let domain = params["domain"] as? String,
            let type = params["type"] as? String,
            let title = params["title"] as? String,
            let deepLinkPath = params["deepLinkPath"] as? String else {
        throw Exception(name: "InvalidParams", description: "Required parameters are missing")
      }
      
      let linkType: LinkType
      switch type {
      case "unguessable":
        linkType = .unguessable
      case "short":
        linkType = .short
      default:
        throw Exception(name: "InvalidParams", description: "Invalid link type")
      }
      
      let subtitle = params["subtitle"] as? String
      let deepLinkParams = params["deepLinkParams"] as? Dictionary<String, String> ?? [:]
      let webLink = params["web_link"] as? String
      let backgroundType = params["background_type"] as? String
      let backgroundColor = params["background_color"] as? String
      let backgroundColorFrom = params["background_color_from"] as? String
      let backgroundColorTo = params["background_color_to"] as? String
      let backgroundColorDirection = params["background_color_direction"] as? String
      
      var expirationDate: Date? = nil
      if let expirationTimestamp = params["expiration_date"] as? Double {
        expirationDate = Date(timeIntervalSince1970: expirationTimestamp / 1000)
      }
      
      return try await AppLinksSDK.shared.linkShortener.createLink(
        LinkCreationParams(
            domain: domain,
            title: title,
            subtitle: subtitle,
            deepLinkPath: deepLinkPath,
            webLink: webLink,
            deepLinkParams: deepLinkParams,
            expiresAt: expirationDate,
            linkType: linkType,
            backgroundType: backgroundType,
            backgroundColor: backgroundColor,
            backgroundColorFrom: backgroundColorFrom,
            backgroundColorTo: backgroundColorTo,
            backgroundColorDirection: backgroundColorDirection
        )
      ).fullUrl
    }

    Function("getVersion") {
      return AppLinksSDK.version
    }
    
    AsyncFunction("getAppLinkDetails") { (url: String) -> [String: Any]? in
      guard let url = URL(string: url) else {
        return nil
      }
      
      let handledLink = await AppLinksSDK.shared.getAppLinkDetails(from: url)
      return [
        "handled": handledLink.handled,
        "originalUrl": handledLink.originalUrl.absoluteString,
        "path": handledLink.path,
        "params": handledLink.params,
        "metadata": handledLink.metadata,
        "error": handledLink.error as Any
      ]
    }
    
    AsyncFunction("getInitialLink") { () -> [String: Any]? in
      guard let link = await ExpoApplinksAppDelegate.initialLink else { return nil }
      
      let handledLink = await AppLinksSDK.shared.getAppLinkDetails(from: link)
      if (!handledLink.handled) {
        return nil
      }
        
      return [
        "handled": handledLink.handled,
        "originalUrl": handledLink.originalUrl.absoluteString,
        "path": handledLink.path,
        "params": handledLink.params,
        "metadata": handledLink.metadata,
        "error": handledLink.error as Any
      ]
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
