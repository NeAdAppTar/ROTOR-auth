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

  function setCookie(name, value, maxAgeSeconds) {
    const cookieOptions =
      'path=/; domain=.rotorprov.ru; max-age=' + maxAgeSeconds +
      '; samesite=None; secure';
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`;
  }

  // если уже есть cookie — редирект
  const loggedUser = getCookie('userLogin');
  const loggedPass = getCookie('userPass');
  if (loggedUser && loggedPass) {
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

      if (!response.ok) throw new Error('HTTP ' + response.status);

      const data = await response.json();

      if (data.status !== 'ok') {
        showToast(data.message || 'Неверный логин или пароль');
        return;
      }

      const maxAge = 60 * 60 * 4; // 4 часа
      setCookie('userLogin', login, maxAge);
      setCookie('userPass', password, maxAge);

      await new Promise(r => setTimeout(r, 150)); // чтоб куки сохранились нормально

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
