import express from 'express'
import userController from '../controller/User.js';

const router = express.Router()
router.post('/create',userController.create)
router.post('/login',userController.login)
router.post('/forget',userController.forgotPassword)
router.post('/reset',userController.resetPassword)
export default router