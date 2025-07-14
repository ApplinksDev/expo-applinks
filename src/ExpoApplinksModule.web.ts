import { registerWebModule, NativeModule } from 'expo';

import { ExpoApplinksModuleEvents } from './ExpoApplinks.types';

class ExpoApplinksModule extends NativeModule<ExpoApplinksModuleEvents> {
  PI = Math.PI;
  async setValueAsync(value: string): Promise<void> {
    this.emit('onChange', { value });
  }
  hello() {
    return 'Hello world! 👋';
  }
}

export default registerWebModule(ExpoApplinksModule, 'ExpoApplinksModule');
