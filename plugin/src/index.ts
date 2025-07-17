import {
  ConfigPlugin,
  withEntitlementsPlist,
  withInfoPlist,
  withAndroidManifest,
  createRunOncePlugin,
} from '@expo/config-plugins';

type AppLinksPluginConfig = {
  supportedDomains?: string[];
  supportedSchemes?: string[];
};

const withAppLinks: ConfigPlugin<AppLinksPluginConfig> = (config, options = {}) => {
  const { supportedDomains = [], supportedSchemes = [] } = options;

  // iOS Configuration
  // Add Associated Domains entitlement for universal links
  config = withEntitlementsPlist(config, (config) => {
    if (supportedDomains.length > 0) {
      const associatedDomains = supportedDomains.map(domain => `applinks:${domain}`);
      config.modResults['com.apple.developer.associated-domains'] = associatedDomains;
    }
    return config;
  });

  // Add URL schemes to Info.plist and store configuration
  config = withInfoPlist(config, (config) => {
    if (supportedSchemes.length > 0) {
      const urlTypes = supportedSchemes.map(scheme => ({
        CFBundleURLName: scheme,
        CFBundleURLSchemes: [scheme],
      }));
      
      if (!config.modResults.CFBundleURLTypes) {
        config.modResults.CFBundleURLTypes = [];
      }
      
      // Merge with existing URL types
      config.modResults.CFBundleURLTypes = [
        ...config.modResults.CFBundleURLTypes,
        ...urlTypes,
      ];
    }
    
    // Store configuration for native module to read
    config.modResults.ExpoAppLinksSupportedDomains = supportedDomains;
    config.modResults.ExpoAppLinksSupportedSchemes = supportedSchemes;
    
    return config;
  });

  // Android Configuration
  // Add metadata to AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    const application = config.modResults.manifest.application?.[0];
    if (!application) return config;
    
    if (!application['meta-data']) {
      application['meta-data'] = [];
    }
    
    // Add supported domains metadata
    if (supportedDomains.length > 0) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.applinks.supportedDomains',
          'android:value': supportedDomains.join(','),
        },
      });
    }
    
    // Add supported schemes metadata
    if (supportedSchemes.length > 0) {
      application['meta-data'].push({
        $: {
          'android:name': 'com.applinks.supportedSchemes',
          'android:value': supportedSchemes.join(','),
        },
      });
    }
    
    // Add intent filters for deep links
    const mainActivity = application.activity?.find(
      activity => activity.$['android:name'] === '.MainActivity'
    );
    
    if (mainActivity) {
      if (!mainActivity['intent-filter']) {
        mainActivity['intent-filter'] = [];
      }
      
      // Add App Links intent filter for supported domains
      if (supportedDomains.length > 0) {
        const appLinksIntentFilter: any = {
          $: { 'android:autoVerify': 'true' },
          action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
          category: [
            { $: { 'android:name': 'android.intent.category.DEFAULT' } },
            { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
          ],
          data: supportedDomains.map(domain => ({
            $: {
              'android:scheme': 'https',
              'android:host': domain,
            },
          })),
        };
        mainActivity['intent-filter'].push(appLinksIntentFilter);
      }
      
      // Add custom scheme intent filter
      if (supportedSchemes.length > 0) {
        supportedSchemes.forEach(scheme => {
          const schemeIntentFilter: any = {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW' } }],
            category: [
              { $: { 'android:name': 'android.intent.category.DEFAULT' } },
              { $: { 'android:name': 'android.intent.category.BROWSABLE' } },
            ],
            data: [{
              $: {
                'android:scheme': scheme,
              },
            }],
          };
          mainActivity['intent-filter']!.push(schemeIntentFilter);
        });
      }
    }
    
    return config;
  });

  return config;
};

export default createRunOncePlugin(withAppLinks, 'expo-applinks');