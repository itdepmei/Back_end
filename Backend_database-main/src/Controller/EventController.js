const Event = require("../Model/EventM.js");
const getEvent = async (req, res) => {
  const departmentID = req.params.id;
  try {
    const response = await Event.find({ departmentId: departmentID })
      .populate("productId", "nameProduct allowRequest")
      .populate({
        path: "projectId",
        populate: {
          path: "DepartmentID",
          select: "departmentName",
        },
        select: "nameProject ",
      })
      .populate("departmentId", "departmentName")
      .populate({
        path: "userId",
        select: "-password -createdAt -updatedAt",
      });

    if (!response || response.length === 0) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ response });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
module.exports = { getEvent };
