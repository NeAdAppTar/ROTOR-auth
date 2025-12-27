// login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCW9kzlx94qJWkpphG3kGmVskHezLf6Bb0",
  authDomain: "rotorbus-ae2a5.firebaseapp.com",
  projectId: "rotorbus-ae2a5",
  appId: "1:363736805548:web:590cec31bb5671e115af09",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  const toast = document.getElementById("toast");

  function showToast(message, color = "rgba(255,87,34,0.9)") {
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
  }

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "https://dashboard.rotorprov.ru/index.html";
    }
  });

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = document.getElementById("login").value.trim();
    const password = document.getElementById("password").value.trim();
    const button = e.target.querySelector("button");

    if (!login || !password) {
      return showToast("Введите логин и пароль");
    }

    button.disabled = true;
    const oldText = button.textContent;
    button.textContent = "Проверка...";

    try {
      const email = `${login}@rotorprov.ru`;

      await signInWithEmailAndPassword(auth, email, password);

      const params = new URLSearchParams(window.location.search);
      const redirect =
        params.get("redirect") ||
        "https://dashboard.rotorprov.ru/index.html";

      window.location.href = decodeURIComponent(redirect);

    } catch (err) {
      console.error(err);

      if (err.code === "auth/invalid-credential") {
        showToast("Неверный логин или пароль");
      } else if (err.code === "auth/user-not-found") {
        showToast("Пользователь не найден");
      } else {
        showToast("Ошибка авторизации");
      }
    } finally {
      button.disabled = false;
      button.textContent = oldText;
    }
  });
});
