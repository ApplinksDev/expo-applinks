// Reexport the native module. On web, it will be resolved to ExpoApplinksModule.web.ts
// and on native platforms to ExpoApplinksModule.ts
export { default } from './ExpoApplinksModule';
export { default as ExpoApplinksView } from './ExpoApplinksView';
export * from  './ExpoApplinks.types';
