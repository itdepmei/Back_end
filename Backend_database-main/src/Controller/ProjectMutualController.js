const pusher = require("../Config/pusherINfo");
const { SendProjectMutual, SendProjectMutualToSendEmploy } = require("../Model/MutualProject");
const { User } = require("../Model/User");
const sendProjectFromHodToProjectManger = async (req, res) => {
  const userId = req.user.id;
  const userAuth = req.user.user_type;
  const { isActive, check, ProjectManager } = req.body;
  const dataProjectId = req.params.id;
  console.log(dataProjectId);
  const trueIds = Object.keys(isActive).filter((id) => isActive[id]);
  console.log(trueIds);
  try {
    if (check) {
      const DeleteTheDataPrev = await SendProjectMutual.findByIdAndDelete(
        check
      );
      console.log("sfsd", DeleteTheDataPrev);
      if (!DeleteTheDataPrev) {
        return res.status(400).json({ message: "Failed to delete data" });
      }
    }
    const sendBook = new SendProjectMutual({
      dataProjectId,
      DepartmentID: trueIds,
    });
    const response = await sendBook.save();
    if (!response) {
      return res.status(400).json({ message: "Failed to send data" });
    }
    if (response) {
      const CheckUser = await User.findById(userId).populate("DepartmentID");
      if (CheckUser.user_type !== userAuth) {
        const EventHandle = new Event({
          userId: userId,
          projectId: response.projectId,
          departmentId: CheckUser.DepartmentID,
          actions: "sendProjectFromHodToProjectManger",
        });
        await EventHandle.save();
      }
      const eventData = {
        name: "send_Project_from_HoD_to_ProjectManger",
        message: `${CheckUser.name} has been send a Product data from ${CheckUser.DepartmentID.departmentName}`,
        userId: ProjectManager, // Include user ID here
      };
      pusher.trigger("poll", "vote", eventData);
      return res.status(200).json({
        message: "Project sent and data inserted to departments successfully",
        response,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getDataAllCheckByDepartmentId = async (req, res) => {
  try {
    const dataProjectId = req.params.id;
    console.log(dataProjectId);
    const response = await SendProjectMutual.findOne({ dataProjectId });
    if (!response) return res.status(404).json({ message: "No data found" });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};


const sendProjectMutualToEmploy = async (req, res) => {
  const userId = req.user.id;
  const userAuth = req.user.user_type;
  const { isActive, check,DepartmentID } = req.body;
  const dataProjectId = req.params.id;
  const trueIds = Object.keys(isActive).filter((id) => isActive[id]);
  try {
    if (check) {
      const DeleteTheDataPrev =
        await SendProjectMutualToSendEmploy.findByIdAndDelete(check);
      if (!DeleteTheDataPrev) {
        return res.status(400).json({ message: "Failed to delete data" });
      }
    }
    const sendBook = new SendProjectMutualToSendEmploy({
      dataProjectId,
      userId: trueIds,
    });
    const response = await sendBook.save();
    if (!response) {
      return res.status(400).json({ message: "Failed to send data" });
    }
    if (response) {
      const CheckUser = await User.findById(userId).populate("DepartmentID");
      if (CheckUser.user_type !== userAuth) {
        const EventHandle = new Event({
          userId: userId,
          projectId: response.projectId,
          departmentId:DepartmentID,
          actions: "SendProjectMutualToSendEmploy",
        });
        await EventHandle.save();
      }
      const eventData = {
        name: "send_Project_from_HoD_to_Employ",
        message: `${CheckUser.name} has been send a project data from ${CheckUser.DepartmentID.departmentName}`,
        userId: trueIds, // Include user ID here
      };
      pusher.trigger("poll", "vote", eventData);
      return res.status(200).json({
        message: "Project sent and data inserted to departments successfully",
        response,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};
const getDataAllCheckByUserIdforEmploy = async (req, res) => {
  try {
    const dataProjectId = req.params.id;
    const response = await SendProjectMutualToSendEmploy.findOne({ dataProjectId });
    if (!response) return res.status(404).json({ message: "No data found" });
    return res.status(200).json(response);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
module.exports = {
  sendProjectFromHodToProjectManger,
  getDataAllCheckByDepartmentId,
  sendProjectMutualToEmploy,
  getDataAllCheckByUserIdforEmploy
};
