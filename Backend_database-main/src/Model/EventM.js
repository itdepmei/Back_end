const { Schema, model } = require("mongoose");

const EventSchema = new Schema(
  {
    actions: { type: String },
    ActionType: { type: String }, // Fixed missing type declaration
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    projectId: { type: Schema.Types.ObjectId, ref: "Project" },
    productId: { type: Schema.Types.ObjectId, ref: "Product" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: "30d", // Documents will automatically be deleted after 30 days
    },
  },
  {
    timestamps: true,
  }
);

const Event = model("Event", EventSchema);

module.exports = Event;
