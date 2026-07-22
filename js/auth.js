// Simple Auth Manager
const AUTH_KEY = 'attendance_system_logged_in';

function checkAuth() {
    const isLoginPage = window.location.pathname.endsWith('login.html');
    const isLoggedIn = localStorage.getItem(AUTH_KEY) === 'true';

    if (!isLoggedIn && !isLoginPage) {
        // Redirect to login page if trying to access protected pages while logged out
        window.location.href = 'login.html';
    } else if (isLoggedIn && isLoginPage) {
        // Redirect to dashboard if logged in and attempting to visit login page
        window.location.href = 'index.html';
    }
}

function login(username, password) {
    if ((username === 'longkousy18@gmail.com' || username === 'admin') && password === 'admin123') {
        localStorage.setItem(AUTH_KEY, 'true');
        return { success: true };
    }
    return { success: false, message: 'Invalid Email or Password!' };
}

function logout() {
    localStorage.removeItem(AUTH_KEY);
    window.location.href = 'login.html';
}

// Automatically check authentication when this script is loaded
checkAuth();
