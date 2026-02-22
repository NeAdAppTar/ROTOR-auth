document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const form = document.getElementById('loginForm');
  const button = form.querySelector('button');

  let loginStep = true; // true = ввод логина, false = ввод пароля

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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = loginInput.value.trim();
    const password = passwordInput.value.trim();

    if (!login) {
      showToast('Введите логин');
      return;
    }

    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = 'Проверка...';

    try {
      // ШАГ 1 — проверяем существует ли пользователь
      if (loginStep) {
        const response = await fetch(
          'https://rotorbus.ru/api/users/rotor'
        );

        const data = await response.json();

        const user = data.users.find(u => u.name === login);

        if (!user) {
          showToast('Пользователь не найден');
          return;
        }

        // Показываем пароль
        passwordInput.style.display = 'block';
        passwordInput.required = true;
        passwordInput.focus();
        button.textContent = 'Войти';
        loginStep = false;
        return;
      }

      // ШАГ 2 — авторизация
      if (!password) {
        showToast('Введите пароль');
        return;
      }

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

      const data = await response.json();

      if (data.status !== 'ok') {
        showToast('Неверный пароль');
        return;
      }

      // Получаем данные пользователя
      const usersResponse = await fetch(
        'https://rotorbus.ru/api/users/rotor'
      );
      const usersData = await usersResponse.json();
      const user = usersData.users.find(u => u.name === login);

      const maxAge = 60 * 60 * 4;
      setCookie('userLogin', login, maxAge);
      setCookie('userPass', password, maxAge);

      console.log("LOGIN:", login);
      console.log("USER FOUND:", user);

      if (user.note && user.note.trim() === 'Требуется заполнение профиля') {
    window.location.href =
    'https://dashboard.rotorprov.ru/complete_profile.html';
    return;
    }

      window.location.href =
        'https://dashboard.rotorprov.ru/employee_dashboard.html';

    } catch (error) {
      console.error(error);
      showToast('Ошибка соединения с сервером');
    } finally {
      button.disabled = false;
      if (loginStep) button.textContent = oldText;
    }
  });
});