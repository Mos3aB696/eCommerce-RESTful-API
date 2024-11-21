import express from 'express';
import productController from '../controllers/productController.js';

const router = express.Router();

// router.param('id', productController.checkId);

router
  .route('/')
  .get(productController.getAllProducts)
  .post(productController.createProduct);
router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(productController.deleteProduct);

export default router;
