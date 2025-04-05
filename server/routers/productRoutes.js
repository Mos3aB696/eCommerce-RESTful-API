import express from 'express';
import productController from '../controllers/productController.js';
import authController from '../controllers/authController.js';

const router = express.Router();

router
  .route('/')
  .get(productController.getAllProducts)
  .post(authController.protect, productController.createProduct);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

export default router;
