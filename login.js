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
