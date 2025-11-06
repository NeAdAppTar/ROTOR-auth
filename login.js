document.addEventListener('DOMContentLoaded', () => {
  // Обработка входа сотрудника
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!login || !password) return alert('Введите логин и пароль');

    try {
      const response = await fetch('https://rotor.pythonanywhere.com/get-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login })
      });

      const data = await response.json();

      if (data.status === 'ok' && data.password === password) {
        // Авторизация успешна
        document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
        localStorage.setItem('username', login);
        localStorage.setItem('role', 'employee');

        // Переход на панель сотрудника
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';
        window.location.href = decodeURIComponent(redirect);

      } else {
        alert('Неверный логин или пароль');
      }

    } catch (error) {
      console.error('Ошибка при подключении к API:', error);
      alert('Ошибка соединения с сервером');
    }
  });

  // Кнопки
  document.getElementById("managerLogin").addEventListener("click", () => {
    window.location.href = "https://rotorbus.ru/uvehicles.html";
  });

  document.getElementById("helpBtn").addEventListener("click", () => {
    window.location.href = "https://rotorbus.ru/info.html";
  });
});
