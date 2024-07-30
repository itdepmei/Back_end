const mongoose = require("mongoose");

const { Schema } = mongoose;

const schemaUnitSystem = Schema({
  Unit: String,
});

const UnitSystem = mongoose.model("UnitSystem", schemaUnitSystem);

module.exports = UnitSystem;
