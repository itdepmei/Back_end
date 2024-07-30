const { RoleIdPermissionId, RoleModel } = require("../Model/Role.js");
const { userIdAndRoleId, User } = require("../Model/User.js");
const setRole = async (req, res) => {
  try {
    const { RoleName } = req.body;
    if (!RoleName) {
      return res.status(400).json({ message: "Pleas Enter Role name" });
    }
    const RoleSave = new RoleModel({
      RoleName,
    });
    console.log(req.body);
    const response = await RoleSave.save();
    if (!response) {
      return res
        .status(400)
        .json({ message: "Error occurred while saving role" });
    }
    return res
      .status(200)
      .json({ message: "Role saved successfully", response });
  } catch (error) {
    return res.status(500).json({ message: "An error occurred", error });
  }
};
const getRole = async (req, res) => {
  try {
    const response = await RoleModel.find();
    if (response) {
      return res.status(200).json({ response });
    }
  } catch (e) {
    console.log(e);
    return res.status(200).json({ message: "error", e });
  }
};
const getDataRoleIdAndUserId = async (req, res) => {
  try {
    const response = await userIdAndRoleId.findOne({ userId: req.params.id });
    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching data" });
  }
};
const getDataRoleIdAndPermissionId = async (req, res) => {
  try {
    const response = await RoleIdPermissionId.findOne({
      userId: req.params.id,
    }).populate("RoleId");
    if (!response) {
      return res.status(400).json({ message: "No data found" });
    }
    return res.status(200).json(response);
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching data" });
  }
};
const getDataRoleIdAndPermissionIduseGrouID = async (req, res) => {
  try {
    const response = await userIdAndRoleId
      .findOne({
        RoleId: req.params.id,
      })
      .populate("RoleId");
    if (!response) {
      return res.status(400).json({ message: "No data found" });
    }
    return res.status(200).json(response);
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while fetching data" });
  }
};
const setPermissionAndRole = async (req, res) => {
  try {
    // console.log("Request Body:", req.body);
    const { selectionModel, userId, roleIdPermission } = req.body;
    console.log(roleIdPermission);
    if (!selectionModel || !userId) {
      return res
        .status(400)
        .json({ message: "PermissionIds and userId are required." });
    }
    const deletedRolePermission = await RoleIdPermissionId.findByIdAndDelete(
      roleIdPermission
    );
    if (!deletedRolePermission) {
      console.log("Error deleting role permission");
      return res
        .status(400)
        .json({ message: "Role permission not found or already deleted." });
    }
    console.log("Role permission deleted successfully");
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const rolePermission = new RoleIdPermissionId({
      permissionIds: selectionModel,
      RoleId: user.RoleId,
      userId: userId,
    });

    const savedData = await rolePermission.save();
    if (!savedData) {
      return res
        .status(500)
        .json({ message: "Failed to save role-permission mapping." });
    }

    return res.status(200).json({
      response: savedData,
      message: "Permission added successfully.",
    });
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
const setPermissionAndRoleToEchGroup = async (req, res) => {
  try {
    const { selectionModel, GroupId, roleIdPermissionGroup } = req.body;
    console.log("adsFSD", req.body);
    // Validate required fields
    if (!selectionModel || !GroupId) {
      return res.status(400).json({
        message: "selectionModel and GroupId are required.",
      });
    }
    // Check if roleIdPermissionGroup exists and delete if so
    if (roleIdPermissionGroup) {
      await userIdAndRoleId.findByIdAndDelete(roleIdPermissionGroup);
    }
    // Create new entry
    // Save new entry
    const PermissionsEchGroup = new userIdAndRoleId({
      permissionIds: selectionModel,
      RoleId: GroupId,
    });
    const savedData = await PermissionsEchGroup.save();

    // Respond with success message and data
    return res.status(200).json({
      response: savedData,
      message: "Permission added successfully",
    });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error.", error: error.message });
  }
};
module.exports = {
  getDataRoleIdAndPermissionIduseGrouID,
  setPermissionAndRole,
  getDataRoleIdAndPermissionId,
  getDataRoleIdAndUserId,
  setPermissionAndRoleToEchGroup,
  getRole,
  setRole,
};
