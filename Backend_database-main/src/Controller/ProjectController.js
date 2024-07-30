const { response } = require("express");
const Project = require("../Model/Project.js");
const Department = require("../Model/Department.js");
const xlsx = require("xlsx");
const { User } = require("../Model/User.js");
const Product = require("../Model/Product.js");
const EventM = require("../Model/EventM.js");
const puppeteer = require("puppeteer");
const FilesPrice = require("../Model/FilesPrice.js");
const { cacheDirectory } = require("../../puppteer.cjs");
require("dotenv").config();
const { checkTime, generateCode } = require("../Config/function.js");
const {
  MutualProject,
  SendProjectMutualToSendEmploy,
} = require("../Model/MutualProject.js");
const pdf = require("html-pdf");
const path = require("path");
const Event = require("../Model/EventM.js");
const pusher = require("../Config/pusherINfo.js");
const fs = require("fs").promises;
const PDFDocument = require("pdfkit");
const SetProject = async (req, res) => {
  try {
    const userIdAuth = req.user.id;
    const userIDPermission = req.user;

    // Check for authorization
    if (
      userIDPermission.user_type !== "H.O.D" &&
      userIDPermission.user_type !== "management"
    ) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const {
      nameProject,
      NumberBook,
      DateBook,
      DateClose,
      PersonCharge,
      WorkNatural,
      MethodOption,
      Stage,
      CompletionRate,
      LevelPerformance,
      beneficiary,
      comments,
      startTime,
      endTime,
      isActive,
    } = req.body;
    const isActive1 = JSON.parse(isActive);
    console.log(isActive1);
    const trueIds = Object.keys(isActive1).filter((id) => isActive1[id]);
    console.log(trueIds);

    // Validate required fields
    if (
      !nameProject ||
      !NumberBook ||
      !MethodOption ||
      !Stage ||
      !CompletionRate ||
      !beneficiary ||
      !LevelPerformance
    ) {
      return res
        .status(400)
        .json({ message: "Required information is missing" });
    }

    // Fetch user data
    const getUser = await User.findById(userIdAuth);
    if (!getUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch department information
    const departmentInfo = await Department.findById(getUser.DepartmentID);
    if (!departmentInfo) {
      return res
        .status(400)
        .json({ message: "Error retrieving department information" });
    }

    // Generate project code
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear().toString().slice(-2);
    const departmentSymbol = departmentInfo.brief.toString();
    const projectCode = `${departmentSymbol}${month}${year}${NumberBook}`;

    // Check if PersonCharge is provided and valid
    let dataUserFound = null;
    if (PersonCharge) {
      dataUserFound = await User.findById(PersonCharge);
      if (!dataUserFound) {
        return res
          .status(404)
          .json({ message: "No data found for PersonCharge" });
      }
    }

    // Check for existing project with the same code
    const existingProject = await Project.findOne({ Code: projectCode });
    if (existingProject) {
      return res.status(409).json({ message: "Project code already exists" });
    }

    // Create new project object
    const newProjectData = {
      nameProject,
      NumberBook,
      comments,
      DateBook,
      DateClose,
      WorkNatural,
      MethodOption,
      Stage,
      CompletionRate,
      LevelPerformance,
      beneficiary,
      DepartmentID: departmentInfo._id,
      Code: projectCode,
      startTime,
      endTime,
    };

    // Set userId if PersonCharge is provided
    if (PersonCharge) {
      newProjectData.userId = PersonCharge;
    }
    if (isActive) {
      newProjectData.ManyPersonChrgeId = trueIds;
    }

    // Create and save new project
    const newProject = new Project(newProjectData);
    const savedProject = await newProject.save();

    // Handle event creation if PersonCharge is provided
    if (PersonCharge) {
      const eventHandle = new Event({
        userId: userIdAuth,
        projectId: savedProject._id,
        departmentId: getUser.DepartmentID,
        actions: "addProject",
      });
      await eventHandle.save();

      if (userIDPermission.user_type !== dataUserFound.user_type) {
        const eventData = {
          message: "Project added successfully",
          departmentId: getUser.DepartmentID,
          userId: PersonCharge,
        };
        pusher.trigger("poll", "vote", eventData);
      }
    }
    return res.status(200).json({
      message: "Project added successfully",
      savedProject,
    });
  } catch (error) {
    console.error("Error in SetProject:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getallDataByDepartmentAndUserID = async (req, res) => {
  await checkTime(res);
  try {
    const { page = 1, rowsPerPage = 10, departmentID } = req.query; // Default values for pagination
    console.log(page, rowsPerPage, departmentID);
    const userId = req.user.id;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalCount = await Project.countDocuments({
      DepartmentID: departmentID,
      delayProjectCheck: true,
      SendProject: false,
    });
    const response = await Project.find({
      DepartmentID: departmentID,
      delayProjectCheck: false,
      SendProject: false,
    })
      .populate("DepartmentID", "-brief -updatedAt -createdAt")
      .populate("userId", "-_id -updatedAt -createdAt")
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate("MethodOption", "_id -updatedAt -createdAt")
      .populate("ManyPersonChrgeId", "_id name Phone")

      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getallDataByDepartmentQuantityTable = async (req, res) => {
  await checkTime(res);
  try {
    const { page = 1, rowsPerPage = 10, departmentID } = req.query; // Default values for pagination
    console.log(page, rowsPerPage, departmentID);
    const userId = req.user.id;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const response = await Project.find({
      DepartmentID: departmentID,
      // delayProjectCheck: false,
      // SendProject: false,
    })
      .populate("DepartmentID", "-brief -updatedAt -createdAt")
      .populate("userId", "-_id -updatedAt -createdAt")
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate("MethodOption", "_id -updatedAt -createdAt")
      .populate("ManyPersonChrgeId", "_id name Phone");

    res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getAllDataByDepartmentAndUserIDWhenDelayCheckIsTrue = async (
  req,
  res
) => {
  try {
    await checkTime(res); // Ensure checkTime is awaited if it's async
    const { page = 1, rowsPerPage = 10, DepartmentId } = req.query; // Default values for pagination
    // console.log(page, rowsPerPage, DepartmentId);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalCount = await Project.countDocuments({
      DepartmentID: DepartmentId,
      delayProjectCheck: true,
      SendProject: false,
    });
    const response = await Project.find({
      DepartmentID: DepartmentId,
      delayProjectCheck: true,
      SendProject: false,
    })
      .populate("DepartmentID", "-brief -updatedAt -createdAt")
      .populate("userId", "-_id -updatedAt -createdAt")
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate("MethodOption", "_id -updatedAt -createdAt")
      .populate("ManyPersonChrgeId", "_id name Phone")
      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    return res.status(200).json({ totalCount, response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const deleteById = async (req, res) => {
  const projectId = req.params.id;
  try {
    // Deleting the project
    const project = await Project.findByIdAndDelete(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    // Deleting associated products
    const deleteProductByProjectId = await Product.deleteMany({
      projectId: projectId,
    });
    if (deleteProductByProjectId.deletedCount > 0) {
      // If associated products were deleted, delete associated events
      const deleteEventsFromProject = await EventM.deleteMany({
        projectId: projectId,
      });
      if (deleteEventsFromProject.deletedCount > 0) {
        return res.status(200).json({
          message:
            "Project, products, and associated events deleted successfully",
        });
      }
      // If there were no events associated with the project
      return res.status(200).json({
        message: "Project and associated products deleted successfully",
      });
    } else {
      // If no associated products were found
      return res.status(200).json({
        message: "Project deleted successfully, no associated products found",
      });
    }
  } catch (error) {
    // Catching any errors that might occur during deletion
    res.status(500).json({
      message:
        "An error occurred while deleting the project and associated products",
      error: error,
    });
  }
};
const getDataByUserId = async (req, res) => {
  try {
    const { page = 1, rowsPerPage = 10, userId } = req.query; // Default values for pagination
    console.log(page, rowsPerPage, userId);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalCount = await Project.countDocuments({
      ManyPersonChrgeId: userId,
    });
    const response = await Project.find({ ManyPersonChrgeId: userId })
      .populate("DepartmentID", "-brief -updatedAt -createdAt")
      .populate("userId", "-_id -updatedAt -createdAt")
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate("MethodOption", "_id -updatedAt -createdAt")
      .populate("ManyPersonChrgeId", "_id name Phone")
      .sort({
        /* specify your sorting criteria here */
      })
      .populate("ManyPersonChrgeId", "_id name Phone")
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    if (!response) {
      return res.status(404).json({ message: "no data Found" });
    }
    return res.status(200).json({ response, totalCount });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error });
  }
};
const getAllData = async (req, res) => {
  try {
    const response = await Project.find();
    if (!response) {
      return res.status(404).json({ message: "no data Found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error });
  }
};
const getProjectById = async (req, res) => {
  try {
    const response = await Project.findById(req.params.id)
      .populate({
        path: "MutualProjectId",
        populate: [
          {
            path: "ProjectManger",
            select: "-updatedAt -password",
          },
          {
            path: "DepartmentID",
            select: "-updatedAt -reciveProject -createdAt -brief",
          },
        ],
        select:
          "-updatedAt -createdAt -CompletionRate -LevelPerformance -Stage",
      })
      .populate("ManyPersonChrgeId", "_id name Phone");

    if (!response) {
      return res.status(404).json({ message: "no data found" });
    }
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
const getDataProjectById = async (req, res) => {
  try {
    const ProjectID = req.params.id;
    const response = await Project.findById(ProjectID).populate("userId");
    if (!response) {
      return res.status(404).json({ message: "No data found" });
    }
    return res.status(200).json({ response });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};
const updateDataProjectById = async (req, res) => {
  try {
    const ProjectId = req.params.id;
    const userId = req.user.id;
    const {
      nameProject,
      NumberBook,
      DateBook,
      DateClose,
      PersonCharge,
      WorkNatural,
      MethodOption,
      Stage,
      CompletionRate,
      LevelPerformance,
      beneficiary,
      comments,
      startTime,
      endTime,
      isActive,
    } = req.body;
    const isActive1 = JSON.parse(isActive);
    console.log(isActive1);
    const trueIds = Object.keys(isActive1).filter((id) => isActive1[id]);
    console.log(trueIds);
    // Check if user exists
    console.log("PersonCharge", PersonCharge);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch department info
    const department = await Department.findById(user.DepartmentID);
    if (!department) {
      return res.status(400).json({ message: "Department info not found" });
    }
    // Generate code for project
    const currentDate = new Date();
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear().toString().slice(-2);
    const departmentSymbol = department.brief.toString();
    const Code = `${departmentSymbol}${month}${year}${NumberBook}`;

    // Prepare update data
    const updateData = {
      nameProject,
      NumberBook,
      DateBook,
      DateClose,
      WorkNatural,
      MethodOption,
      Stage,
      CompletionRate,
      LevelPerformance,
      beneficiary,
      Code,
      comments,
      startTime,
      endTime,
    };

    // Assign PersonCharge if provided
    if (PersonCharge) {
      updateData.userId = PersonCharge;
    }
    if (isActive) {
      updateData.ManyPersonChrgeId = trueIds;
    }
    // Update project
    console.log("startTime", startTime);
    const updatedProject = await Project.findByIdAndUpdate(
      ProjectId,
      updateData,
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create event if PersonCharge is provided
    if (PersonCharge) {
      const dataUserFound = await User.findById(PersonCharge);
      if (!dataUserFound) {
        return res
          .status(404)
          .json({ message: "No data found for PersonCharge" });
      }
      const DepartmentInfo = await Department.findById({
        _id: user.DepartmentID,
      });

      const eventHandle = new Event({
        userId: userId,
        projectId: updatedProject._id,
        departmentId: user.DepartmentID,
        actions: "EditProject",
      });
      await eventHandle.save();

      if (user.user_type !== dataUserFound.user_type) {
        const eventData = {
          message: `تم أرسال المشروع من قبل ${user.name}قسم ${DepartmentInfo.departmentName}`,
          departmentId: user.DepartmentID,
          userId: PersonCharge,
        };
        pusher.trigger("poll", "vote", eventData);
      }
    }

    res
      .status(200)
      .json({ message: "Project updated successfully", updatedProject });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const getDateAsFileExcel = async (req, res) => {
  try {
    // Get the user ID from the request parameters
    const userId = req.user.id;
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find projects associated with the user's department
    const projects = await Project.find({
      DepartmentID: user.DepartmentID,
    }).populate("DepartmentID", "-brief -updatedAt -createdAt");

    const data = projects.map((project) => ({
      DepartmentName: project.DepartmentID.departmentName,
      nameProject: project.nameProject,
      OfferPrice: project.OfferPrice,
      CompletionRate: project.CompletionRate,
    }));

    // Convert data to Excel file
    const ws = xlsx.utils.json_to_sheet(data);
    const wb = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(wb, ws, "Projects");

    // Write Excel file to a buffer
    const excelBuffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

    // Set headers for Excel file
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="projects.xlsx"'
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Send Excel file as response
    res.status(200).send(excelBuffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const sendProject = async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  const date = new Date();
  console.log(projectId);
  try {
    const ProjectToSend = await Project.findById(projectId, "-MethodOption");
    if (!ProjectToSend) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (ProjectToSend.SendProject === true) {
      return res
        .status(400)
        .json({ message: "The code has already been sent." });
    }

    ProjectToSend.SendProject = true;
    ProjectToSend.dateSendTHod = date;
    const response = await ProjectToSend.save();

    if (response) {
      const CheckUser = await User.findById(userId);
      // if (CheckUser.user_type !== "H.O.D") {
      //   const EventHandle = new Event({
      //     userId: userId,
      //     projectId: response.projectId,
      //     departmentId: CheckUser.DepartmentID,
      //     actions: "send",
      //   });
      //   await EventHandle.save();
      // }
      // const eventData = {
      //   message: "New vote received",
      //   departmentId: CheckUser.departmentID, // Include user ID here
      // };
      // pusher.trigger("poll", "vote", eventData);
    }

    return res
      .status(200)
      .json({ message: "Project sent successfully", response });
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while sending the project",
      error: error.message || error,
    });
  }
};
const CancelSendProject = async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  try {
    const ProjectToSend = await Project.findById(projectId);
    if (!ProjectToSend) {
      return res.status(404).json({ message: "Project not found" });
    }
    ProjectToSend.SendProject = false;
    const response = await ProjectToSend.save();
    if (response) {
      // const CheckUser = await User.findById(userId);
      // if (CheckUser.user_type !== "H.O.D") {
      //   const EventHandle = new Event({
      //     userId: userId,
      //     projectId: response.projectId,
      //     departmentId: CheckUser.DepartmentID,
      //     actions: "CancelSend ",
      //   });
      //   await EventHandle.save();
      // }
      // const eventData = {
      //   message: "New vote received",
      //   departmentId: CheckUser.departmentID, // Include user ID here
      // };
      // pusher.trigger("poll", "vote", eventData);
      return res
        .status(200)
        .json({ message: "The transmission has been canceled successfully" });
    }
    return res
      .status(200)
      .json({ message: "Product sent successfully", response });
  } catch (error) {
    return res.status(500).json({
      message: "The transmission has been canceled felid",
      error: error,
    });
  }
};
const getDataBySendUserProjectAndProduct = async (req, res) => {
  try {
    const DepartmentID = req.params.id;
    const response = await Project.find({
      sendProjectToManger: false,
      SendProject: true,
      DepartmentID,
    })
      .populate("DepartmentID")
      .populate("userId", "-updatedAt -createdAt -user_type -RoleId -image")
      .populate(
        "ManyPersonChrgeId",
        "-updatedAt -createdAt -user_type -RoleId -image"
      )
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate({
        path: "MutualProjectId",
        select: "-updatedAt -createdAt",
        populate: [
          {
            path: "ProjectManger",
            select: "-updatedAt -createdAt -user_type -RoleId -image ",
          },
        ],
      });

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getDataBySendUserProjectAndProduct:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataAllProjectHasCompleted = async (req, res) => {
  try {
    const { page = 1, rowsPerPage = 10, DepartmentId } = req.query; // Default values for pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalCount = await Project.countDocuments({
      SendProject: true,
    });
    const DepartmentID = DepartmentId;
    const response = await Project.find({
      SendProject: true,
      DepartmentID,
    })
      .populate("DepartmentID")
      .populate("userId", "-updatedAt -createdAt -user_type -RoleId -image")
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .populate({
        path: "MutualProjectId",
        select: "-updatedAt -createdAt",
        populate: [
          {
            path: "ProjectManger",
            select: "-updatedAt -createdAt -user_type -RoleId -image ",
          },
        ],
      })
      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    return res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error("Error in getDataBySendUserProjectAndProduct:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const setDataAsPdf = async (req, res) => {
  try {
    const { label, dataSet, dataProjectTest } = req.body;
    console.log(label);
    const browser = await puppeteer.launch({
      headless: "new",
      // args: ["--no-sandbox", "--disable-setuid-sandbox"],
      args: [
        "--disable-setuid-sandbox",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
      userDataDir: cacheDirectory,
      // executablePath: executablePath(), // specify the path to the Chrome executable if needed
    });

    const page = await browser.newPage();
    await page.setContent(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" />
        </head>
        <body>
          <div class="bg-eee">
            <div class="me-2 ms-2 mt-4">
              <div class="d-flex justify-content-center align-items-center">
                <div style="direction: rtl; font-family: Arial, sans-serif">
                  <p style="text-align: center;">جدول كميات B.O.Q</p>
                  <p style="text-align: center;">العرض الفني المسعر</p>
                  <p style="text-align: center;">الجهة المستفيدة :${
                    dataProjectTest.beneficiary
                  }/${dataProjectTest.NumberBook}</p>
                </div>
              </div>
              <table class="table table-striped" dir="rtl">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" style="font-weight:bold">اسم المنتج</th>
                    <th scope="col" style="font-weight:bold">الكمية</th>
                    <th scope="col" style="font-weight:bold">الوحدة</th>
                    ${
                      label === "OfferPriceIQR"
                        ? `<th scope="col" style="font-weight:bold">السعر IQD</th>
                      <th scope="col" style="font-weight:bold">السعر الإجمالي IQD</th>`
                        : label === "OfferPriceIQRAfterPercent"
                        ? `<th scope="col" style="font-weight:bold">  السعر بعد اضافة النسبة</th>
                      <th scope="col"> السعر الإجمالي بعد اضافة النسبةIQD</th>`
                        : label === "OfferPriceUSD"
                        ? `<th scope="col" style="font-weight:bold">السعر USD</th>
                      <th scope="col" style="font-weight:bold">السعر الإجمالي USD</th>`
                        : null
                    }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="p-3" style="background-color: #9E9E9E; font-weight:bold;text-align: center">
                    ${dataProjectTest.nameProject}
                    </td>
                  </tr>
                  ${
                    Array.isArray(dataSet.Products) &&
                    dataSet.Products.map(
                      (item, index) => `
                      <tr>
                        <th scope="row"style="font-weight:bold">${
                          index + 1
                        }</th>
                        <td style="background-color: #bdbdbd; font-weight:bold">${
                          item?.nameProduct
                        }</td>
                        <td>${item.Quantity}</td>
                        <td>${item.UnitId.Unit}</td>
                        ${
                          label === "OfferPriceIQR"
                            ? `<td>${dataSet.priceProduct[index]}</td>
                          <td>${dataSet.priceProductQuantity[index]}</td>`
                            : label === "OfferPriceIQRAfterPercent"
                            ? `<td>${dataSet.calculateAfterPercentageWithoutQuantity[index]}</td>
                          <td>${dataSet.calculatePriceAfterPercentageWith[index]}</td>`
                            : label === "OfferPriceUSD"
                            ? `<td>${dataSet.calculateAfterPercentageWithoutQuantityAndConvertToUsd[index]}</td>
                          <td>${dataSet.calculateAfterPercentageWithQuantityAndConvertToUsd[index]}</td>`
                            : null
                        }
                      </tr>
                    `
                    ).join("")
                  }
                  <tr>
                    <td colspan="5" class="p-3" style="background-color: #9e9e9e; font-weight:bold;text-align: center">
                      المجموع
                    </td>
                    <td>
                    ${
                      label === "OfferPriceIQR"
                        ? dataSet.calculateTotalPriceOF
                        : label === "OfferPriceIQRAfterPercent"
                        ? dataSet.SumTotalPriceAfterAdd
                        : label === "OfferPriceUSD"
                        ? dataSet.SumTFrNmFBpzPfDvDX8m4i7KdjsoNxzK2E62anvert
                        : null
                    }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `);
    const filePath = path.join(
      __dirname,
      "src",
      "Files",
      `${dataProjectTest.nameProject}_${label}.pdf`
    );
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    const pdfBuffer = await page.pdf({
      path: filePath,
      format: "A4",
      printBackground: false,
    });
    const pdfFilePath = `${dataProjectTest.nameProject}_${label}.pdf`;
    const dataFile = new FilesPrice({
      filesName: pdfFilePath,
      projectId: dataProjectTest && dataProjectTest._id,
    });
    const response = await dataFile.save();
    if (!response) {
      console.error("Error saving to database:", err);
      res.status(500).send("Error saving to database");
    } else {
      const encodedFileName = encodeURIComponent(response.filesName);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodedFileName}`
      );
      res.send(pdfBuffer);
    }

    // Close the page and browser after sending the response
    // await page.close();
    // await browser.close();
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};
const setDataAsPdfTest = async (req, res) => {
  try {
    const { label, dataSet, dataProjectTest } = req.body;

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();

    // Load Bootstrap CSS from CDN
    const bootstrapCSSUrl =
      "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
    const bootstrapCSS = await fetch(bootstrapCSSUrl).then((res) => res.text());

    // Set page content
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <style>${bootstrapCSS}</style>
        </head>
        <body>
          <div class="bg-eee">
            <div class="me-2 ms-2 mt-4">
              <div class="d-flex justify-content-center align-items-center">
                <div style="direction: rtl; font-family: Arial, sans-serif">
                  <p style="text-align: center;">جدول كميات B.O.Q</p>
                  <p style="text-align: center;">العرض الفني المسعر</p>
                  <p style="text-align: center;">الجهة المستفيدة :${
                    dataProjectTest.beneficiary
                  }/${dataProjectTest.NumberBook}</p>
                </div>
              </div>
              <table class="table table-striped" dir="rtl">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col" style="font-weight:bold">اسم المنتج</th>
                    <th scope="col" style="font-weight:bold">الكمية</th>
                    <th scope="col" style="font-weight:bold">الوحدة</th>
                    ${
                      label === "OfferPriceIQR"
                        ? `<th scope="col" style="font-weight:bold">السعر IQD</th>
                      <th scope="col" style="font-weight:bold">السعر الإجمالي IQD</th>`
                        : label === "OfferPriceIQRAfterPercent"
                        ? `<th scope="col" style="font-weight:bold">  السعر بعد اضافة النسبة</th>
                      <th scope="col"> السعر الإجمالي بعد اضافة النسبةIQD</th>`
                        : label === "OfferPriceUSD"
                        ? `<th scope="col" style="font-weight:bold">السعر USD</th>
                      <th scope="col" style="font-weight:bold">السعر الإجمالي USD</th>`
                        : ""
                    }
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="p-3" style="background-color: #9E9E9E; font-weight:bold;text-align: center">
                    ${dataProjectTest.nameProject}
                    </td>
                  </tr>
                  ${
                    Array.isArray(dataSet.Products) &&
                    dataSet.Products.map(
                      (item, index) => `
                      <tr>
                        <th scope="row"style="font-weight:bold">${
                          index + 1
                        }</th>
                        <td style="background-color: #bdbdbd; font-weight:bold">${
                          item?.nameProduct
                        }</td>
                        <td>${item.Quantity}</td>
                        <td>${item.UnitId.Unit}</td>
                        ${
                          label === "OfferPriceIQR"
                            ? `<td>${dataSet.priceProduct[index]}</td>
                          <td>${dataSet.priceProductQuantity[index]}</td>`
                            : label === "OfferPriceIQRAfterPercent"
                            ? `<td>${dataSet.calculateAfterPercentageWithoutQuantity[index]}</td>
                          <td>${dataSet.calculatePriceAfterPercentageWith[index]}</td>`
                            : label === "OfferPriceUSD"
                            ? `<td>${dataSet.calculateAfterPercentageWithoutQuantityAndConvertToUsd[index]}</td>
                          <td>${dataSet.calculateAfterPercentageWithQuantityAndConvertToUsd[index]}</td>`
                            : ""
                        }
                      </tr>
                    `
                    ).join("")
                  }
                  <tr>
                    <td colspan="5" class="p-3" style="background-color: #9e9e9e; font-weight:bold;text-align: center">
                      المجموع
                    </td>
                    <td>
                    ${
                      label === "OfferPriceIQR"
                        ? dataSet.calculateTotalPriceOF
                        : label === "OfferPriceIQRAfterPercent"
                        ? dataSet.SumTotalPriceAfterAdd
                        : label === "OfferPriceUSD"
                        ? dataSet.SumTFrNmFBpzPfDvDX8m4i7KdjsoNxzK2E62anvert
                        : ""
                    }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </body>
      </html>
    `;

    // Convert HTML to PDF bytes
    const pdfBytes = await page.pdf(htmlContent, {
      size: "A4",
      printBackground: true,
    });

    // Define file path to save the PDF
    const filePath = path.join(
      __dirname,
      "src",
      "Files",
      `${dataProjectTest.nameProject}_${label}.pdf`
    );

    // Write the buffer to a file
    await fs.writeFile(filePath, pdfBytes);

    // Save the file information to the database
    const pdfFilePath = `${dataProjectTest.nameProject}_${label}.pdf`;
    const dataFile = new FilesPrice({
      filesName: pdfFilePath,
      projectId: dataProjectTest && dataProjectTest._id,
    });
    const response = await dataFile.save();

    if (!response) {
      console.error("Error saving to database:", err);
      res.status(500).send("Error saving to database");
    } else {
      const encodedFileName = encodeURIComponent(response.filesName);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${encodedFileName}`
      );
      res.send(pdfBytes);
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Error generating PDF");
  }
};
const setDataAsPdfHtmlPdf = async (req, res) => {
  try {
    const { label, dataSet, dataProjectTest } = req.body;
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap">
        <style>
          body, p, td, th, span {
             font-family: "Cairo", Avenir, Helvetica, Arial, sans-serif !important;
             font-style: normal;
            font-optical-sizing: auto
          }
          table {
            border-collapse: collapse;
            width: 100%;
          }
          td, th {
            border: 1px solid #dddddd;
            direction: rtl;
            padding: 8px;
          }
          tr:nth-child(even) {
            background-color: #dddddd;
          }
        </style>
      </head>
      <body>
        <div class="bg-eee">
          <div class="me-2 ms-2 mt-4">
            <div class="d-flex justify-content-center align-items-center">
              <div style="direction: rtl; font-family: Arial, sans-serif">
                <p style="text-align: center;">جدول كميات B.O.Q</p>
                <p style="text-align: center;">العرض الفني المسعر</p>
                <p style="text-align: center;">الجهة المستفيدة : ${
                  dataProjectTest.beneficiary
                }/${dataProjectTest.NumberBook}</p>
              </div>
            </div>
            <table class="table table-striped" dir="rtl">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col" style="font-weight:bold">اسم المنتج</th>
                  <th scope="col" style="font-weight:bold">الكمية</th>
                  <th scope="col" style="font-weight:bold">الوحدة</th>
                  ${
                    label === "OfferPriceIQR"
                      ? `<th scope="col" style="font-weight:bold">السعر IQD</th>
                    <th scope="col" style="font-weight:bold">السعر الإجمالي IQD</th>`
                      : label === "OfferPriceIQRAfterPercent"
                      ? `<th scope="col" style="font-weight:bold">السعر بعد اضافة النسبة</th>
                    <th scope="col">السعر الإجمالي بعد اضافة النسبة IQD</th>`
                      : label === "OfferPriceUSD"
                      ? `<th scope="col" style="font-weight:bold">السعر USD</th>
                    <th scope="col" style="font-weight:bold">السعر الإجمالي USD</th>`
                      : ""
                  }
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colspan="6" class="p-3" style="background-color: #9E9E9E; font-weight:bold;text-align: center">
                    ${dataProjectTest.nameProject}
                  </td>
                </tr>
                ${
                  Array.isArray(dataSet.Products) &&
                  dataSet.Products.map(
                    (item, index) => `
                    <tr>
                      <th scope="row" style="font-weight:bold">${index + 1}</th>
                      <td style="background-color: #bdbdbd; font-weight:bold">${
                        item.nameProduct
                      }</td>
                      <td>${item.Quantity}</td>
                      <td>${item.UnitId.Unit}</td>
                      ${
                        label === "OfferPriceIQR"
                          ? `<td>${dataSet.priceProduct[index]}</td>
                        <td>${dataSet.priceProductQuantity[index]}</td>`
                          : label === "OfferPriceIQRAfterPercent"
                          ? `<td>${dataSet.calculateAfterPercentageWithoutQuantity[index]}</td>
                        <td>${dataSet.calculatePriceAfterPercentageWith[index]}</td>`
                          : label === "OfferPriceUSD"
                          ? `<td>${dataSet.calculateAfterPercentageWithoutQuantityAndConvertToUsd[index]}</td>
                        <td>${dataSet.calculateAfterPercentageWithQuantityAndConvertToUsd[index]}</td>`
                          : ""
                      }
                    </tr>
                  `
                  ).join("")
                }
                <tr>
                  <td colspan="5" class="p-3" style="background-color: #9e9e9e; font-weight:bold;text-align: center">
                    المجموع
                  </td>
                  <td>
                    ${
                      label === "OfferPriceIQR"
                        ? dataSet.calculateTotalPriceOF
                        : label === "OfferPriceIQRAfterPercent"
                        ? dataSet.SumTotalPriceAfterAdd
                        : label === "OfferPriceUSD"
                        ? dataSet.SumTotalPriceAfterAddPercentageAndConvertToUSD
                        : ""
                    }
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </body>
      </html>
    `;
    const pdfFilePath = path.join(
      __dirname,
      "pdfs",
      `${dataProjectTest.nameProject}_${label}.pdf`
    );
    const dataFile = new FilesPrice({
      filesName: `${dataProjectTest.nameProject}_${label}.pdf`,
      projectId: dataProjectTest._id,
    });
    const response = await dataFile.save();
    if (response) {
      const options = { format: "A4" };
      pdf.create(htmlContent, options).toFile(pdfFilePath, (err) => {
        if (err) {
          console.error("Error generating PDF:", err);
          res.status(500).send("Error generating PDF");
        } else {
          res.setHeader("Content-Type", "application/pdf");
          res.sendFile(pdfFilePath);
        }
      });
    }
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send(`Error generating PDF: ${error.message}`);
  }
};
const sendProjectToManager = async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  const date = new Date();
  try {
    const ProjectToSend = await Project.findById(projectId);
    if (!ProjectToSend) {
      return res.status(404).json({ message: "Project not found" });
    }
    if (ProjectToSend.sendProjectToManger === true) {
      return res
        .status(400)
        .json({ message: "The project has already been sent." });
    }
    ProjectToSend.sendProjectToManger = true;
    ProjectToSend.dateSendToManger = date;
    const response = await ProjectToSend.save();
    if (response) {
      const CheckUser = await User.findById(userId);
      const eventHandle = new Event({
        userId,
        productId: response._id,
        projectId: response._id,
        departmentId: response.departmentID,
        actions: "sendProjectToManager",
      });
      const saveData = await eventHandle.save();
      if (saveData) {
        const user = await User.findById(userId);
        const eventData = {
          name: "project_has_send_manager",
          message: `أرسل المشروع${user.name} المستخدم`,
          userId: user._id,
        };

        pusher.trigger("poll", "vote", eventData);
        return res
          .status(200)
          .json({ message: "Project sent successfully", response });
      }

      return res
        .status(200)
        .json({ message: "Project sent successfully", response });
    }
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while sending the project",
      error: error.message,
    });
  }
};
const getDataHasBeenSendByDepartmentToManger = async (req, res) => {
  try {
    const response = await Project.find({ sendProjectToManger: true })
      .populate("DepartmentID")
      .populate("userId")
      .populate("WorkNatural", "_id -updatedAt -createdAt");
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getDataBySendUserProjectAndProduct:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataFileINMangerSection = async (req, res) => {
  const ProjectId = req.params.id;
  try {
    const response = await FilesPrice.find({
      projectId: ProjectId,
    })
      .populate("userId")
      .populate("projectId")
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
const delayProjectFinaltime = async (req, res) => {
  const projectId = req.params.id;
  console.log("hello word");
  try {
    const projectToSend = await Project.findById(projectId);
    if (!projectToSend) {
      return res.status(404).json({ message: "Project not found" });
    }
    projectToSend.delayProjectCheck = true;
    const savedProject = await projectToSend.save();
    if (savedProject) {
      const users = await User.find({
        $or: [{ user_type: "manager" }, { user_type: "Assistance" }],
      });
      const departmentInfo = await Department.findById(
        savedProject.DepartmentID
      );
      if (departmentInfo) {
        users.map(async (item) => {
          const eventHandle = new Event({
            userId: item._id, // Collect all user IDs
            projectId: projectId,
            departmentId: savedProject.DepartmentID,
            actions: "delayProject",
          });
          const savedEvent = await eventHandle.save();
          if (savedEvent) {
            const eventData = {
              name: "projectDelay",
              message: `${departmentInfo.departmentName} تم أرسال المشروع الى المشاريع المتأخرة`,
              userId: savedEvent.userId,
            };
            pusher.trigger("poll", "vote", {
              ...eventData,
              userId: item._id,
            });
          }
        });
      }
    }
    return res
      .status(200)
      .json({ message: "The project deadline has been delayed", savedProject });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "The transmission has been  failed",
      error: error.message,
    });
  }
};
const CancelSendProjectDelay = async (req, res) => {
  const projectId = req.params.id;
  const userId = req.user.id;
  try {
    const ProjectToSend = await Project.findById(projectId);
    if (!ProjectToSend) {
      return res.status(404).json({ message: "Project not found" });
    }
    ProjectToSend.delayProjectCheck = false;
    const response = await ProjectToSend.save();
    if (response) {
      // const CheckUser = await User.findById(userId);
      // if (CheckUser.user_type !== "H.O.D") {
      //   const EventHandle = new Event({
      //     userId: userId,
      //     projectId: response.projectId,
      //     departmentId: CheckUser.DepartmentID,
      //     actions: "CancelSend ",
      //   });
      //   await EventHandle.save();
      // }
      // const eventData = {
      //   message: "New vote received",
      //   departmentId: CheckUser.departmentID, // Include user ID here
      // };
      // pusher.trigger("poll", "vote", eventData);
      return res
        .status(200)
        .json({ message: "The transmission has been canceled successfully" });
    }
    return res
      .status(200)
      .json({ message: "Product sent successfully", response });
  } catch (error) {
    return res.status(500).json({
      message: "The transmission has been canceled felid",
      error: error,
    });
  }
};
const setProjectCommon = async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.user_type;

    const { secondaryData, formData, DateBook, DateClose, startTime, endTime } =
      req.body;

    const requiredFields = [
      "nameProject",
      "NumberBook",
      "WorkNatural",
      "MethodOption",
      "Stage",
      "CompletionRate",
      "beneficiary",
      "LevelPerformance",
    ];
    for (let field of requiredFields) {
      if (!formData[field]) {
        return res
          .status(400)
          .json({ message: `The field ${field} is required` });
      }
    }
    // Get user data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "No user found" });
    }

    // Get department data
    const department = await Department.findById(user.DepartmentID);
    if (!department) {
      return res
        .status(400)
        .json({ message: "Error when getting department info" });
    }
    // Generate project code
    const code = await generateCode(
      secondaryData?.checkedItems || {},
      formData.NumberBook
    );
    if (!code) {
      return res.status(500).json({ message: "Error generating code" });
    }
    // Check if the project code already exists
    const existingProject = await Project.findOne({ Code: code });
    if (existingProject) {
      return res.status(500).json({ message: "Code already exists" });
    }
    let savedMutualProject;
    // Create and save a mutual project if secondaryData exists
    if (secondaryData) {
      const trueIds = Object.keys(secondaryData.checkedItems).filter(
        (id) => secondaryData.checkedItems[id] === true
      );
      const mutualProject = new MutualProject({
        DepartmentID: trueIds,
        ProjectManger: secondaryData.userSelect,
        common: secondaryData.common,
      });
      // Save mutual project if it contains valid data
      savedMutualProject = await mutualProject.save();
      if (!savedMutualProject) {
        return res.status(500).json({ message: "Error saving mutual project" });
      }
    }
    // Create a new project
    const newProject = new Project({
      nameProject: formData.nameProject,
      NumberBook: formData.NumberBook,
      comments: formData.comments,
      DateBook,
      DateClose,
      WorkNatural: formData.WorkNatural,
      MethodOption: formData.MethodOption,
      Stage: formData.Stage,
      CompletionRate: formData.CompletionRate,
      LevelPerformance: formData.LevelPerformance,
      beneficiary: formData.beneficiary,
      DepartmentID: department._id,
      Code: code,
      startTime,
      endTime,
      MutualProjectId: savedMutualProject._id,
    });
    // Save the new project
    const savedProject = await newProject.save();
    if (!savedProject) {
      return res.status(500).json({ message: "Error saving project" });
    }
    if (savedProject) {
      const eventHandle = new Event({
        userId: userId,
        projectId: savedProject._id,
        departmentId: user.DepartmentID,
        actions: "addProject",
      });
      await eventHandle.save();
    }
    if (userType.user_type !== user.user_type) {
      const eventData = {
        name: "Add_Project_Mutual",
        message: "A joint project has been sent",
        DepartmentID: savedMutualProject.DepartmentID,
      };
      pusher.trigger("poll", "vote", eventData);
    }
    return res.status(200).json({
      message: "Data added successfully",
      savedProject,
      savedMutualProject,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataAllByIdProjectMutual = async (req, res) => {
  await checkTime(res);
  try {
    console.log("hello word");
    const { page = 1, rowsPerPage = 10, DepartmentId } = req.query; // Default values for pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const totalCount = await Project.countDocuments({
      DepartmentID: DepartmentId,
      delayProjectCheck: false,
    });
    const response = await Project.find({
      DepartmentID: DepartmentId,
      delayProjectCheck: false,
    })
      .populate({
        path: "MutualProjectId",
        populate: {
          path: "ProjectManger",
          select: "",
        },
        populate: {
          path: "DepartmentID",
          select: "",
        },
      })
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataAllByIdProjectMutualDelay = async (req, res) => {
  await checkTime(res);
  try {
    const { page = 1, rowsPerPage = 10, DepartmentId } = req.query; // Default values for pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    console.log("hhhhh", DepartmentId);
    const totalCount = await Project.countDocuments({
      DepartmentID: DepartmentId,
      delayProjectCheck: true,
    });
    const response = await Project.find({
      DepartmentID: DepartmentId,
      delayProjectCheck: true,
    })
      .populate({
        path: "MutualProjectId",
        populate: {
          path: "ProjectManger",
          select: "",
        },
        populate: {
          path: "DepartmentID",
          select: "",
        },
      })
      .populate("WorkNatural", "_id -updatedAt -createdAt")
      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataByDepartmentMutualId = async (req, res) => {
  try {
    await checkTime(res);
    const { page = 1, rowsPerPage = 10, DepartmentId } = req.query; // Default values for pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }
    const mutualProjects = await MutualProject.find({
      DepartmentID: DepartmentId,
    }).exec();
    const mutualProjectIds = mutualProjects.map((project) => project._id);
    const totalCount = await Project.countDocuments({
      delayProjectCheck: false,
      MutualProjectId: { $in: mutualProjectIds },
    });
    const response = await Project.find({
      delayProjectCheck: false,
      MutualProjectId: { $in: mutualProjectIds },
    })
      .populate({
        path: "MutualProjectId",
        populate: [
          {
            path: "ProjectManger",
            select: "",
          },
          {
            path: "DepartmentID",
            select: "", // Specify the fields to select, leave empty for all fields
          },
        ],
      })
      .populate("WorkNatural", "_id -updatedAt -createdAt") // Populate WorkNatural with selected fields
      .sort({
        /* specify your sorting criteria here */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);
    res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const getDataMutualProjectBYUserId = async (req, res) => {
  try {
    console.log("Request received to get mutual projects by user ID");

    // Call checkTime function, ensure it's defined and works correctly
    await checkTime(res);

    // Destructure and parse query parameters with default values
    const { page = 1, rowsPerPage = 10, userId } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(rowsPerPage, 10);

    // Validate pagination parameters
    if (isNaN(pageNum) || isNaN(limitNum) || pageNum <= 0 || limitNum <= 0) {
      return res.status(400).json({ message: "Invalid pagination parameters" });
    }

    // Find mutual projects by userId
    const mutualProjects = await SendProjectMutualToSendEmploy.find({
      userId,
    }).exec();
    if (!mutualProjects) {
      return res
        .status(404)
        .json({ message: "No mutual projects found for this user" });
    }

    // Map to extract dataProjectIds
    const dataProjectIds = mutualProjects.map(
      (project) => project.dataProjectId
    );

    // Get total count of projects for pagination
    const totalCount = await Project.countDocuments({
      _id: { $in: dataProjectIds },
    });

    // Fetch projects with pagination, population, and sorting
    const response = await Project.find({ _id: { $in: dataProjectIds } })
      .populate({
        path: "MutualProjectId",
        populate: [
          {
            path: "ProjectManger",
            select: "",
          },
          {
            path: "DepartmentID",
            select: "", // Specify the fields to select, leave empty for all fields
          },
        ],
      })
      .populate("WorkNatural", "_id -updatedAt -createdAt") // Adjust fields as needed
      .sort({
        /* specify your sorting criteria here, e.g., { createdAt: -1 } */
      })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum);

    // Log and send response
    console.log(response);
    res.status(200).json({ response, totalCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
const getNumberOfProjectsCurrently = async (req, res) => {
  try {
    const Allprojects = await Project.find();
    const numberOfAllProjects = Allprojects.length;
    const projectsCurrent = await Project.find({ SendProject: false });
    const numberOfProjects = projectsCurrent.length;
    const projectsIsSend = await Project.find({ SendProject: true });
    const numberOfProjectsIsSend = projectsIsSend.length;
    const projectsDelay = await Project.find({ delayProjectCheck: true });
    const numberOfProjectsDelay = projectsDelay.length;
    res.status(200).json({
      count: numberOfProjects,
      count1: numberOfAllProjects,
      count2: numberOfProjectsIsSend,
      count3: numberOfProjectsDelay,
      projectsCurrent,
      projectsIsSend,
      projectsDelay,
      Allprojects,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "An error occurred while fetching the number of projects",
    });
  }
};
const updateDataPriceProjectTotal = async (req, res) => {};
const getallDataByDepartmentIdCheckMethodOption = async (req, res) => {
  try {
    const { departmentID } = req.query; // Default values for pagination
    const WorkNaturalId = req.body;
    const response = await Project.find(
      {
        DepartmentID: departmentID,
        WorkNatural: WorkNaturalId,
      },
      "WorkNatural _id"
    ).populate("WorkNatural", "-updatedAt -createdAt ");
    res.status(200).json({ response });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const IsCompleteProjectInsertData = async (req, res) => {
  const { id: userId } = req.user;
  try {
    const projectCheckComplete = await Project.findById(
      req.params.id,
      "-MethodOption"
    );
    console.log(projectCheckComplete);
    if (!projectCheckComplete) {
      return res.status(404).json({ message: "project not found" });
    }
    if (projectCheckComplete.isCompleteProject) {
      return res
        .status(403)
        .json({ message: "This project has been sent already" });
    }
    projectCheckComplete.isCompleteProject = true;
    const response = await projectCheckComplete.save();
    if (response) {
      let getDataUser = null;
      try {
        getDataUser = await User.findOne({
          DepartmentID: response.DepartmentID,
          user_type: "H.O.D",
        });

        if (getDataUser) {
          console.log(getDataUser);
        } else {
          console.log("Department not found");
        }
      } catch (error) {
        console.error("Error finding department:", error);
      }

      const eventHandle = new Event({
        userId,
        projectId: response._id,
        departmentId: response.DepartmentID,
        actions: "isCompleteProject",
      });
      const saveData = await eventHandle.save();
      console.log(saveData);
      if (saveData) {
        // Fetch user details for the event data
        const user = await User.findById(userId);
        // Prepare event data for pusher
        const eventData = {
          name: "project_isComplete_request",
          message: `تم أكمال المشروع من قبل الموظف ${user.name}`,
          userId: getDataUser._id,
        };
        // Trigger the event via pusher
        pusher.trigger("poll", "vote", eventData);
        // Send a success response
        return res.status(200).json({
          message: "Product edit request sent successfully",
          response,
        });
      }
    }
  } catch (error) {
    // Handle any errors that occur
    res.status(500).json({
      message: "An error occurred while processing the request",
      error: error.message,
    });
  }
};
module.exports = {
  SetProject,
  getallDataByDepartmentAndUserID,
  getAllDataByDepartmentAndUserIDWhenDelayCheckIsTrue,
  deleteById,
  getDataProjectById,
  getProjectById,
  getAllData,
  getDataByUserId,
  CancelSendProject,
  sendProject,
  getDateAsFileExcel,
  updateDataProjectById,
  sendProjectToManager,
  setDataAsPdf,
  getDataBySendUserProjectAndProduct,
  delayProjectFinaltime,
  getDataFileINMangerSection,
  getDataHasBeenSendByDepartmentToManger,
  getNumberOfProjectsCurrently,
  getDataAllByIdProjectMutual,
  setProjectCommon,
  setDataAsPdfHtmlPdf,
  getDataByDepartmentMutualId,
  setDataAsPdfTest,
  CancelSendProjectDelay,
  getDataAllByIdProjectMutualDelay,
  getDataMutualProjectBYUserId,
  getallDataByDepartmentQuantityTable,
  updateDataPriceProjectTotal,
  getDataAllProjectHasCompleted,
  getallDataByDepartmentIdCheckMethodOption,
  IsCompleteProjectInsertData,
};
