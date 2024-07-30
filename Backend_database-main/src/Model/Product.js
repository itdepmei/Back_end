const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProductSchema = new Schema(
  {
    nameProduct: { type: String, required: true },
    Quantity: { type: Number, required: true },
    UnitId: { type: Schema.Types.ObjectId, ref: "UnitSystem", required: true },
    Price: { type: String, default: "0" },
    PriceType: { type: String, default: "IQD" },
    percent: { type: Number, default: 1 },
    PriceConvert: { type: Number, default: 1600 },
    description: { type: String },
    comments: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    departmentID: {
      type: Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    requestEdit: { type: Boolean, default: false },
    allowRequest: { type: Boolean, default: false },
    requestDelete: { type: Boolean, default: false },
    allowRequestDelete: { type: Boolean, default: false },
    typeProduct: { type: String },
    license: { type: String },
    productTotalPrice: { type: Number },
  },
  {
    timestamps: true,
  }
);

const Product = model("Product", ProductSchema);
module.exports = Product;
