import { EMAILJS_PUBLIC_KEY } from "@/lib/order";

export type EmailJsBrowser = {
  init: (options: { publicKey: string }) => void;
  send: (
    serviceId: string,
    templateId: string,
    templateParams: Record<string, unknown>
  ) => Promise<unknown>;
};

declare global {
  interface Window {
    emailjs?: EmailJsBrowser;
  }
}

const EMAILJS_SCRIPT_ID = "emailjs-browser-sdk";

let emailJsLoadPromise: Promise<EmailJsBrowser> | null = null;
let isEmailJsInitialized = false;

function loadEmailJsBrowser(): Promise<EmailJsBrowser> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("EmailJS is only available in the browser."));
  }

  if (window.emailjs) {
    return Promise.resolve(window.emailjs);
  }

  if (emailJsLoadPromise) {
    return emailJsLoadPromise;
  }

  emailJsLoadPromise = new Promise((resolve, reject) => {
    function handleReady() {
      if (window.emailjs) {
        resolve(window.emailjs);
        return;
      }

      reject(new Error("EmailJS SDK loaded but window.emailjs is unavailable."));
    }

    function handleError() {
      emailJsLoadPromise = null;
      reject(new Error("Can not load EmailJS SDK."));
    }

    const existingScript = document.getElementById(EMAILJS_SCRIPT_ID) as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", handleReady, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = EMAILJS_SCRIPT_ID;
    script.async = true;
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.addEventListener("load", handleReady, { once: true });
    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);
  });

  return emailJsLoadPromise;
}

export async function getEmailJsBrowser(): Promise<EmailJsBrowser> {
  const emailjs = await loadEmailJsBrowser();
  if (!isEmailJsInitialized) {
    emailjs.init({
      publicKey: EMAILJS_PUBLIC_KEY
    });
    isEmailJsInitialized = true;
  }

  return emailjs;
}
