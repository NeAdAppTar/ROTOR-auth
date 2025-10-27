// --- Обычный вход ---
document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const login = document.getElementById('login').value.trim();
  if (!login) return alert('Введите логин');

  document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60 * 60 * 24 * 7}`;
  localStorage.setItem('username', login);

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';

  window.location.href = decodeURIComponent(redirect);
});


// --- Руководители ---
const secretKey = "rotor_secret_key_2025"; // ключ для шифрования

// Пример: создаем "базу данных" руководителей
// Пароли зашифрованы AES
const leaders = {
  "director": "U2FsdGVkX1+t4E7v79UnrJv7lRbB4xqg6+9c9XkI4PU=", // пароль: rotor123
  "manager": "U2FsdGVkX18gV7Yq0Awtr93yGL8TgDTCmR+IoqiqiRA="  // пароль: bus456
};

// Показать форму
document.getElementById('leaderBtn').addEventListener('click', () => {
  document.getElementById('leaderForm').style.display = 'block';
});

// Проверка входа руководителя
document.getElementById('leaderForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const login = document.getElementById('leaderLogin').value.trim();
  const password = document.getElementById('leaderPassword').value.trim();

  if (!leaders[login]) {
    alert('Неверный логин руководителя');
    return;
  }

  // Дешифруем пароль
  const decrypted = CryptoJS.AES.decrypt(leaders[login], secretKey).toString(CryptoJS.enc.Utf8);

  if (password === decrypted) {
    localStorage.setItem('username', login);
    localStorage.setItem('role', 'leader');
    document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60 * 60 * 24 * 7}`;
    alert('Добро пожаловать, руководитель!');
    window.location.href = "https://staff.rotorbus.ru/dashboard.html";
  } else {
    alert('Неверный пароль');
  }
});
