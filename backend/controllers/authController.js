
const authService = require('../services/authService');

async function register(req, res) {
  try {
    const { nombre, email, password } = req.body;
    
    const user = await authService.register(nombre, email, password);
    
    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      data: result
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
}

module.exports = {
  register,
  login
};
