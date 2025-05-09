const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
if (isDarkTheme) {
    document.documentElement.classList.add('dark-theme');
    document.body.classList.add('dark');
}

document.getElementById("moon").onclick = () => {
    document.documentElement.classList.toggle('dark-theme');
    const isDark = document.documentElement.classList.contains('dark-theme');
    localStorage.setItem('darkTheme', isDark);
}


function openAuthPopup(formType) {
    const dialog = document.querySelector('.auth-popup');
    const authContent = document.getElementById('auth-content');
    const errorElement = document.getElementById('errors');

    console.log(formType);
    errorElement.innerHTML = '';

    if (formType === 'login') {
        authContent.innerHTML = `
            <h2>Login</h2>
            <form id="auth-form" method="dialog">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button id="login" onclick="doLogin(event)">Login</button>
            </form>
            <p>Don't have an account? <a href="#" onclick="openAuthPopup('register')">Register here</a></p>
        `;
    } else if (formType === 'register') {
        authContent.innerHTML = `
            <h2>Register</h2>
            <form id="auth-form" method="dialog">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
                <button id="register" onclick="doRegister(event)">Register</button>
            </form>
            <p>Already have an account? <a href="#" onclick="openAuthPopup('login')">Login here</a></p>
        `;
    }

    dialog.showModal();
}

function closeAuthPopup() {
    const dialog = document.querySelector('.auth-popup');
    if (dialog) {
        dialog.close();
    }
}

async function doRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const dialog = document.querySelector('.auth-popup');
    const errorElement = document.getElementById('errors');

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const result = await response.text()

        if (!response.ok) {
            errorElement.style.color = 'red';
            errorElement.innerText = result || 'An error occurred during registration.';
        } else {
            dialog.close();
        }
    } catch (error) {
        errorElement.style.color = 'red';
        errorElement.innerText = 'An unexpected error occurred. Please try again.';
    }
}

async function doLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const dialog = document.querySelector('.auth-popup');
    const errorElement = document.getElementById('errors');

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });

        const result = await response.text();

        if (!response.ok) {
            errorElement.style.color = 'red';
            errorElement.innerText = result || 'Invalid username or password.';
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        errorElement.style.color = 'red';
        errorElement.innerText = 'An unexpected error occurred. Please try again.';
    }
}