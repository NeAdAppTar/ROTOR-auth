const secretKey = "rotor_secret_key_2025";

// БД
const leaders = {
  "Ivan_Trufanov": "U2FsdGVkX18YZL9X4AciAxyaG9EZlXQQj5Et8TnLN9k=",
};

// ===== обычный вход =====
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const login = document.getElementById('login').value.trim();
  if (!login) return alert('Введите логин');

  try {
    document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; max-age=${60 * 60 * 24 * 7}`;
  } catch(e) {
    console.warn('Cookie не установлены локально');
  }

  localStorage.setItem('username', login);
  localStorage.removeItem('role');

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';
  window.location.href = decodeURIComponent(redirect);
});

document.getElementById('leaderBtn').addEventListener('click', () => {
  document.getElementById('leaderForm').style.display = 'block';
});

// ===== вход руководителя =====
document.getElementById('leaderForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const login = document.getElementById('leaderLogin').value.trim();
  const password = document.getElementById('leaderPassword').value.trim();

  if (!leaders[login]) return alert('Неверный логин руководителя');

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
    console.error(err);
    alert('Ошибка проверки пароля');
  }
});
