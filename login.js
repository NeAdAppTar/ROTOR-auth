document.addEventListener('DOMContentLoaded', () => {
  const toast = document.getElementById('toast');

  const leaders = [
    'Ivan_Trufanov',
    'Dmitry_Beloozerov',
    'Альберт Саргсян',
    'Arseniy_Matveenko',
    'Aravan_Legends'
  ];

  function showToast(message, color = 'rgba(255, 87, 34, 0.9)') {
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
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
      const response = await fetch('https://rotor.pythonanywhere.com/get-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login })
      });

      const data = await response.json();

      if (data.status === 'ok' && (data.password === password || (!data.password && !password))) {
        // роль
        const role = leaders.includes(login) ? 'leader' : 'employee';

        document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
        document.cookie = `userRole=${role}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
        localStorage.setItem('username', login);
        localStorage.setItem('role', role);

        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || 'https://dashboard.rotorbus.ru/index.html';
        window.location.href = decodeURIComponent(redirect);

      } else {
        showToast('Неверный логин или пароль');
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
