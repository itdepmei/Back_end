const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    Stage: { type: String, required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    departmentID: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", ProductSchema);
module.exports = Product;
