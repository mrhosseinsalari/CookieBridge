function showMsg(text, color) {
  const messageDiv = document.getElementById("message");
  messageDiv.textContent = text;
  messageDiv.style.color = color;
}

function getAllStores() {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAllCookieStores((stores) => {
      if (chrome.runtime.lastError)
        reject(new Error(chrome.runtime.lastError.message));
      else resolve(stores || []);
    });
  });
}

function setCookie(details) {
  return new Promise((resolve) => {
    chrome.cookies.set(details, (cookie) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: chrome.runtime.lastError.message,
          details,
        });
      } else {
        resolve({ ok: true, cookie, details });
      }
    });
  });
}

function getAllCookies(filter) {
  return new Promise((resolve, reject) => {
    chrome.cookies.getAll(filter, (cookies) => {
      if (chrome.runtime.lastError)
        reject(new Error(chrome.runtime.lastError.message));
      else resolve(cookies || []);
    });
  });
}

function removeCookie(details) {
  return new Promise((resolve) => {
    chrome.cookies.remove(details, (removed) => {
      if (chrome.runtime.lastError) {
        resolve({
          ok: false,
          error: chrome.runtime.lastError.message,
          details,
        });
      } else {
        resolve({ ok: true, removed, details });
      }
    });
  });
}

// --- SET ---
document.getElementById("setCookieBtn").addEventListener("click", async () => {
  const input = document.getElementById("cookieInput").value.trim();

  if (!input) {
    showMsg("لطفاً کوکی‌ را وارد کنید.", "red");
    return;
  }

  let cookies;
  try {
    cookies = JSON.parse(input);
  } catch {
    showMsg("فرمت JSON معتبر نیست", "red");
    return;
  }

  const domain = "x.com";
  const url = "https://" + domain + "/";
  const entries = Object.entries(cookies);

  try {
    const stores = await getAllStores();
    const tasks = [];

    for (const store of stores) {
      for (const [name, value] of entries) {
        tasks.push(
          setCookie({
            url,
            name,
            value,
            path: "/",
            secure: true,
            sameSite: "no_restriction",
            storeId: store.id,
          })
        );
      }
    }

    const results = await Promise.all(tasks);
    const anyFail = results.some((r) => !r.ok);

    if (anyFail) {
      showMsg("خطایی رخ داده است", "red");
      console.log("SET results:", results);
    } else {
      showMsg("کوکی‌ با موفقیت ذخیره شد", "green");
    }
  } catch (e) {
    showMsg("خطا: " + e?.message || e, "red");
  }
});

// --- CLEAR ALL ---
document.getElementById("clearAllBtn").addEventListener("click", async () => {
  const domain = "x.com";

  try {
    const stores = await getAllStores();
    const allResults = [];

    for (const store of stores) {
      const cookies = await getAllCookies({ storeId: store.id });
      const targets = cookies.filter((c) => {
        const d = c.domain.startsWith(".") ? c.domain.slice(1) : c.domain;
        return d === "x.com" || d.endsWith(".x.com");
      });

      const removals = targets.map((c) => {
        const host = c.domain.startsWith(".") ? c.domain.slice(1) : c.domain;
        const scheme = c.secure ? "https://" : "http://";
        const path = c.path || "/";
        const url = scheme + host + path;

        return removeCookie({ url, name: c.name, storeId: store.id });
      });

      const results = await Promise.all(removals);
      allResults.push(...results);
    }

    const anyFail = allResults.some((r) => !r.ok);

    if (anyFail) {
      showMsg("خطایی رخ داده است", "red");
      console.log("CLEAR results:", allResults);
    } else {
      showMsg("کوکی ها با موفقیت حذف شدند", "green");
    }
  } catch (e) {
    showMsg("خطا: " + e?.message || e, "red");
  }
});
