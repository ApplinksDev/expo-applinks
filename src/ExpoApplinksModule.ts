import { NativeModule, requireNativeModule } from 'expo';

import { ExpoApplinksModuleEvents } from './ExpoApplinks.types';

declare class ExpoApplinksModule extends NativeModule<ExpoApplinksModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<ExpoApplinksModule>('ExpoApplinks');
