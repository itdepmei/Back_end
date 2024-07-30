const mongoose = require("mongoose");

const { Schema } = mongoose;

const schemaSystemPrice = new Schema({
  typePrice: String,
});

const SystemPrice = mongoose.model("SystemPrice", schemaSystemPrice);

module.exports = SystemPrice;
