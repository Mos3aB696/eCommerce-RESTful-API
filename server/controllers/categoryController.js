import httpStatusText from '../utils/httpStatusText.js';
import Category from '../models/categoryModel.js';
import ApiFeatures from '../utils/apiFeatures.js';
import AppError from '../utils/appError.js';
import asyncWrapper from '../middlewares/asyncWrapper.js';

// Get All Categories
const getAllCategories = asyncWrapper(async (req, res, next) => {
  const features = new ApiFeatures(Category.find(), req.query)
    .filter()
    .sort()
    .limitFields();

  const categories = await features.query;
  res.status(200).json({
    status: httpStatusText.SUCCESS,
    count: categories.length,
    data: {
      categories,
    },
  });
});
// Get Single Category by ID
const getCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const feature = new ApiFeatures(
    Category.findById(id),
    req.query
  ).limitFields();
  const category = await feature.query;

  if (!category) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Category not found..🥲'
    );
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      category,
    },
  });
});

// Create New Category
const addCategory = asyncWrapper(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: httpStatusText.SUCCESS,
    data: {
      category: newCategory,
    },
  });
});

// Update Category by ID
const updateCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;
  const category = await Category.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Category not found..🥲'
    );
    return next(error);
  }

  res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: {
      category,
    },
  });
});

// Delete Category by ID
const deleteCategory = asyncWrapper(async (req, res, next) => {
  const { id } = req.params;

  const deletedCategory = await Category.findByIdAndDelete(id);
  if (!deletedCategory) {
    const error = AppError.create(
      404,
      httpStatusText.NOTFOUND,
      'Category not found..🥲'
    );
    return next(error);
  }

  res.status(204).json({
    status: httpStatusText.SUCCESS,
    data: null,
  });
});

export default {
  getAllCategories,
  getCategory,
  addCategory,
  updateCategory,
  deleteCategory,
};
