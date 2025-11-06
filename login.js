document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "https://auth.rotorbus.ru/get-password";

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const login = document.getElementById('login').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!login || !password) {
      alert('Введите логин и пароль');
      return;
    }

    try {
      // ⚙️ Отправляем GET-запрос
      const response = await fetch(`${API_URL}?login=${encodeURIComponent(login)}`);

      // Проверяем статус HTTP
      if (!response.ok) {
        alert(`Ошибка запроса: ${response.status}`);
        return;
      }

      // Парсим JSON
      const data = await response.json();

      if (data.status === "error") {
        alert(data.message || "Пользователь не найден");
        return;
      }

      if (data.status === "ok") {
        if (data.password === password) {
          // ✅ Успешный вход
          document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
          localStorage.setItem('username', login);
          localStorage.setItem('role', 'employee');

          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';
          window.location.href = decodeURIComponent(redirect);
        } else {
          alert('Неверный пароль');
        }
      }
    } catch (err) {
      console.error('Ошибка при обращении к серверу:', err);
      alert('Ошибка соединения с сервером или формат ответа неверен');
    }
  });
});
