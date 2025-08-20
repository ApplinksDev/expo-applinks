export type LinkHandlingResult = {
  handled: boolean;
  originalUrl: string;
  path: string;
  params: Record<string, string>;
  metadata: Record<string, any>;
  error?: string;
};

export type AppLinksConfig = {
  apiKey: string;
  logLevel?: 'none' | 'error' | 'warning' | 'info' | 'debug';
  autoHandleLinks?: boolean;
  deferredDeepLinkingEnabled?: boolean;
};

export type ExpoApplinksModuleEvents = {
  onLinkHandled: (result: LinkHandlingResult) => void;
};
