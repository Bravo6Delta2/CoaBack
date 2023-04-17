import express from 'express';
import user from '../controllers/user.js';
import admin from "../controllers/admin.js";

const router = express.Router();

router.route('/register')
    .post(user.registerUser)

router.route('/login')
    .post(user.loginUser)

router.route('/verifyEmail/:token')
    .get(user.verifyEmail)

router.route('/admin')
    .post(admin.loginAdmin)


export default router