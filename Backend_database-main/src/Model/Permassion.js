const { model, Schema } = require("mongoose");

const PermissionSchema = new Schema({
  permissionName: {
    type: String,
  },
},{
  timestamps:true
});

const PermissionModel = model("Permission", PermissionSchema);
module.exports = PermissionModel;
