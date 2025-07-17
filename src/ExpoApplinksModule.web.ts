import { registerWebModule, NativeModule } from 'expo';

import { ExpoApplinksModuleEvents, AppLinksConfig } from './ExpoApplinks.types';

class ExpoApplinksModule extends NativeModule<ExpoApplinksModuleEvents> {
  async initialize(config: AppLinksConfig): Promise<void> {
    console.warn('ExpoApplinks: Web platform is not supported. Deep links will not work.');
  }
  
  getVersion(): string {
    return '1.0.0-web';
  }
}

export default registerWebModule(ExpoApplinksModule, 'ExpoApplinksModule');
