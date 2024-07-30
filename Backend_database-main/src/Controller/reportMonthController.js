const pusher = require("../Config/pusherINfo.js");
const { ReportsMonth, ReportsMonthData } = require("../Model/ReportMonth.js");
const { User } = require("../Model/User.js");
const setReportMonth = async (req, res) => {
  try {
    console.log(req.body);
    const SelectTask = [
      { SelectTask: "DirectOrdersAnExchanges" },
      { SelectTask: "CompletedTendersAndInvitations" },
      { SelectTask: "CorrespondingTobeneficiaries" },
      { SelectTask: "writingsStatingThePossibility" },
      { SelectTask: "CorrespondenceToForeignCompanies" },
      { SelectTask: "CompletedTrainingCourses" },
      { SelectTask: "OtherWork" },
    ];

    const { timeReport, userId, NumberTask, Task, notes } = req.body;

    if (!timeReport) {
      return res.status(400).json({
        message: "Please provide DateReport",
      });
    }

    const ReportMonthSaveData = new ReportsMonth({
      createdAt: timeReport,
      userId,
    });

    const response = await ReportMonthSaveData.save();

    if (response) {
      await Promise.all(
        SelectTask.map(async (item) => {
          const reportMonthSaveData = new ReportsMonthData({
            ReportsMonthId: response._id,
            NumberTask: NumberTask, // Ensure this is correctly populated
            // taskDescription: Task,   // Ensure this is correctly populated
            Notes: notes, // Ensure this is correctly populated
            SelectTask: item.SelectTask, // Specific SelectTask from the list
          });

          await reportMonthSaveData.save();
        })
      );

      return res
        .status(200)
        .json({ message: "Report generate added successfully", response });
    }
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};

const getAllDataReportsMonth = async (req, res) => {
  await ReportsMonth.find()
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const getAllDataReportsMonthtsend = async (req, res) => {
  try {
    const reports = await ReportsMonth.find({ SendReportMonth: true }).populate(
      {
        path: "userId",
        populate: {
          path: "DepartmentID",
          select: "-createdAt -updatedAt -reciveProject -brief",
        },
        select: "-createdAt -updatedAt",
      }
    );
    console.log(reports);
    res.status(200).json({
      success: true,
      response: reports,
    });
  } catch (err) {
    console.error(err);
    res.status(404).json({
      success: false,
      error: "Data not found",
      details: err.message,
    });
  }
};
const getDataReportsMonthById = async (req, res) => {
  try {
    const report = await ReportsMonth.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    res.status(200).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDataReportsMonthByUserID = async (req, res) => {
  await ReportsMonth.find({ userId: req.params.id })
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const setReportMonthData = async (req, res) => {
  try {
    const { Task, endTime, notes, startTime, ReportsMonthId } = req.body;
    if (!Task) {
      return res.status(400).json({
        message: "Please provide Task",
      });
    }
    const reportMonthSaveData = new ReportsMonthData({
      ReportsMonthId,
      timFrom: startTime,
      timTo: endTime,
      taskDescription: Task,
      Notes: notes,
    });

    const response = await reportMonthSaveData.save();

    if (response) {
      return res.status(200).json({
        message: "Report added successfully",
        response,
      });
    }
  } catch (err) {
    console.log("Error saving report:", err);
    res.status(500).json({
      message: "An error occurred while saving the report",
      // error: err,
    });
  }
};

const getDataReportsMonthDataById = async (req, res) => {
  try {
    const response = await ReportsMonthData.find({
      ReportsMonthId: req.params.id,
    });
    if (response.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for the given ID" });
    }
    res.status(200).json({ reports: response });
  } catch (err) {
    console.error("Error retrieving reports:", err);
    res.status(500).json({
      message: "An error occurred while retrieving reports",
      error: err,
    });
  }
};
const getDataReportsMonthDataByIdEachFild = async (req, res) => {
  try {
    const response = await ReportsMonthData.findById(req.params.id);
    if (response.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for the given ID" });
    }
    res.status(200).json({ reports: response });
  } catch (err) {
    console.error("Error retrieving reports:", err);
    res.status(500).json({
      message: "An error occurred while retrieving reports",
      error: err,
    });
  }
};
const sendReportsManager = async (req, res) => {
  const ReportId = req.params.id;
  const userId = req.user.id;
  try {
    const ReportSend = await ReportsMonth.findById(ReportId);
    if (!ReportSend) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (ReportSend.SendReportMonth === true) {
      return res
        .status(400)
        .json({ message: "The report has already been sent." });
    }
    ReportSend.SendReportMonth = true;
    const response = await ReportSend.save();
    if (response) {
      // const CheckUser = await User.findById(userId);
      // const role = await RoleModel.findOne({ RoleName: "manager" });
      // if (!role) {
      //   return res.status(404).json({ message: "Role not found" });
      // }
      // const user = await User.findOne({ RoleId: role._id });
      // if (!user) {
      //   return res.status(404).json({ message: "User not found" });
      // }
      // const eventData = {
      //   name: "report_has_send_manager",
      //   message: `أرسل التقرير ${CheckUser.name} المستخدم`,
      //   userId: user._id,
      // };

      // pusher.trigger("poll", "vote", eventData);
      return res
        .status(200)
        .json({ message: "Report sent successfully", response });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while sending the report",
      error: error.message,
    });
  }
};
const updateDataReportMonthById = async (req, res) => {
  try {
    const { Notes, NumberTask } = req.body;
    const ReportId = req.params.id;
    const updatedReportMonth = await ReportsMonthData.findByIdAndUpdate(
      ReportId,
      {
        Notes,
        NumberTask,
      },
      { new: true }
    );
    if (!updatedReportMonth) {
      return res.status(404).json({ message: "Report Month not found" });
    }
    res.status(200).json({
      message: "Month report  update successfully",
      updatedReportMonth,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const DeleteReportById = async (req, res) => {
  try {
    console.log("hello this id", req.params.id);
    const responseDeleteData = await ReportsMonthData.deleteMany({
      ReportsMonthId: req.params.id,
    });

    // Check if deleteMany was successful (optional)
    if (responseDeleteData) {
      const response = await ReportsMonth.findByIdAndDelete(req.params.id);
      if (!response) {
        return res
          .status(404)
          .json({ message: "No report found for the given id" });
      }

      // Success message
      res
        .status(200)
        .json({ message: "Deleted item and related reports successfully" });
    }

    // Delete the main report
  } catch (error) {
    // Handle errors
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  setReportMonth,
  getDataReportsMonthByUserID,
  getDataReportsMonthDataById,
  setReportMonthData,
  getAllDataReportsMonth,
  sendReportsManager,
  getDataReportsMonthById,
  getDataReportsMonthDataByIdEachFild,
  updateDataReportMonthById,
  getAllDataReportsMonthtsend,
  DeleteReportById,
}; // Added deleteById to the export
