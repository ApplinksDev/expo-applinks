import { NativeModule, requireNativeModule } from 'expo';

import { ExpoApplinksModuleEvents, AppLinksConfig, LinkHandlingResult } from './ExpoApplinks.types';

declare class ExpoApplinksModule extends NativeModule<ExpoApplinksModuleEvents> {
  initialize(config: AppLinksConfig): Promise<void>;
  getVersion(): string;
  getInitialLink(): Promise<LinkHandlingResult | null>;
  getAppLinkDetails(url: string): Promise<LinkHandlingResult>;
  createLink(params: {
    domain: string,
    type: 'unguessable' | 'short',
    title: string,
    deepLinkPath: string,
    deepLinkParams?: Record<string, string>,
    web_link?: string,
    expiresAt?: number,
  }): Promise<string>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoApplinksModule>('ExpoApplinks');
