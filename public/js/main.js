console.log('Dan\'koAuto — Добро пожаловать!');

// Проверяем, если уже авторизован - перенаправляем на главную
const token = localStorage.getItem('token');
if (token) {
    // Проверяем валидность токена
    fetch('/profile/api/user', {
        headers: { 'Authorization': `Bearer ${token}` }
    }).then(res => {
        if (res.ok) {
            window.location.href = '/';
        }
    }).catch(() => {});
}

const signinForm = document.querySelector(".form.signin");
const signupForm = document.querySelector(".form.signup");
const cardBg1 = document.querySelector(".card-bg-1");
const cardBg2 = document.querySelector(".card-bg-2");
const brandOverlay = document.getElementById("brandOverlay");

const toggleView = () => {
    const signinActive = signinForm.classList.contains("active");
    
    signinForm.classList.toggle("active", !signinActive);
    signupForm.classList.toggle("active", signinActive);
    
    if (brandOverlay) {
        if (signinActive) {
            brandOverlay.classList.remove("signup-position");
            brandOverlay.classList.add("signin-position");
        } else {
            brandOverlay.classList.remove("signin-position");
            brandOverlay.classList.add("signup-position");
        }
    }
    
    [cardBg1, cardBg2].forEach((el) => 
        el.classList.toggle("signin", signinActive)
    );
    [cardBg1, cardBg2].forEach((el) => 
        el.classList.toggle("signup", !signinActive)
    );
};

if (brandOverlay) {
    brandOverlay.classList.add("signin-position");
}

// Регистрация
document.querySelector(".signup form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = e.target.querySelector("input[placeholder='Имя']").value;
    const email = e.target.querySelector("input[placeholder='Электронная почта']").value;
    const password = e.target.querySelector("input[placeholder='Пароль']").value;

    if (!name || !email || !password) {
        alert("Пожалуйста, заполните все поля");
        return;
    }

    if (password.length < 6) {
        alert("Пароль должен быть не менее 6 символов");
        return;
    }

    try {
        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert(`✅ ${data.message}`);
            window.location.href = "/";
        } else {
            alert(`❌ ${data.error || "Ошибка регистрации"}`);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Ошибка сервера. Попробуйте позже.");
    }
});

// Логин
document.querySelector(".signin form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.querySelector("input[placeholder='Электронная почта']").value;
    const password = e.target.querySelector("input[placeholder='Пароль']").value;

    if (!email || !password) {
        alert("Пожалуйста, заполните email и пароль");
        return;
    }

    try {
        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (res.ok) {
            localStorage.setItem("token", data.token);
            alert(`✅ Добро пожаловать, ${data.user.name}!`);
            window.location.href = "/";
        } else {
            alert(`❌ ${data.error || "Ошибка входа"}`);
        }
    } catch (error) {
        console.error(error);
        alert("❌ Ошибка сервера. Попробуйте позже.");
    }
});