import express from 'express';
import userController from '../controllers/userController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', authController.signUp);
router.patch(
  '/regenerateEmailToken',
  authController.protect,
  authController.regenerateEmailToken
);
router.patch('/verifyEmail/:token', authController.verifyEmail);
router.post('/login', authController.login);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateUser', authController.protect, userController.updateUser);
router.delete('/deleteUser', authController.protect, userController.deleteUser);

router.route('/').get(authController.protect, userController.getAllUsers);
router.route('/:id').get(userController.getUser);

export default router;
