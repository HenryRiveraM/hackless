
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

async function registerCompany(req, res) {
  try {
    const { nombre_empresa, industria, nit, nombre_admin, email_corporativo, password, confirmPassword } = req.body;
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Las contraseñas no coinciden'
      });
    }
    
    const company = await authService.registerCompany(
      nombre_empresa,
      industria,
      nit,
      nombre_admin,
      email_corporativo,
      password
    );
    
    res.status(201).json({
      success: true,
      message: 'Empresa registrada exitosamente',
      data: company
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
  registerCompany,
  login
};
