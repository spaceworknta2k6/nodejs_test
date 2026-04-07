const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  price: Number,
  discountPercentage: Number,
  rating: Number,
  active: Boolean,
  deleted:Boolean,
  deletedAt: Date,
  position: Number,
  images: {
    type: [String],
    default: []
  },
  thumbnail: String
});

const Product = mongoose.model("Product", ProductSchema, "products")

module.exports = Product