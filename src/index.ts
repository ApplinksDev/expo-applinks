import ExpoApplinksModule from './ExpoApplinksModule';
import { AppLinksConfig, LinkHandlingResult } from './ExpoApplinks.types';

export * from './ExpoApplinks.types';

export class AppLinks {
  static async initialize(config: AppLinksConfig): Promise<void> {
    return ExpoApplinksModule.initialize(config);
  }

  static getVersion(): string {
    return ExpoApplinksModule.getVersion();
  }

  static addLinkListener(listener: (result: LinkHandlingResult) => void): () => void {
    const subscription = ExpoApplinksModule.addListener('onLinkHandled', listener);
    return () => subscription.remove();
  }
}

export default AppLinks;
