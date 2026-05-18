const mongoose = require("mongoose");

const slug = require("mongoose-slug-updater");
mongoose.plugin(slug);

const ProductSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    category: String,
    price: Number,
    discountPercentage: Number,
    rating: Number,
    featured: String,
    active: Boolean,
    createdBy: {
      account_id: String,
      createAt: {
        type: Date,
        default: Date.now,
      }
    },
    slug: {
      type: String,
      slug: "title",
      unique: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      account_id: String,
      deletedAt: Date
    },
    position: Number,
    images: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
    },
    thumbnail: String,
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema, "products");

module.exports = Product;
