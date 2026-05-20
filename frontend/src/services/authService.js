import { request } from './apiClient';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

function storeSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

async function registerCompany(nombre_empresa, industria, nit, nombre_admin, email_corporativo, password, confirmPassword) {
  try {
    const response = await request('/auth/register-company', {
      method: 'POST',
      auth: false,
      body: {
        nombre_empresa,
        industria,
        nit,
        nombre_admin,
        email_corporativo,
        password,
        confirmPassword,
      },
    });

    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

async function register(nombre, email, password) {
  try {
    const response = await request('/auth/register', {
      method: 'POST',
      auth: false,
      body: { nombre, email, password },
    });

    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

async function login(email, password) {
  try {
    const response = await request('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });

    if (response.data?.token) {
      storeSession(response.data);
    }

    return response;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

async function refreshCurrentUser() {
  const response = await request('/auth/me');
  if (response.data) {
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
  }
  return response.data;
}

function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function getUser() {
  const user = localStorage.getItem(USER_KEY);
  if (!user) return null;

  try {
    return JSON.parse(user);
  } catch {
    logout();
    return null;
  }
}

function isAuthenticated() {
  return Boolean(getToken());
}

async function loginWithGoogle() {
  return {
    success: false,
    message: 'Login con Google aún no está configurado. Por favor, realiza login con email.',
  };
}

async function loginWithSSO() {
  return {
    success: false,
    message: 'Login con SSO aún no está configurado. Por favor, realiza login con email.',
  };
}

export {
  getToken,
  getUser,
  isAuthenticated,
  login,
  loginWithGoogle,
  loginWithSSO,
  logout,
  refreshCurrentUser,
  register,
  registerCompany,
};
