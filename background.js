// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message?.type !== "SET_COOKIES_FOR_X" &&
    message?.type !== "CLEAR_ALL_COOKIES_FOR_X"
  ) {
    return;
  }

  if (message?.type === "SET_COOKIES_FOR_X") {
    if (!message.cookies) {
      sendResponse({ ok: false, error: "cookies payload is missing" });
      return;
    }

    const domain = "x.com";
    const url = "https://" + domain + "/";
    const cookieEntries = Object.entries(message.cookies);

    // Get all cookie stores (includes incognito stores if extension allowed)
    chrome.cookies.getAllCookieStores((stores) => {
      // set cookies on every store (or filter stores if you want)
      const promises = [];

      for (const store of stores) {
        for (const [name, value] of cookieEntries) {
          promises.push(
            new Promise((resolve) => {
              chrome.cookies.set(
                {
                  url,
                  name,
                  value,
                  path: "/",
                  secure: true,
                  sameSite: "no_restriction", // or 'lax' / 'none' depending on need
                  storeId: store.id,
                  // httpOnly: true/false  -> set if you need (be careful)
                },
                (cookie) => {
                  if (chrome.runtime.lastError) {
                    resolve({
                      ok: false,
                      error: chrome.runtime.lastError.message,
                      storeId: store.id,
                      name,
                    });
                  } else {
                    resolve({ ok: true, cookie, storeId: store.id, name });
                  }
                }
              );
            })
          );
        }
      }

      Promise.all(promises)
        .then((results) => sendResponse({ ok: true, results }))
        .catch((err) => sendResponse({ ok: false, error: err }));
    });

    return true; // keep sendResponse async
  }

  // ✅ CLEAR ALL cookies for x.com
  if (message?.type === "CLEAR_ALL_COOKIES_FOR_X") {
    const domain = "x.com";

    chrome.cookies.getAllCookieStores((stores) => {
      const tasks = [];

      for (const store of stores) {
        tasks.push(
          new Promise((resolve) => {
            chrome.cookies.getAll({ domain, storeId: store.id }, (cookies) => {
              if (chrome.runtime.lastError) {
                resolve([
                  {
                    ok: false,
                    error: chrome.runtime.lastError.message,
                    storeId: store.id,
                  },
                ]);
                return;
              }

              const removals = cookies.map(
                (c) =>
                  new Promise((res) => {
                    const host = c.domain.startsWith(".")
                      ? c.domain.slice(1)
                      : c.domain;
                    const scheme = c.secure ? "https://" : "http://";
                    const url = scheme + host + (c.path || "/");

                    chrome.cookies.remove(
                      { url, name: c.name, storeId: store.id },
                      (details) => {
                        if (chrome.runtime.lastError) {
                          res({
                            ok: false,
                            error: chrome.runtime.lastError.message,
                            storeId: store.id,
                            name: c.name,
                          });
                        } else {
                          res({
                            ok: true,
                            removed: details,
                            storeId: store.id,
                            name: c.name,
                          });
                        }
                      }
                    );
                  })
              );

              Promise.all(removals).then(resolve);
            });
          })
        );
      }

      Promise.all(tasks)
        .then((all) => sendResponse({ ok: true, results: all.flat() }))
        .catch((err) => sendResponse({ ok: false, error: err }));
    });

    return true; // keep sendResponse async
  }
});
