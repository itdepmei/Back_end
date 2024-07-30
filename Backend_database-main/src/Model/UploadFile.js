const { Schema, model } = require("mongoose");

const fileUploadSchema = new Schema(
  {
    BookName: { type: String, required: true },
    file: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "users" },
    size: { type: Number },
  },
  { timestamps: true }
);
const UploadFile = model("UploadFile", fileUploadSchema);

const CheckDataSchema = new Schema(
  {
    UploadBookId: { type: Schema.Types.ObjectId, ref: "UploadFile" },
    departmentId: [{ type: Schema.Types.ObjectId, ref: "Department" }],
    userId: { type: Schema.Types.ObjectId, ref: "users" },
  },
  { timestamps: true }
);
const CheckDataSchemaSend = model("CheckDataSend", CheckDataSchema);

const CheckDataUserSend = new Schema(
  {
    UploadId: { type: Schema.Types.ObjectId, ref: "UploadFile" },
    departmentId: { type: Schema.Types.ObjectId, ref: "Department" },
    userId: [{ type: Schema.Types.ObjectId, ref: "users" }],
  },
  { timestamps: true }
);
const CheckDataUserSendByHod = model("CheckDataUserSend", CheckDataUserSend);

module.exports = {
  UploadFile,
  CheckDataSchemaSend,
  CheckDataUserSendByHod
};
