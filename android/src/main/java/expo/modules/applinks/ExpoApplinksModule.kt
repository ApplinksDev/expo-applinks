package expo.modules.applinks

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.Exceptions
import com.applinks.android.AppLinksSDK
import com.applinks.android.handlers.LinkHandlingResult
import com.applinks.android.AppLinksSDKVersion
import android.net.Uri
import android.os.Handler
import android.os.Looper
import com.applinks.android.LinkType

class ExpoApplinksModule : Module() {
  private var linkListener: AppLinksSDK.AppLinksListener? = null
  private val mainHandler = Handler(Looper.getMainLooper())
  
  override fun definition() = ModuleDefinition {
    Name("ExpoApplinks")

    Events("onLinkHandled")
    
    OnStartObserving {
      setupLinkListener()
    }
    
    OnStopObserving {
      removeLinkListener()
    }

    AsyncFunction("initialize") { config: Map<String, Any>, promise: Promise ->
      try {
        val apiKey = config["apiKey"] as? String ?: throw Exception("API key is required")
        
        val logLevel = when (config["logLevel"] as? String) {
          "none" -> "none"
          "error" -> "error"
          "warning" -> "warning"
          "info" -> "info"
          "debug" -> "debug"
          else -> "info"
        }
        
        val context = appContext.reactContext ?: throw Exceptions.AppContextLost()
        
        // Get plugin configuration from manifest
        val metadata = context.packageManager.getApplicationInfo(
          context.packageName,
          android.content.pm.PackageManager.GET_META_DATA
        ).metaData
        
        val supportedDomains = metadata?.getString("com.applinks.supportedDomains")?.split(",") ?: emptyList()
        val supportedSchemes = metadata?.getString("com.applinks.supportedSchemes")?.split(",") ?: emptyList()
        
        // Initialize AppLinksSDK
        val sdk = AppLinksSDK.builder(context)
          .apiKey(apiKey)
          .apply {
            if (supportedDomains.isNotEmpty()) {
              supportedDomains(*supportedDomains.toTypedArray())
            }
            if (supportedSchemes.isNotEmpty()) {
              supportedSchemes(*supportedSchemes.toTypedArray())
            }
          }
          .build()
        
        // Mark SDK as initialized and process any pending URLs
        ExpoApplinksPlugin.markSDKInitialized()
        
        promise.resolve(null)
      } catch (e: Exception) {
        promise.reject("InitializationError", e.message, e)
      }
    }

    Function("getVersion") {
      return@Function AppLinksSDKVersion.current
    }

    AsyncFunction("createLink") { params: Map<String, Any>, promise: Promise ->
      try {
        val domain = params["domain"] as? String ?: throw Exception("Domain is required")
        val type = params["type"] as? String ?: "short"
        val title = params["title"] as? String ?: throw Exception("Title is required")
        val deepLinkPath = params["deepLinkPath"] as? String ?: throw Exception("Deep link path is required")
        val deepLinkParams = params["deepLinkParams"] as? Map<String, String> ?: emptyMap()
        val webLink = params["web_link"] as? String
        val expiresAt = params["expiresAt"] as? Long // Unix timestamp in milliseconds
        
        AppLinksSDK.getInstance().linkShortener.createLinkAsync {
          this.webLink = webLink?.let { Uri.parse(it) }
          this.domain = domain
          this.title = title
          this.deepLinkPath = deepLinkPath
          this.deepLinkParams = deepLinkParams
          linkType = when (type) {
            "unguessable" -> LinkType.UNGUESSABLE
            "short" -> LinkType.SHORT
            else -> LinkType.SHORT
          }
          expiresAt?.let {
            this.expiresAt = it
          }
        }.addOnSuccessListener { result ->
          val (shortLink) = result
          promise.resolve(shortLink)
        }.addOnFailureListener { exception ->
          promise.reject("CreateLinkError", exception.message ?: "Failed to create link", exception)
        }
      } catch (e: Exception) {
        promise.reject("CreateLinkError", e.message, e)
      }
    }
  }
  
  private fun setupLinkListener() {
    if (linkListener == null) {
      linkListener = object : AppLinksSDK.AppLinksListener {
        override fun onLinkReceived(result: LinkHandlingResult) {
          sendLinkResult(result)
        }
        
        override fun onError(error: String) {
          val errorResult = mapOf(
            "handled" to false,
            "originalUrl" to "",
            "path" to "",
            "params" to emptyMap<String, String>(),
            "metadata" to emptyMap<String, Any>(),
            "error" to error
          )
          mainHandler.post {
            sendEvent("onLinkHandled", errorResult)
          }
        }
      }
      
      try {
        AppLinksSDK.getInstance().addLinkListener(linkListener!!)
      } catch (e: Exception) {
        // SDK not initialized yet
      }
    }
  }
  
  private fun removeLinkListener() {
    linkListener?.let {
      try {
        AppLinksSDK.getInstance().removeLinkListener(it)
      } catch (e: Exception) {
        // SDK not initialized
      }
      linkListener = null
    }
  }
  
  private fun sendLinkResult(result: LinkHandlingResult) {
    val eventData = mapOf(
      "handled" to result.handled,
      "originalUrl" to result.originalUrl.toString(),
      "path" to result.path,
      "params" to result.params,
      "metadata" to result.metadata,
      "error" to result.error
    )
    
    mainHandler.post {
      sendEvent("onLinkHandled", eventData)
    }
  }
}