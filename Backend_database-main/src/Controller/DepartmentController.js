const Department = require("../Model/Department.js");
const { UploadFile, CheckDataSchemaSend } = require("../Model/UploadFile.js");
const Users = require("../Model/User.js");

const setData = async (req, res) => {
  try {
    const { departmentName, brief } = req.body;
    const Brief = brief.toString().toUpperCase();
    if (!departmentName || !brief) {
      return res
        .status(400)
        .json({ message: "Please enter the department name and user ID." });
    }
    const department = new Department({
      departmentName,
      brief: Brief,
    });
    await department.save();
    res
      .status(201)
      .json({ message: "Department added successfully", department });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while saving the department",
      error: error.message,
    });
  }
};
const getData = async (req, res) => {
  try {
    const departments = await Department.find();
    if (!departments) {
      return res.status(404).json({ message: "No departments found" });
    }
    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while fetching the departments",
      error: error.message,
    });
  }
};
const getDataByID = async (req, res) => {
  try {
    const DepartmentID = req.params.id;
    const response = await Department.findById(DepartmentID);
    if (!response) {
      res.status(404).json({ message: "Department ID not found" });
    }
    return res.status(200).json(response);
  } catch (error) {}
};
const deleteById = async (req, res) => {
  const projectId = req.params.id;
  try {
    const response = await Department.findByIdAndDelete(projectId);
    if (!response) {
      return res.status(404).json({ message: "Department data not found" });
    }
    res.status(200).json({ message: "Department data deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the Department data",
      error: error,
    });
  }
};
module.exports = { deleteById, getDataByID, getData, setData };
