// content_script.js
window.addEventListener(
  "message",
  (ev) => {
    try {
      const msg = ev.data;

      if (msg && msg.type === "SET_COOKIES_FOR_X") {
        // forward to background
        chrome.runtime.sendMessage(msg, (resp) => {
          // optionally post back a response
          window.postMessage(
            { type: "SET_COOKIES_FOR_X_RESULT", result: resp },
            "*"
          );
        });
      }

      if (msg && msg.type === "CLEAR_ALL_COOKIES_FOR_X") {
        // forward to background
        chrome.runtime.sendMessage(msg, (resp) => {
          // optionally post back a response
          window.postMessage(
            { type: "CLEAR_ALL_COOKIES_FOR_X_RESULT", result: resp },
            "*"
          );
        });
      }
    } catch (e) {
      console.error(e);
    }
  },
  false
);
