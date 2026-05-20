
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');
const companyRepository = require('../repositories/companyRepository');

async function register(nombre, email, password) {
  if (!nombre || !email || !password) {
    throw new Error('Nombre, email y contraseña son requeridos');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Email inválido');
  }
  
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new Error('El email ya está registrado');
  }
  
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);
  
  const user = await userRepository.create(nombre, email, passwordHash);
  
  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol
  };
}

async function registerCompany(nombre_empresa, industria, nit, nombre_admin, email_corporativo, password) {
  // Validaciones básicas
  if (!nombre_empresa || !industria || !nit || !nombre_admin || !email_corporativo || !password) {
    throw new Error('Todos los campos son requeridos');
  }
  
  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email_corporativo)) {
    throw new Error('Email corporativo inválido');
  }
  
  // Validar longitud de contraseña
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  
  // Validar que nombre_empresa no sea muy corto
  if (nombre_empresa.trim().length < 3) {
    throw new Error('El nombre de empresa debe tener al menos 3 caracteres');
  }
  
  // Validar que NIT no esté vacío
  if (nit.trim().length < 2) {
    throw new Error('El NIT debe ser válido');
  }
  
  // Verificar que el NIT sea único
  try {
    const existingByNit = await companyRepository.findByNit(nit);
    if (existingByNit) {
      throw new Error('Este NIT ya está registrado');
    }
  } catch (error) {
    if (error.message.includes('ya está registrado')) {
      throw error;
    }
    throw new Error('Error al verificar NIT: ' + error.message);
  }
  
  // Verificar que el email corporativo sea único
  try {
    const existingByEmail = await companyRepository.findByEmail(email_corporativo);
    if (existingByEmail) {
      throw new Error('Este email corporativo ya está registrado');
    }
  } catch (error) {
    if (error.message.includes('ya está registrado')) {
      throw error;
    }
    throw new Error('Error al verificar email: ' + error.message);
  }
  
  // Crear usuario y empresa
  let user, company;
  
  try {
    // Encriptar contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Crear usuario
    user = await userRepository.create(nombre_admin, email_corporativo, passwordHash, 'usuario');
    
    if (!user || !user.id_usuario) {
      throw new Error('Error al crear usuario');
    }
    
    // Crear empresa vinculada al usuario
    company = await companyRepository.create(
      user.id_usuario,
      nombre_empresa,
      industria,
      nit,
      nombre_admin,
      email_corporativo
    );
    
    if (!company || !company.id_empresa) {
      throw new Error('Error al crear empresa');
    }
    
    return {
      id_usuario: user.id_usuario,
      id_empresa: company.id_empresa,
      nombre_empresa: company.nombre_empresa,
      email_corporativo: company.email_corporativo,
      nombre_admin: company.nombre_admin,
      rol: user.rol
    };
    
  } catch (error) {
    // Si la empresa falló pero el usuario se creó, el error ya está registrado
    // El usuario existirá en la BD pero sin empresa vinculada
    throw error;
  }
}

async function login(email, password) {
  if (!email || !password) {
    throw new Error('Email y contraseña son requeridos');
  }
  
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('Credenciales inválidas');
  }
  
  if (user.estado !== 1) {
    throw new Error('Usuario desactivado');
  }
  
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    throw new Error('Credenciales inválidas');
  }
  
  // Verificar que JWT_SECRET esté configurado
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('Error de configuración: JWT_SECRET no definido');
  }
  
  const token = jwt.sign(
    { 
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol
    },
    jwtSecret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  
  const company = await companyRepository.findByUserId(user.id_usuario);

  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      id_empresa: company?.id_empresa || null,
      nombre_empresa: company?.nombre_empresa || null
    }
  };
}

function verifyToken(token) {
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('Error de configuración: JWT_SECRET no definido');
    }
    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Obtener usuario por ID
 */
async function obtenerUsuario(idUsuario) {
  if (!idUsuario || isNaN(idUsuario)) {
    throw new Error('ID de usuario inválido');
  }
  
  const user = await userRepository.findById(idUsuario);
  if (!user) {
    throw new Error('Usuario no existe');
  }
  
  const company = await companyRepository.findByUserId(idUsuario);

  return {
    id_usuario: user.id_usuario,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    id_empresa: company?.id_empresa || null,
    nombre_empresa: company?.nombre_empresa || null
  };
}

module.exports = {
  register,
  registerCompany,
  login,
  verifyToken,
  obtenerUsuario
};
