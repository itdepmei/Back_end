const { model, Schema } = require("mongoose");

const RoleSchema = new Schema(
  {
    RoleName: {
      type: String,
      default: "Employ",
    },
  },
  {
    timestamps: true,
  }
);
const RoleModel = model("Role", RoleSchema);

const roleIdPermissionIdSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    permissionIds: [
      { type: Schema.Types.ObjectId, ref: "Permission", required: true },
    ],
    RoleId: { type: Schema.Types.ObjectId, ref: "Role", required: true },
  },

);

const RoleIdPermissionId = model(
  "RoleIdPermissionId",
  roleIdPermissionIdSchema
);

module.exports = { RoleModel, RoleIdPermissionId };
