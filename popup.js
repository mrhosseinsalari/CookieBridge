document.getElementById('setCookieBtn').addEventListener('click', () => {
  const input = document.getElementById('cookieInput').value.trim();
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = '';

  if (!input) {
    messageDiv.textContent = 'لطفاً کوکی‌ را وارد کنید.';
    messageDiv.style.color = 'red';
    return;
  }

  let cookies;
  try {
    cookies = JSON.parse(input);
  } catch (err) {
    messageDiv.textContent = 'فرمت JSON معتبر نیست!';
    messageDiv.style.color = 'red';
    return;
  }

  chrome.runtime.sendMessage({ type: 'SET_COOKIES_FOR_X', cookies }, (response) => {
    if (response?.ok) {
      messageDiv.textContent = 'کوکی‌ با موفقیت ذخیره شد!';
      messageDiv.style.color = 'green';
    } else {
      messageDiv.textContent = 'خطا در ذخیره سازی کوکی: ' + (response?.error || 'نامشخص');
      messageDiv.style.color = 'red';
    }
  });
});
