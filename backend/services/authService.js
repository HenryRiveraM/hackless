
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

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
  
  const token = jwt.sign(
    { 
      id_usuario: user.id_usuario,
      email: user.email,
      rol: user.rol
    },
    process.env.JWT_SECRET || 'clave_secreta_segura',
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
  
  return {
    token,
    user: {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  };
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'clave_secreta_segura');
    return decoded;
  } catch (error) {
    return null;
  }
}

module.exports = {
  register,
  login,
  verifyToken
};
