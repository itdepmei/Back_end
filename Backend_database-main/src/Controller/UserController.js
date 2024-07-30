const CreateToken = require("../Config/createScureToken.js");
const { userIdAndRoleId, User } = require("../Model/User.js");
const path = require("path");
const ProcessorFile = require("../Config/DeleteFile.js");
const { RoleModel } = require("../Model/Role.js");
const { RoleIdPermissionId } = require("../Model/Role.js");

const RegisterUser = async (req, res) => {
  const { name, username, password, Phone, user_type, DepartmentID, RoleId } =
    req.body;
  const image = req.file ? req.file.filename : null; // Check if file exists
  if (!name || !username || !password || !Phone || !user_type) {
    return res.status(400).json({ message: "Please Enter all information" });
  }
  if (isNaN(Phone) || Phone.length !== 11) {
    return res.status(400).json({ message: "Invalid Phone Number" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: "This username already exists" });
    }

    const newUser = new User({
      name,
      username,
      password,
      Phone,
      user_type,
      image,
      RoleId,
    });
    if (DepartmentID) {
      // Check if DepartmentID exists
      newUser.DepartmentID = DepartmentID; // Assign DepartmentID only if it exists
    }
    const savedUser = await newUser.save();
    const role = await userIdAndRoleId.findOne({ RoleId });
    console.log(RoleId, role);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }
    let permissions;
    if (RoleId === role.RoleId) {
      console.log(role.permissionIds);
      return (permissions = role.permissionIds);
    }
    // const userIdAndRole = new userIdAndRoleId({
    //   userId: savedUser._id,
    //   RoleId,
    // });
    // await userIdAndRole.save();
    if (savedUser) {
      const rolePermission = new RoleIdPermissionId({
        permissionIds: role.permissionIds,
        RoleId,
        userId: savedUser._id,
      });
      await rolePermission.save();
      res.status(201).json({
        message: "Registered Successfully",
        data: savedUser,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Something went wrong", error });
  }
};
// start login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(req.body)
    const usernamenn = username.trim();
    if (!usernamenn || !password) {
      return res
        .status(400)
        .json({ message: "Please enter username and password" });
    }
    const CheckData = await User.findOne({
      username: usernamenn,
      password,
    }).catch((error) => {
      console.log("Error", error);
      return res.status(500).json({
        message:
          "MongooseError: Operation `users.findOne()` buffering timed out after 10000ms",
      });
    });
    if (!CheckData) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    const token = CreateToken(CheckData._id, CheckData.user_type);
    const getRole = await RoleModel.findById(
      CheckData.RoleId,
      "-updatedAt -createdAt"
    );
    console.log(getRole);
    if (token) {
      //  find data by userId userIdAndRoleId
      res.header("token", token).status(200).json({
        message: "User logged in successfully",
        dataobj: CheckData,
        token,
        getRole,
      });
    }
  } catch (error) {
    console.log("Error", error);
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};
const getdatabyDepartmentIDName = async (req, res) => {
  const DepartmentID = req.params.id;
  try {
    const response = await User.find({ DepartmentID: DepartmentID }).populate("RoleId","-createdAt -updatedAt").populate("DepartmentID","-createdAt -updatedAt")
    if (response.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found in this DepartmentID" });
    }
    res.status(200).json(response);
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};
const getAllData = async (req, res) => {
  try {
    const response = await User.find().populate("DepartmentID");
    if (!response || response.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json({
      message: "Users retrieved successfully",
      data: response,
    });
  } catch (error) {
    console.log("Error", error);
    res.status(500).json({ message: "An error occurred while fetching users" });
  }
};
const getDataUserById = async (req, res) => {
  try {
    console.log(req.params.id);
    const response = await User.findById(req.params.id);
    if (!response) {
      return res.status(404).json({ message: "user Not found " });
    }
    return res.status(200).json({ response });
  } catch (error) {
    return res.status(500).json({ message: " Internal server error" });
  }
};
const DeleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    // Find and delete the user by ID
    const response = await User.findByIdAndDelete(userId);
    if (!response) {
      return res.status(404).json({ message: "User not found" });
    }
    // Delete associated role permission
    await RoleIdPermissionId.deleteMany({ RoleId: response.RoleId });
    if (response.image) {
      const pathfile = path.join("src/upload_Data/", response.image);
      console.log(pathfile);
      // Use a callback to ensure the response is sent only once
      ProcessorFile(pathfile, res, () => {
        // Send success response after file processing
        return res.status(200).json({ message: "User deleted successfully" });
      });
    } else {
      // Send success response if no image to process
      return res.status(200).json({ message: "User deleted successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { name, password, phone, user_type, username, DepartmentID, RoleId } =
      req.body;
    const userId = req.params.id;
    const updatedFields = {};

    if (name) updatedFields.name = name;
    if (password) updatedFields.password = password;
    if (phone) updatedFields.phone = phone;
    if (user_type) updatedFields.user_type = user_type;
    if (DepartmentID) updatedFields.DepartmentID = DepartmentID;
    if (username) updatedFields.username = username;
    if (RoleId) updatedFields.RoleId = RoleId;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedFields, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (RoleId) {
      const role = await userIdAndRoleId.findOne({ RoleId });
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      const rolePermission = {};
      if (RoleId) rolePermission.RoleId = RoleId;
      if (role.permissionIds) rolePermission.permissionIds = role.permissionIds;

      const rolePermissionUpdate = await RoleIdPermissionId.findOneAndUpdate(
        { userId: updatedUser._id },
        rolePermission,
        { new: true }
      );
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      response: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const update_image_profile = async (req, res) => {
  try {
    const imageEdit = req.body.imageEdit;
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ message: "Please select an image" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const previousImage = user.image;
    user.image = req.file.filename;
    await user.save();
    if (previousImage) {
      const pathfile = path.join("src/upload_Data/", previousImage);
      console.log(pathfile);
      ProcessorFile(pathfile);
    } else {
      return res.status(404).json({ message: "image not found path" });
    }

    res.status(200).json({ message: "Image updated successfully" });
  } catch (error) {
    console.log("Error updating image profile:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
// const GetData
module.exports = {
  RegisterUser,
  login,
  getdatabyDepartmentIDName,
  getAllData,
  DeleteUserById,
  getDataUserById,
  update_image_profile,
  updateUser,
};
