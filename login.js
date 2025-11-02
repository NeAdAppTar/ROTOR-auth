document.addEventListener('DOMContentLoaded', () => {
  // --- PBKDF2 настройки ---
  const DEFAULT_ITERATIONS = 200000;
  const DERIVED_KEY_BITS = 256;


  const leaders = {
    "Ivan_Trufanov": { salt: "b3f1e2a4c5d67890b1c2d3e4f5a6b7c8", hash: "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8", iterations: 200000 },
    "Альберт Саргсян": { salt: "d4c3b2a1908f7e6d5c4b3a2f1e0d9c8", hash: "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0", iterations: 200000 },
    "Arseniy_Matveenko": { salt: "c0ffee112233445566778899aabbccdd", hash: "0f1e2d3c4b5a69788796a5b4c3d2e1f00112233445566778899aabbccddeeff0", iterations: 200000 },
    "Aravan_Legends": { salt: "Bedniy", hash: "dedniy", iterations: 200000 }
  };

  // ---------- Сотрудники ----------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
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
  }

  // ---------- Руководители  ----------
  const leaderBtn = document.getElementById('leaderBtn');
  const leaderForm = document.getElementById('leaderForm');

  if (leaderBtn && leaderForm) {
    leaderBtn.addEventListener('click', () => {
      leaderForm.style.display = leaderForm.style.display === 'none' ? 'block' : 'none';
    });

    leaderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = document.getElementById('leaderLogin').value.trim();
      const password = document.getElementById('leaderPassword').value;

      if (!login) return alert('Введите логин руководителя');
      if (!password) return alert('Введите пароль');

      const entry = leaders[login];
      if (!entry) return alert('Неверный логин руководителя');

      try {
        const iterations = entry.iterations || DEFAULT_ITERATIONS;
        // WebCrypto
        let derivedHex;
        if (window.crypto && window.crypto.subtle) {
          const enc = new TextEncoder();
          const passBytes = enc.encode(password);
          const saltBytes = hexToUint8(entry.salt);

          const keyMaterial = await window.crypto.subtle.importKey(
            'raw', passBytes, { name: 'PBKDF2' }, false, ['deriveBits']
          );

          const derivedBits = await window.crypto.subtle.deriveBits(
            {
              name: 'PBKDF2',
              salt: saltBytes,
              iterations: iterations,
              hash: 'SHA-256'
            },
            keyMaterial,
            DERIVED_KEY_BITS
          );

          derivedHex = bufferToHex(derivedBits);
        } else if (window.CryptoJS && CryptoJS.PBKDF2) {
          // fallback на CryptoJS
          const derived = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(entry.salt), {
            keySize: DERIVED_KEY_BITS / 32,
            iterations: iterations,
            hasher: CryptoJS.algo.SHA256
          });
          derivedHex = derived.toString(CryptoJS.enc.Hex);
        } else {
          return alert('Криптографические возможности браузера недоступны. Используйте современный браузер или обратитесь к Ивану.');
        }

        if (timingSafeEqualHex(derivedHex, entry.hash)) {
          // успешный вход
          localStorage.setItem('username', login);
          localStorage.setItem('role', 'leader');
          document.cookie = `userLogin=${encodeURIComponent(login)}; path=/; domain=.rotorbus.ru; max-age=${60*60*24*7}`;
          window.location.href = `https://staff.rotorbus.ru/dashboard.html?user=${encodeURIComponent(login)}`;
        } else {
          alert('Неверный пароль');
        }
      } catch (err) {
        console.error(err);
        alert('Ошибка проверки пароля');
      }
    });
  }

  // вспомогательные функции
  function hexToUint8(hex) {
    if (!hex) return new Uint8Array();
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return bytes;
  }

  function bufferToHex(buffer) {
    const bytes = new Uint8Array(buffer);
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
      hex += bytes[i].toString(16).padStart(2, '0');
    }
    return hex;
  }

  function timingSafeEqualHex(a, b) {
    if (!a || !b || a.length !== b.length) return false;
    let res = 0;
    for (let i = 0; i < a.length; i++) {
      res |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return res === 0;
  }
});
