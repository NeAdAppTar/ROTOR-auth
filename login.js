document.addEventListener('DOMContentLoaded', () => {
  const secretKey = "rotor_secret_key_2025";

  // Пароли руководителей (зашифрованы)
  const leaders = {
    "Ivan_Trufanov": "U2FsdGVkX18YZL9X4AciAxyaG9EZlXQQj5Et8TnLN9k="
    // можно добавить других
  };

  // ---------- Сотрудники ----------
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const login = document.getElementById('login').value.trim();
    if (!login) return alert('Введите логин');

    document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
    localStorage.setItem('username', login);
    localStorage.setItem('role', 'employee');

    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';
    window.location.href = decodeURIComponent(redirect);
  });

  // ---------- Руководители ----------
  const leaderBtn = document.getElementById('leaderBtn');
  const leaderForm = document.getElementById('leaderForm');

  leaderBtn.addEventListener('click', () => {
    leaderForm.style.display = leaderForm.style.display === 'none' ? 'block' : 'none';
  });

  leaderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const login = document.getElementById('leaderLogin').value.trim();
    const password = document.getElementById('leaderPassword').value.trim();

    if (!leaders[login]) return alert('Неверный логин руководителя');

    try {
      const decrypted = CryptoJS.AES.decrypt(leaders[login], secretKey).toString(CryptoJS.enc.Utf8);
      if (password === decrypted) {
        localStorage.setItem('username', login);
        localStorage.setItem('role', 'leader');
        document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
        window.location.href = `https://staff.rotorbus.ru/dashboard.html?user=${encodeURIComponent(login)}`;
      } else {
        alert('Неверный пароль');
      }
    } catch(err) {
      alert('Ошибка проверки пароля');
      console.error(err);
    }
  });
});
