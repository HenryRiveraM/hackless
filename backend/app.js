var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var rateLimit = require('express-rate-limit');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var authRouter = require('./routes/auth');
var empleadosRouter = require('./routes/empleados');
var reportesRouter = require('./routes/reportes');
var configuracionRouter = require('./routes/configuracion');
var alertasRouter = require('./routes/alertas');
var incidenciasRouter = require('./routes/incidencias');
var historialAlertasRouter = require('./routes/historialAlertasRoutes');
var dashboardRouter = require('./routes/dashboardRoutes');
var auditoriasRouter = require('./routes/auditoriasRoutes');
var capacitacionRouter = require('./routes/capacitacionRoutes');
var ayudaRouter = require('./routes/ayudaRoutes');
var phishingRouter = require('./routes/phishingRoutes');

// Rate limiting para proteger endpoints de autenticación
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos
  message: 'Demasiados intentos de acceso. Intente más tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting general (más permisivo)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  standardHeaders: true,
  legacyHeaders: false
});

var app = express();

// Configuración de CORS para permitir peticiones desde el frontend
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(cors(corsOptions));
app.use(apiLimiter); // Rate limit general para todos los endpoints
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/empleados', empleadosRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/configuracion', configuracionRouter);
app.use('/api/alertas', alertasRouter);
app.use('/api/incidencias', incidenciasRouter);
app.use('/api/historial-alertas', historialAlertasRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/auditorias', auditoriasRouter);
app.use('/api/capacitacion', capacitacionRouter);
app.use('/api/ayuda', ayudaRouter);
app.use('/api/phishing', phishingRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
