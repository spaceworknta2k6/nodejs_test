const mongoose = require("mongoose");
const RoleSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    deletedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    permission: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true },
);

const Role = mongoose.model("Role", RoleSchema, "roles");

module.exports = Role;
