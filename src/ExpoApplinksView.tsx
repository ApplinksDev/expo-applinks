import { requireNativeView } from 'expo';
import * as React from 'react';

import { ExpoApplinksViewProps } from './ExpoApplinks.types';

const NativeView: React.ComponentType<ExpoApplinksViewProps> =
  requireNativeView('ExpoApplinks');

export default function ExpoApplinksView(props: ExpoApplinksViewProps) {
  return <NativeView {...props} />;
}
