// PWA specific type definitions

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface Navigator {
  readonly connection?: NetworkInformation;
  readonly serviceWorker: ServiceWorkerContainer;
}

interface NetworkInformation extends EventTarget {
  readonly downlink: number;
  readonly effectiveType: "slow-2g" | "2g" | "3g" | "4g";
  readonly rtt: number;
  readonly saveData: boolean;
}

interface WindowEventMap {
  beforeinstallprompt: BeforeInstallPromptEvent;
  appinstalled: Event;
}

// Service Worker types
interface ServiceWorkerGlobalScope {
  addEventListener(
    type: "install",
    listener: (event: ExtendableEvent) => void,
  ): void;
  addEventListener(
    type: "activate",
    listener: (event: ExtendableEvent) => void,
  ): void;
  addEventListener(type: "fetch", listener: (event: FetchEvent) => void): void;
  addEventListener(type: "push", listener: (event: PushEvent) => void): void;
  addEventListener(
    type: "notificationclick",
    listener: (event: NotificationEvent) => void,
  ): void;
  addEventListener(type: "sync", listener: (event: SyncEvent) => void): void;
  skipWaiting(): Promise<void>;
  clients: Clients;
  registration: ServiceWorkerRegistration;
}

interface ExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface FetchEvent extends ExtendableEvent {
  readonly request: Request;
  respondWith(response: Promise<Response> | Response): void;
}

interface PushEvent extends ExtendableEvent {
  readonly data: PushMessageData | null;
}

interface NotificationEvent extends ExtendableEvent {
  readonly notification: Notification;
  readonly action: string;
}

interface SyncEvent extends ExtendableEvent {
  readonly tag: string;
  readonly lastChance: boolean;
}

declare const self: ServiceWorkerGlobalScope;
