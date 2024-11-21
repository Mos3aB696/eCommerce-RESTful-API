import httpStatusText from '../utils/httpStatusText.js';
import Product from '../models/productsModel.js';
import ApiFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

const getAllProducts = asyncWrapper(async (req, res, next) => {
  const features = new ApiFeatures(Product.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    count: products.length,
    data: {
      products,
    },
  });
});

const getProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const feature = new ApiFeatures(
    Product.findById(id),
    req.query
  ).limitFields();
  const product = await feature.query;

  if (!product) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Product not found..🥲'
    );
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      product,
    },
  });
});

const createProduct = asyncWrapper(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  newProduct.save();
  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      product: newProduct,
    },
  });
});

const updateProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Product not found..🥲'
    );
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      product,
    },
  });
});

const deleteProduct = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const deletedProduct = await Product.findByIdAndDelete(id);
  if (!deletedProduct) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Product not found..🥲'
    );
    return next(error);
  }

  res.status(204).json({
    status: httpStatusText.SUCCESS,
  });
});
export default {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
