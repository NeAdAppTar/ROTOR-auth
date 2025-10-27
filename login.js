document.addEventListener('DOMContentLoaded', () => {
  const secretKey = "rotor_secret_key_2025";

  const leaders = {
    "Ivan_Trufanov": "U2FsdGVkX18YZL9X4AciAxyaG9EZlXQQj5Et8TnLN9k="
  };

  function setCookie(name, value) {
    try {
      document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${60*60*24*7}`;
    } catch(e) { console.warn(e); }
  }

  function redirectTo(url) { window.location.href = url; }

  // ---------- Обычные сотрудники ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      const login = document.getElementById('login').value.trim();
      if (!login) return alert('Введите логин');

      localStorage.clear();
      localStorage.setItem('username', login);
      localStorage.setItem('role', 'employee');
      setCookie('userLogin', login);

      redirectTo('https://rotorbus.ru/employee_dashboard.html');
    });
  }

  // ---------- Руководители ----------
  const leaderBtn = document.getElementById('leaderBtn');
  const leaderForm = document.getElementById('leaderForm');

  if (leaderBtn && leaderForm) {
    leaderBtn.addEventListener('click', () => {
      leaderForm.style.display = leaderForm.style.display === 'none' ? 'block' : 'none';
    });

    leaderForm.addEventListener('submit', e => {
      e.preventDefault();
      const login = document.getElementById('leaderLogin').value.trim();
      const password = document.getElementById('leaderPassword').value.trim();

      if (!leaders[login]) { return alert('Неверный логин руководителя'); }

      try {
        const decrypted = CryptoJS.AES.decrypt(leaders[login], secretKey).toString(CryptoJS.enc.Utf8);
        if (password === decrypted) {
          localStorage.clear();
          localStorage.setItem('username', login);
          localStorage.setItem('role', 'leader');
          setCookie('userLogin', login);

          redirectTo('https://staff.rotorbus.ru/dashboard.html');
        } else {
          alert('Неверный пароль');
        }
      } catch(e) { alert('Ошибка проверки пароля'); console.error(e); }
    });
  }
});
