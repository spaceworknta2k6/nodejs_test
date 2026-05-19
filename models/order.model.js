const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      unique: true
    },
    userInfo: {
      fullName: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
    },
    products: [
      {
        product_id: {
          type: String,
          required: true,
        },
        price: Number, // Unit price after discount
        quantity: Number,
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema, "orders");
module.exports = Order;
