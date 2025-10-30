# 🍪 CookieBridge

**CookieBridge** is a simple Chrome Extension that allows you to manually import and set cookies for `x.com` (e.g., Twitter).  
It enables quick account switching or authentication testing without using any APIs.

---

## 🚀 Features

- Paste and apply cookies directly via the extension popup  
- Sets cookies securely for `https://x.com`  
- Lightweight, pure JavaScript (no frameworks)  
- Optional Incognito mode support  
- Clean minimal UI with Persian font styling

---

## 📦 Project Structure

```
CookieBridge/
├── manifest.json
├── background.js
├── content_script.js
├── popup.html
├── popup.js
├── style.css
└── icons/
```

---

## ⚙️ Installation

1. Extract the project files.
2. Go to `chrome://extensions/`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder
5. The extension will appear as **CookieBridge**

---

## 🧭 Usage

1. Copy your cookie data (as JSON or key=value pairs)
2. Open **CookieBridge** popup
3. Paste cookies into the input field
4. Click **Apply Cookies**
5. Open `https://x.com` and you should be logged in automatically

---

## 🔍 Debugging

- Go to `chrome://extensions/`
- Find **CookieBridge**
- Click **Service Worker → Inspect**
- Check logs or errors in the console

---

## ⚠️ Notes

- Cookies in Incognito mode are temporary  
- To logout completely, remove cookies manually or disable the extension  
- Do **not** share personal cookies — use this tool only for development/testing

---

## 🪪 License

Released under the MIT License.
