// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== 'SET_COOKIES_FOR_X' || !message.cookies) {
    return;
  }

  const domain = 'x.com';
  const url = 'https://' + domain + '/';
  const cookieEntries = Object.entries(message.cookies);

  // Get all cookie stores (includes incognito stores if extension allowed)
  chrome.cookies.getAllCookieStores((stores) => {
    // set cookies on every store (or filter stores if you want)
    const promises = [];

    for (const store of stores) {
      for (const [name, value] of cookieEntries) {
        promises.push(new Promise((resolve) => {
          chrome.cookies.set({
            url,
            name,
            value: String(value),
            path: '/',
            secure: true,
            sameSite: 'no_restriction', // or 'lax' / 'none' depending on need
            storeId: store.id,
            // httpOnly: true/false  -> set if you need (be careful)
          }, (cookie) => {
            if (chrome.runtime.lastError) {
              resolve({ ok: false, error: chrome.runtime.lastError.message, storeId: store.id, name });
            } else {
              resolve({ ok: true, cookie, storeId: store.id, name });
            }
          });
        }));
      }
    }

    Promise.all(promises)
      .then(results => sendResponse({ ok: true, results }))
      .catch(err => sendResponse({ ok: false, error: String(err) }));

  });

  return true; // keep sendResponse async
});
