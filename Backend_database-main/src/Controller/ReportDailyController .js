const { response } = require("express");
const {
  ReportsDaily,
  ReportsDailyData,
  ReportsDailyDataStatic,
  ReportInsertStaticData,
} = require("../Model/ReportsDaily.js");
const setReportDaily = async (req, res) => {
  try {
    console.log(req.body);
    const { timeReport, userId } = req.body;
    console.log("hello world");

    if (!timeReport) {
      return res.status(400).json({
        message: "Please provide DateReport",
      });
    }

    const ReportDailySaveData = new ReportsDaily({
      timeReport,
      userId,
    });

    const response = await ReportDailySaveData.save();
    if (response) {
      const dataStatic = await ReportsDailyDataStatic.find();

      // Assuming 'dataStatic' is the array you want to iterate over
      for (const element of dataStatic) {
        const dataStaticEntry = new ReportInsertStaticData({
          ReportsDailyId: response._id,
          userId: userId,
          ReportStaticId: element._id,
        });
        await dataStaticEntry.save();
      }

      return res.status(200).json({
        message: "Report generated and added successfully",
        response,
      });
    } else {
      return res.status(500).json({
        message: "Failed to save report",
      });
    }
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};

const setReportDataStaticNotes = async (req, res) => {
  try {
    console.log(req.body);
    const { ReportsDailyId, ReportStaticId, userId, Notes } = req.body;
    console.log("hello world");
    if (!timeReport) {
      return res.status(400).json({
        message: "Please provide DataReport",
      });
    }
    const ReportDailySaveData = new schemaReportInsertStaticData({
      ReportsDailyId,
      ReportStaticId,
      userId,
      Notes,
    });
    const response = await ReportDailySaveData.save();
    if (response) {
      return res
        .status(200)
        .json({ message: "Report generated and added successfully", response });
    }
  } catch (err) {
    console.error("Error saving report:", err);
    res.status(500).json({ message: "An error occurred", error: err });
  }
};

const getAllDataReportsDaily = async (req, res) => {
  await ReportsDaily.find()
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const getAllDataReportsDailySendReportDaily = async (req, res) => {
  try {
    const reports = await ReportsDaily.find({ SendReportDaily: true }).populate(
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

const getDataReportsDailyById = async (req, res) => {
  await ReportsDaily.findById(req.params.id)
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};
const getDataReportsDaily = async (req, res) => {
  await ReportsDaily.find({ userId: req.params.id })
    .then((response) => {
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};

const setReportDailyData = async (req, res) => {
  try {
    const { Task, endTime, notes, startTime, ReportsDailyId, SelectTask } =
      req.body;
    if (!Task) {
      return res.status(400).json({
        message: "Please provide Task",
      });
    }
    const reportDailySaveData = new ReportsDailyData({
      ReportsDailyId,
      timFrom: startTime,
      timTo: endTime,
      taskDescription: Task,
      Notes: notes,
      SelectTask,
    });
    const response = await reportDailySaveData.save();
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

const getDataReportsDailyDataById = async (req, res) => {
  try {
    const response = await ReportsDailyData.find({
      ReportsDailyId: req.params.id,
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
const sendReportsManager = async (req, res) => {
  const ReportId = req.params.id;
  const userId = req.user.id;
  try {
    const ReportSend = await ReportsDaily.findById(ReportId);
    if (!ReportSend) {
      return res.status(404).json({ message: "Report not found" });
    }
    if (ReportSend.SendReportDaily === true) {
      return res
        .status(400)
        .json({ message: "The report has already been sent." });
    }
    ReportSend.SendReportDaily = true;
    const response = await ReportSend.save();
    if (response) {
      const CheckUser = await User.findById(userId);
      const role = await RoleModel.findOne({ RoleName: "manager" });
      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }
      const user = await User.findOne({ RoleId: role._id });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const eventData = {
        name: "report_has_send_manager",
        message: `أرسل التقرير ${CheckUser.name} المستخدم`,
        userId: user._id,
      };

      pusher.trigger("poll", "vote", eventData);
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
const getDataReportDailyByUserId = async (req, res) => {
  try {
    console.log("Fetching daily reports");
    const response = await ReportsDaily.find({ userId: req.params.id });

    if (!response || response.length === 0) {
      return res
        .status(404)
        .json({ message: "No reports found for the given user ID" });
    }

    const reportIds = response.map((report) => report._id);
    const dataDailyReport = await ReportsDailyData.find(
      {
        ReportsDailyId: { $in: reportIds },
      },
      "-updatedAt -createdAt -timTo -timFrom"
    );

    if (dataDailyReport.length === 0) {
      return res
        .status(404)
        .json({ message: "No detailed reports found for the given user ID" });
    }

    // console.log(dataDailyReport);
    res.status(200).json({ reports: dataDailyReport });
  } catch (err) {
    console.error("Error retrieving reports:", err);
    res.status(500).json({
      message: "An error occurred while retrieving reports",
      error: err.message,
    });
  }
};
const DeleteReportDataById = async (req, res) => {
  try {
    const response = await ReportsDailyData.findByIdAndDelete(req.params.id);
    if (!response) {
      return res
        .status(404)
        .json({ message: "No report found for the given id" });
    }
    res.status(200).json({ message: "Deleted item successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const DeleteReportById = async (req, res) => {
  try {
    console.log("helloee");
    const response = await ReportsDaily.findByIdAndDelete(req.params.id);
    if (!response) {
      const responseDeleteData = await ReportsDailyData.deleteMany({
        ReportsDailyId: response._id,
      });
      if (!responseDeleteData) {
        console.log(" no delete data");
        return res
          .status(404)
          .json({ message: "No report found for the given id" });
      }
      return res
        .status(404)
        .json({ message: "No report found for the given id" });
    }
    res.status(200).json({ message: "Deleted item successfully" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const setReportDataStatic = async (req, res) => {
  try {
    console.log(req.body);
    const { dataReportStatic } = req.body;
    if (!dataReportStatic) {
      return res
        .status(400)
        .json({ message: "Please insert dataReportStatic" });
    }
    if (
      await ReportsDailyDataStatic.findOne({
        taskDescriptionStatic: dataReportStatic,
      })
    ) {
      return res.status(409).json({ message: "This data already exists" });
    }
    const newDataReportStatic = new ReportsDailyDataStatic({
      taskDescriptionStatic: dataReportStatic,
    });
    const save = await newDataReportStatic.save();
    res.status(200).json({ message: "dataReportStatic added", data: save });
  } catch (err) {
    res.status(500).json({ message: "Error occurrence", error: err });
  }
};
const getDataReportStatic = async (req, res) => {
  await ReportsDailyDataStatic.find()
    .then((response) => {
      // Corrected find usage
      res.status(200).json({
        response,
      });
    })
    .catch((err) => {
      res.status(404).json(err);
    });
};
const getDataReportStaticById = async (req, res) => {
  // const { reportDailyId, userId } = req.query;
  try {
    // console.log(reportDailyId, userId);
    const response = await ReportsDailyDataStatic.find().populate(
      "ReportStaticId"
    );
    res.status(200).json({ response });
  } catch (err) {
    res.status(404).json(err);
  }
};
const getDataReportStaticTorReportStatic = async (req, res) => {
  const { ReportsDailyId, userId } = req.query;
  try {
    console.log(ReportsDailyId, userId);
    const response = await ReportInsertStaticData.find({
      ReportsDailyId,
      userId,
    }).populate("ReportStaticId");
    // console.log(response);
    res.status(200).json({ response });
  } catch (err) {
    res.status(404).json(err);
  }
};
const updateReportDataStatic = async (req, res) => {
  try {
    const { Notes } = req.body;
    console.log(req.body);
    if (!Notes) {
      return res.status(400).json({ message: "Notes is required" });
    }
    const updatedNotes = await ReportInsertStaticData.findByIdAndUpdate(
      req.params.id,
      {
        Notes,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "product update successfully", updatedNotes });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateReportDataDaily = async (req, res) => {
  try {
    const { Task, endTime, notes, startTime, ReportsDailyId, SelectTask } =
      req.body;
    console.log(req.body);
    if (!Notes) {
      return res.status(400).json({ message: "Notes is required" });
    }
    const updatedNotes = await ReportsDailyData.findByIdAndUpdate(
      req.params.id,
      {
        Notes,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "product update successfully", updatedNotes });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
module.exports = {
  setReportDaily,
  getDataReportsDaily,
  getDataReportsDailyDataById,
  setReportDailyData,
  getAllDataReportsDaily,
  sendReportsManager,
  getDataReportsDailyById,
  getAllDataReportsDailySendReportDaily,
  getDataReportDailyByUserId,
  DeleteReportById,
  DeleteReportDataById,
  setReportDataStatic,
  getDataReportStatic,
  getDataReportStaticById,
  getDataReportStaticTorReportStatic,
  updateReportDataStatic,
}; // Added deleteById to the export
