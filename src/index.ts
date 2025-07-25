import ExpoApplinksModule from './ExpoApplinksModule';
import { AppLinksConfig, LinkHandlingResult } from './ExpoApplinks.types';

export * from './ExpoApplinks.types';

export interface CreateLinkParams {
  domain: string;
  type: 'unguessable' | 'short';
  title: string;
  deepLinkPath: string;
  deepLinkParams?: Record<string, string>;
  web_link?: string;
  expiresAt?: Date;
}

export class AppLinks {
  static async initialize(config: AppLinksConfig): Promise<void> {
    return ExpoApplinksModule.initialize(config);
  }

  static getVersion(): string {
    return ExpoApplinksModule.getVersion();
  }

  static async createLink(params: CreateLinkParams): Promise<string> {
    return ExpoApplinksModule.createLink({
      ...params,
      expiresAt: params.expiresAt?.getTime(),
    });
  }

  static getAppLinkDetails(url: string): Promise<LinkHandlingResult> {
    return ExpoApplinksModule.getAppLinkDetails(url);
  }


  static getInitialLink(): Promise<LinkHandlingResult | null> {
    return ExpoApplinksModule.getInitialLink();
  }

  static addLinkListener(listener: (result: LinkHandlingResult) => void): () => void {
    const subscription = ExpoApplinksModule.addListener('onLinkHandled', listener);
    return () => subscription.remove();
  }
}

export default AppLinks;
