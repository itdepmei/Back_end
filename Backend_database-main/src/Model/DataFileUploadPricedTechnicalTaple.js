const mongoose = require("mongoose");
const { Schema } = mongoose;

const pricedTechnicalSchema = new Schema({
    file: { type: String },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
});

const PricedTechnical = mongoose.model("PricedTechnaical", pricedTechnicalSchema);

module.exports = PricedTechnical;
