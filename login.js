async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');

  function showToast(message, color = 'rgba(255, 87, 34, 0.9)') {
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp('(^| )' + name + '=([^;]+)')
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  // если уже есть cookie — редирект
  const loggedUser = getCookie('userLogin');
  if (loggedUser) {
    window.location.href = 'https://dashboard.rotorprov.ru/index.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    const button = e.target.querySelector('button');

    if (!login || !password) {
      showToast('Введите логин и пароль');
      return;
    }

    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Проверка...';

    try {
      // ✅ НОВЫЙ ПРАВИЛЬНЫЙ API
      const response = await fetch(
        'https://rotorbus.ru/api/login/rotor',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: login,
            password: password
          })
        }
      );

      if (!response.ok) {
        throw new Error('HTTP ' + response.status);
      }

      const data = await response.json();

      if (data.status !== 'ok') {
        showToast(
          data.message || 'Неверный логин или пароль'
        );
        return;
      }

      // ✅ логин успешен
      const passHash = await sha256(password);

      const cookieOptions =
        'path=/; domain=.rotorprov.ru; max-age=' + 60 * 60 * 24 +
        '; samesite=None; secure';

      document.cookie =
        `userLogin=${encodeURIComponent(login)}; ${cookieOptions}`;
      document.cookie =
        `userHash=${encodeURIComponent(passHash)}; ${cookieOptions}`;

      const params = new URLSearchParams(window.location.search);
      const redirect =
        params.get('redirect') ||
        'https://dashboard.rotorprov.ru/index.html';

      window.location.href = decodeURIComponent(redirect);

    } catch (error) {
      console.error('Ошибка логина:', error);
      showToast('Ошибка соединения с сервером');
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
});
