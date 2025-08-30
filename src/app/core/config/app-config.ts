export const AGENT_IFRAME_URL = 'https://udify.app/chatbot/9FLUTdD0hszkzdTC';

// Derived origin used for postMessage targetOrigin safety if needed
export const AGENT_IFRAME_ORIGIN = (() => {
  try {
    return new URL(AGENT_IFRAME_URL).origin;
  } catch {
    return '*';
  }
})();

