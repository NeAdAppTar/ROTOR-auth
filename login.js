document.addEventListener('DOMContentLoaded', () => {
  const leaderBtn = document.getElementById('leaderBtn');
  const leaderForm = document.getElementById('leaderForm');

  leaderBtn.addEventListener('click', () => {
    leaderForm.style.display = leaderForm.style.display === 'none' ? 'block' : 'none';
  });

  leaderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const login = document.getElementById('leaderLogin').value.trim();
    const password = document.getElementById('leaderPassword').value.trim();

    if (!login || !password) {
      return alert('Введите логин и пароль');
    }

    try {
      // Запрос к API
      const response = await fetch('https://rotor.pythonanywhere.com/get-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ login })
      });

      const data = await response.json();

      if (data.status === 'ok') {
        if (data.password === password) {
          // Сохраняем сессию
          localStorage.setItem('username', login);
          localStorage.setItem('role', 'leader');
          document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
          window.location.href = `https://staff.rotorbus.ru/dashboard.html?user=${encodeURIComponent(login)}`;
        } else {
          alert('Неверный пароль');
        }
      } else {
        alert(data.message || 'Пользователь не найден');
      }
    } catch (err) {
      console.error(err);
      alert('Ошибка проверки пароля');
    }
  });
});
