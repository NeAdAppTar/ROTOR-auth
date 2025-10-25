document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const login = document.getElementById('login').value.trim();
  if (!login) return alert('Введите логин');

  // cookie
  document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60 * 60 * 24 * 7}`;

  const params = new URLSearchParams(window.location.search);
  const redirect = params.get('redirect') || 'https://rotorbus.ru/employee_dashboard.html';

  window.location.href = decodeURIComponent(redirect);
});
