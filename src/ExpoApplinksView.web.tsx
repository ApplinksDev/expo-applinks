import * as React from 'react';

import { ExpoApplinksViewProps } from './ExpoApplinks.types';

export default function ExpoApplinksView(props: ExpoApplinksViewProps) {
  return (
    <div>
      <iframe
        style={{ flex: 1 }}
        src={props.url}
        onLoad={() => props.onLoad({ nativeEvent: { url: props.url } })}
      />
    </div>
  );
}
