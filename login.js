document.addEventListener('DOMContentLoaded', () => {

  const params = new URLSearchParams(window.location.search);
  const redirectUrl = params.get('redirect');
  const toast = document.getElementById('toast');
  const loginInput = document.getElementById('login');
  const passwordInput = document.getElementById('password');
  const form = document.getElementById('loginForm');
  const button = form.querySelector('button');

  let loginStep = true;

  function showToast(message, color = 'rgba(255, 87, 34, 0.9)') {
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function setCookie(name, value, maxAgeSeconds) {
    const cookieOptions =
      'path=/; domain=.rotorprov.ru; max-age=' + maxAgeSeconds +
      '; samesite=None; secure';
    document.cookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions}`;
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

      // 1
      if (loginStep) {

        const response = await fetch(
          'https://api.rotorbus.ru/users/rotor'
        );

        if (!response.ok) throw new Error();

        const data = await response.json();

        const user = data.users.find(
          u => u.name &&
          u.name.trim().toLowerCase() === login.toLowerCase()
        );

        if (!user) {
          showToast('Пользователь не найден');
          return;
        }

        const noteText = (user.note || '')
          .toString()
          .toLowerCase()
          .trim();

        const needsProfileCompletion =
          noteText.includes('заполн') &&
          noteText.includes('профил');

        if (needsProfileCompletion) {
          const maxAge = 60 * 60 * 4;
          setCookie('userLogin', login, maxAge);
          window.location.href =
            'https://auth.rotorprov.ru/complete_profile.html'; 
          return;
        }

        // показ пароля
        passwordInput.style.display = 'block';
        passwordInput.required = true;
        passwordInput.focus();

        button.textContent = 'Войти';
        loginStep = false;
        return;
      }

      // 2
      if (!password) {
        showToast('Введите пароль');
        return;
      }

      const response = await fetch(
        'https://api.rotorbus.ru/login/rotor',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: login,
            password: password
          })
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();

      if (data.status !== 'ok') {
        showToast('Неверный логин или пароль');
        return;
      }

      const maxAge = 60 * 60 * 4;
      setCookie('userLogin', login, maxAge);
      setCookie('userPass', password, maxAge);

      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        window.location.href =
          'https://dashboard.rotorprov.ru/employee_dashboard.html';
      }

    } catch (error) {
      console.error(error);
      showToast('Ошибка соединения с сервером');
    } finally {
      button.disabled = false;

      if (loginStep) {
        button.textContent = oldText;
      } else {
        button.textContent = 'Войти';
      }
    }
  });
});