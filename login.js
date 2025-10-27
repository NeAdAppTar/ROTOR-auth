document.addEventListener('DOMContentLoaded', () => {
  const secretKey = "rotor_secret_key_2025";


  const leaders = {
    "Ivan_Trufanov": "U2FsdGVkX18YZL9X4AciAxyaG9EZlXQQj5Et8TnLN9k="
  };

  function setCookie(name, value) {
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 7}`;
    } catch (e) {
      console.warn('⚠️ Cookie не установлены (локальный запуск):', e);
    }
  }

  function redirectTo(url) {
    window.location.href = decodeURIComponent(url);
  }

  // ---------- обычный вход ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const login = document.getElementById('login').value.trim();
      if (!login) return alert('Введите логин');

      localStorage.clear();

      localStorage.setItem('username', login);
      localStorage.setItem('role', 'employee');
      setCookie('userLogin', login);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';
      redirectTo(redirect);
    });
  }

  // ---------- форма руководителя ----------
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
          localStorage.clear();

          localStorage.setItem('username', login);
          localStorage.setItem('role', 'leader');
          setCookie('userLogin', login);

          alert(`Добро пожаловать, ${login}!`);
          redirectTo('https://staff.rotorbus.ru/dashboard.html');
        } else {
          alert('Неверный пароль');
        }
      } catch (err) {
        console.error('Ошибка при проверке пароля:', err);
        alert('Ошибка проверки пароля');
      }
    });
  }

  //авто-перенаправление, если уже вошёл
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');


  if (username && role) {

    if (role === 'leader') {
      window.location.replace('https://staff.rotorbus.ru/leader_dashboard.html');
    } else {
      window.location.replace('https://rotorbus.ru/employee_dashboard.html');
    }
  }
});
