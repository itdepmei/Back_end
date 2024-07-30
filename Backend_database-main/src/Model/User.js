const { Schema, model } = require("mongoose");

const userSchema = new Schema({
  name: String,
  username: { type: String },
  password: { type: String, default: "12345678" }, //hashed version of the user's password to store securely
  user_type: {
    type: String,
    enum: [
      "Employ",
      "IT",
      "H.O.D",
      "management",
      "HR",
      "Assistance",
      "manager",
    ],
    default: "Employ",
  },
  DepartmentID: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  Phone: { type: String },
  image: { type: String },
  RoleId: { type: Schema.Types.ObjectId, ref: "Role" },
});
const User = model("users", userSchema);

const SchemaUserIdRoleId = new Schema({
  permissionIds: [
    { type: Schema.Types.ObjectId, ref: "Permission", required: true },
  ],
  RoleId: { type: Schema.Types.ObjectId, ref: "Role" },
});
const userIdAndRoleId = model("UserIDRoleId", SchemaUserIdRoleId);
module.exports = {
  User,
  userIdAndRoleId
};
