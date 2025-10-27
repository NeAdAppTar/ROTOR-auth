document.addEventListener('DOMContentLoaded', () => {

  const secretKey = "rotor_secret_key_2025";

  const leaders = {
  "Ivan_Trufanov": "U2FsdGVkX18YZL9X4AciAxyaG9EZlXQQj5Et8TnLN9k=",
  };

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const login = document.getElementById('login').value.trim();
      if (!login) {
        alert('Введите логин');
        return;
      }

      try {
        document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; max-age=${60 * 60 * 24 * 7}`;
      } catch (err) {
        console.warn('Cookie не установлены:', err);
      }

      localStorage.setItem('username', login);
      localStorage.removeItem('role');

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';

      window.location.href = decodeURIComponent(redirect);
    });
  }

  const leaderBtn = document.getElementById('leaderBtn');
  const leaderForm = document.getElementById('leaderForm');

  if (leaderBtn && leaderForm) {
    leaderBtn.addEventListener('click', () => {
      leaderForm.style.display = leaderForm.style.display === 'none' ? 'block' : 'none';
    });

    leaderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const login = document.getElementById('leaderLogin').value.trim();
      const password = document.getElementById('leaderPassword').value.trim();

      if (!leaders[login]) {
        alert('Неверный логин руководителя');
        return;
      }

      try {
        const decrypted = CryptoJS.AES.decrypt(leaders[login], secretKey).toString(CryptoJS.enc.Utf8);

        if (password === decrypted) {
          localStorage.setItem('username', login);
          localStorage.setItem('role', 'leader');
          document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; max-age=${60 * 60 * 24 * 7}`;
          window.location.href = "https://staff.rotorbus.ru/dashboard.html";
        } else {
          alert('Неверный пароль');
        }
      } catch (err) {
        console.error('Ошибка при проверке пароля:', err);
        alert('Ошибка проверки пароля');
      }
    });
  }
});
