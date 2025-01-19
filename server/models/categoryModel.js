import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
  },
  description: {
    type: String,
    required: [true, 'Category description is required'],
  },
  products: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
    },
  ],
  //? Timestamps
  createdAt: {
    type: Date,
    default: new Date(),
  },
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
