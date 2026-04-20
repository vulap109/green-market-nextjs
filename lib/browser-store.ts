export function subscribeWindowEvents(
  eventNames: string[],
  callback: () => void
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  eventNames.forEach((eventName) => {
    window.addEventListener(eventName, callback);
  });

  return () => {
    eventNames.forEach((eventName) => {
      window.removeEventListener(eventName, callback);
    });
  };
}

export function subscribeNoop(): () => void {
  return () => undefined;
}

export function getBrowserReadySnapshot(): boolean {
  return true;
}

export function getServerReadySnapshot(): boolean {
  return false;
}

export function getLocalStorageSnapshot(key: string, fallbackValue = ""): string {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  return window.localStorage.getItem(key) || fallbackValue;
}
