document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');

  function showToast(message, color = 'rgba(255, 87, 34, 0.9)') {
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  const loggedUser = getCookie('userLogin');

  if (loggedUser) {
    window.location.href = 'https://dashboard.rotorbus.ru/index.html';
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();
    const button = e.target.querySelector('button');

    if (!login) return showToast('Введите логин');

    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Проверка...';

    try {
      const response = await fetch('https://transdigital.pythonanywhere.com/api/get_user/rotor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: login })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        const correctPassword = data.password || '';

        if (correctPassword === password) {

          const cookieOptions =
            'path=/; domain=.rotorbus.ru; max-age=' +
            (60 * 60 * 24 * 7) +
            '; samesite=None; secure';

          document.cookie = `userLogin=${encodeURIComponent(login)}; ${cookieOptions}`;
          document.cookie = `userRole=employee; ${cookieOptions}`; // роль пока одна

          localStorage.setItem('userLogin', login);
          localStorage.setItem('role', 'employee');

          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || 'https://dashboard.rotorbus.ru/index.html';
          window.location.href = decodeURIComponent(redirect);

        } else {
          showToast('Неверный пароль');
        }

      } else {
        showToast('Пользователь не найден');
      }

    } catch (error) {
      console.error('Ошибка при подключении к API:', error);
      showToast('Ошибка соединения с сервером');
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
});