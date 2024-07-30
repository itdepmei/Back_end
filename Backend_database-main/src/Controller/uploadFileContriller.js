const {
  UploadFile,
  CheckDataSchemaSend,
  CheckDataUserSendByHod,
} = require("../Model/UploadFile.js");
const { User } = require("../Model/User.js");
const Event = require("../Model/EventM.js");
const pusher = require("../Config/pusherINfo.js");
const ProcessorFile = require("../Config/DeleteFile.js");
const path = require("path");
const setFileUpload = async (req, res) => {
  try {
    const userId = req.user.id;
    const file = req.file?.filename; // Accessing filename directly from req.file
    const size = req.file?.size; // Accessing size directly from req.file
    const { BookName } = req.body;
    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const fileUpload = new UploadFile({ userId, file, size, BookName });
    const response = await fileUpload.save();
    res.status(200).json({ message: "File uploaded successfully", response });
  } catch (error) {
    console.error(error); // Use console.error for errors
    res
      .status(500)
      .json({ message: "An error occurred", error: error.message }); // Send error message for better debugging
  }
};
const getAllfile = async (req, res) => {
  try {
    const response = await UploadFile.find();
    if (!response) {
      res.status(404).json({ message: "no file found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
};
const sendProjectToDepartment = async (req, res) => {
  const userId = req.user.id;
  const userAuth = req.user.user_type;
  const { isActive, check } = req.body;
  console.log(req.body);
  const UploadId = req.params.id;
  const trueIds = Object.keys(isActive).filter((id) => isActive[id]);
  console.log(trueIds);
  try {
    if (check) {
      const DeleteTheDataPrev = await CheckDataSchemaSend.findByIdAndDelete(
        check
      );
      console.log(DeleteTheDataPrev);
      if (!DeleteTheDataPrev) {
        return res.status(400).json({ message: "Failed to delete data" });
      }
    }
    const sendBook = new CheckDataSchemaSend({
      UploadBookId: UploadId,
      departmentId: trueIds,
      userId,
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
          actions: "sendProjectToDepartment",
        });
        await EventHandle.save();
      }
      const eventData = {
        name: "send_Project_from_Hr_to_Department",
        message: `${CheckUser.name} has been send a New project from ${CheckUser.DepartmentID.departmentName}`,
        DepartmentID: trueIds, // Include user ID here
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
const getDataAllById = async (req, res) => {
  try {
    const UploadBookId = req.params.id;
    const response = await CheckDataSchemaSend.findOne({ UploadBookId });
    if (!response) return res.status(404).json({ message: "No data found" });
    return res.status(200).json({ response });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getDataFileUploadBySelectTheIdFromHrTOdEPARTMENT = async (req, res) => {
  const departmentId = req.params.id;

  try {
    // Assuming CheckDataSchemaSend is a model and you want to find documents where departmentId matches
    const response = await CheckDataSchemaSend.find({
      departmentId: departmentId,
    })
      .populate("UploadBookId")
      .populate("userId")
      .exec();

    // If you need to send the response back to the client
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while retrieving the data",
      error: error.message, // It's good practice to send the error message for debugging
    });
  }
};
const CheckDataUserSend = async (req, res) => {
  const Role = req.user.user_type;
  const { isActive, check, DepartmentID } = req.body;
  const UploadId = req.params.id;
  console.log(req.body);
  const trueIds = Object.keys(isActive).filter((id) => isActive[id]);
  try {
    if (Role) {
    }
    if (check) {
      const DeleteTheDataPrev = await CheckDataUserSendByHod.findByIdAndDelete(
        check
      );
      if (!DeleteTheDataPrev) {
        return res.status(400).json({ message: "Failed to delete data" });
      }
    }
    const sendBook = new CheckDataUserSendByHod({
      UploadId: UploadId,
      departmentId: DepartmentID,
      userId: trueIds,
    });
    const response = await sendBook.save();
    if (!response) {
      return res.status(400).json({ message: "Failed to insert data" });
    }

    // If successful, trigger events
    if (response) {
      // const CheckUser = await Users.findById(userId);
      // if (CheckUser.user_type !== "HR") {
      //   const EventHandle = new Event({
      //     userId: userId,
      //     projectId: response.projectId, // Assuming there's a projectId field in response
      //     departmentId: CheckUser.DepartmentID,
      //     actions: "sendProject",
      //   });
      //   await EventHandle.save();
      // }

      // Trigger Pusher event
      // const eventData = {
      //   message: "New project sent",
      //   departmentId: CheckUser.departmentID, // Adjusted for correct case
      //   userId: userId, // Include user ID here
      // };
      // pusher.trigger("poll", "vote", eventData);

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
const getDataAllCheckUserByById = async (req, res) => {
  try {
    const UploadBookId = req.params.id;
    const response = await CheckDataUserSendByHod.findOne({ UploadBookId });
    if (!response) return res.status(404).json({ message: "No data found" });
    return res.status(200).json({ response });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getDataFileBySendFilefromHOD = async (req, res) => {
  const departmentId = req.params.id;
  try {
    const response = await CheckDataUserSendByHod.find({
      departmentId: departmentId,
    })
      .populate("UploadId")
      .populate("departmentId")
      .exec();

    if (!response || response.length === 0) {
      // Check for empty response
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    console.error("An error occurred while retrieving the data:", error); // Log the error
    res.status(500).json({
      message: "An error occurred while retrieving the data",
      error: error.message,
    });
  }
};
const deleteTheFileById = async (req, res) => {
  try {
    // Find and delete the file by its ID
    const response = await UploadFile.findByIdAndDelete(req.params.id);
    console.log(response);
    if (!response) {
      return res.status(404).json({ message: "File not found." });
    }

    const pathfile = path.join("src/upload_Data/", response.file);
    console.log(pathfile);

    // Process the file and wait for it to complete
    await ProcessorFile(pathfile);

    // Delete related data in CheckDataSchemaSend
    const deleteFileRelations = await CheckDataSchemaSend.deleteMany({
      UploadBookId: req.params.id,
    });
    if (!deleteFileRelations) {
      return res.status(404).json({ message: "File relations not found." });
    }

    // Delete related data in CheckDataUserSendByHod
    await CheckDataUserSendByHod.deleteMany({
      UploadBookId: req.params.id,
    });

    // Send success response
    res.status(200).json({ message: "File deleted successfully." });
  } catch (error) {
    // Send error response
    return res.status(500).json({ error: error.message });
  }
};


module.exports = {
  setFileUpload,
  getAllfile,
  CheckDataUserSend,
  getDataFileUploadBySelectTheIdFromHrTOdEPARTMENT,
  getDataAllById,
  deleteTheFileById,
  getDataAllCheckUserByById,
  sendProjectToDepartment,
  CheckDataUserSend,
  getDataFileBySendFilefromHOD,
};
