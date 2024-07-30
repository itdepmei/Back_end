const { Schema, model } = require("mongoose");

const NotesSchema = new Schema({
  comment: { type: String, default: " nothing" },
  userId: { type: Schema.Types.ObjectId, ref: "users" },
  projectId: { type: Schema.Types.ObjectId, ref: "Project" },
  departmentID: {
    type: Schema.Types.ObjectId,
    ref: "Department",
    required: true,
  },
});
const Notes = model("Notes", NotesSchema);
module.exports = Notes;
