import express from 'express';
import verifyJWT from '../middleware.js'

//Routes Imports
import register from './register.js';
import home from './home.js';
import login from './login.js';
import dashboard from './dashboard.js';
import editor from './editor.js';
import settings from './settings.js';

const router = express.Router();

//Routes
router.use('/', home);
router.use('/auth/register', register);
router.use('/auth/login', login);
router.use('/user/dashboard', verifyJWT, dashboard);
router.use('/user/editor', verifyJWT, editor);
router.use('/user/settings', verifyJWT, settings);

export default router;