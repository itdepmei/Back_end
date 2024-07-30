const { Schema, model } = require("mongoose");

const FilesPriceSchema = new Schema(
  {
    filesName: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  },
  {
    timestamps: true,
  }
);

const FilesPrice = model("FilesPrice", FilesPriceSchema);

module.exports = FilesPrice;
