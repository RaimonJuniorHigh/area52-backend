import { Router } from 'express';
import { register } from './src/controllers/RegisterController';
import { login } from './src/controllers/LoginController';    

const router = Router();
router.post('/register', register);
router.post('/login', login);
export default router;