import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  //? Required fields
  name: {
    type: String,
    required: [true, 'Product name is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  category: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
  ],
  price: {
    type: Number,
    required: [true, 'Product price is required'],
  },
  imageCover: {
    type: String,
    // required: [true, 'Product imageCover is required'],
  },
  images: {
    type: [String],
    // required: [true, 'Product images are required'],
  },
  countInStock: {
    type: Number,
    required: [true, 'Product countInStock is required'],
  },
  //? Optional fields
  brand: {
    type: String,
  },
  discount: {
    type: Number,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  variants: {
    type: [Object],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: [0, 'Rating must be above 0'],
    max: [5, 'Rating must be below 5'],
  },
  numReviews: {
    type: Number,
    default: 0,
  },

  //? Timestamps
  createdAt: {
    type: Date,
    default: new Date(),
    select: false,
  },

  updatedAt: {
    type: Date,
    default: new Date(),
    select: false,
  },
});

const Product = mongoose.model('Product', productSchema);

export default Product;
