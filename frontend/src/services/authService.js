
const API_URL = 'http://localhost:3000/api/auth';

/**
 * Registrar nueva empresa
 * @param {string} nombre_empresa - Nombre de la empresa
 * @param {string} industria - Industria
 * @param {string} nit - NIT/ID de la empresa
 * @param {string} nombre_admin - Nombre del administrador
 * @param {string} email_corporativo - Email corporativo
 * @param {string} password - Contraseña
 * @param {string} confirmPassword - Confirmación de contraseña
 * @returns {Promise<{success, message, company}>}
 */
async function registerCompany(nombre_empresa, industria, nit, nombre_admin, email_corporativo, password, confirmPassword) {
  try {
    const response = await fetch(`${API_URL}/register-company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre_empresa,
        industria,
        nit,
        nombre_admin,
        email_corporativo,
        password,
        confirmPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro de empresa');
    }

    if (data.data && data.data.id_usuario) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Registrar nuevo usuario
 * @param {string} nombre - Nombre del usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{success, message, user}>}
 */
async function register(nombre, email, password) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el registro');
    }

    if (data.data && data.data.id_usuario) {
      localStorage.setItem('user', JSON.stringify(data.data));
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Login de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<{success, message, token, user}>}
 */
async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }

    if (data.data && data.data.token) {
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
    }

    return data;
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Obtener token almacenado
 * @returns {string|null}
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Obtener usuario almacenado
 * @returns {object|null}
 */
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
function isAuthenticated() {
  return !!getToken();
}

/**
 * Login con Google (preparado para futura implementación)
 * Requiere:
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - GOOGLE_CALLBACK_URL
 */
async function loginWithGoogle() {
  try {
    // TODO: Implementar Google OAuth cuando estén configuradas las credenciales
    throw new Error('Login con Google aún no está configurado. Por favor, realiza login con email.');
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

/**
 * Login con SSO (preparado para futura implementación)
 */
async function loginWithSSO() {
  try {
    // TODO: Implementar SSO cuando estén configuradas las credenciales
    throw new Error('Login con SSO aún no está configurado. Por favor, realiza login con email.');
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}

export {
  register,
  registerCompany,
  login,
  logout,
  getToken,
  getUser,
  isAuthenticated,
  loginWithGoogle,
  loginWithSSO,
};
