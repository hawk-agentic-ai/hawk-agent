export const AGENT_IFRAME_URL = 'https://udify.app/chatbot/9FLUTdD0hszkzdTC';
// For now, always use the direct URL provided
export const RESOLVED_AGENT_IFRAME_URL = AGENT_IFRAME_URL;
// Derived origin used for postMessage targetOrigin safety if needed
export const AGENT_IFRAME_ORIGIN = (() => {
    try {
        return new URL(AGENT_IFRAME_URL).origin;
    }
    catch {
        return '*';
    }
})();
//# sourceMappingURL=app-config.js.map