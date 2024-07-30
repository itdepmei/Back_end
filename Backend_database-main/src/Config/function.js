const moment = require("moment");
const Project = require("../Model/Project.js");
const Department = require("../Model/Department.js");
const { default: puppeteer } = require("puppeteer");
const { User } = require("../Model/User.js");
const pusher = require("./pusherINfo.js");
const Event = require("../Model/EventM.js");
const formatDate = (Data) => {
  const date = new Date(Data);
  return moment(date).format("YYYY/MM/DD ");
};
const checkTime = async (res) => {
  try {
    const projects = await Project.find({ delayProjectCheck: false });
    if (!projects || projects.length === 0) {
      console.log(" data found", projects.length);
      return;
    }
    const fetchData = await User.find({
      $or: [{ user_type: "manager" }, { user_type: "Assistance" }],
    });
    const dateNow = new Date();
    for (let project of projects) {
      if (!project.endTime || project.endTime === null) {
        console.log("No date available for project ID:", project._id);
        return;
      }

      const endTime = new Date(project.endTime);
      console.log(endTime);
      if (dateNow > endTime || project.endTime!== null) {
        console.log("hh", dateNow > endTime);
        const departmentInfo = await Department.findById(project.DepartmentID);
        if (departmentInfo) {
          for (let item of fetchData) {
            if (!project.delayProjectCheck) {
              // res.status(400).json({ message: "this projects is delay" });
              console.log("event dedlain");
              for (let item of fetchData) {
                const eventHandle = new Event({
                  userId: item._id,
                  projectId: project._id,
                  departmentId: item.DepartmentID,
                  actions: "delayProject",
                });
                const response = await eventHandle.save();

                if (response) {
                  const eventData = {
                    name: "projectDelay",
                    message: `${departmentInfo.departmentName} تم أرسال المشروع الى المشاريع المتأخرة`,
                    userId: project.userId,
                  };
                  pusher.trigger("poll", "vote", {
                    ...eventData,
                    userId: item._id,
                  });
                  project.delayProjectCheck = true;
                  await project.save();
                  console.log("project has send too project delay");
                }
              }
            } else {
              // console.log("project hello else");
            }
          }
        }
      } else {
        console.log("erorreorooreroo");
      }
    }
  } catch (error) {
    console.log("Error:", error.message);
  }
};

const generateCode = async (secondaryData, NumberBook) => {
  if (secondaryData) {
    try {
      // Filter ids that have a true value
      const trueIds = Object.keys(secondaryData).filter(
        (id) => secondaryData[id] === true
      );

      // Fetch department information for each valid id
      const departmentInfoPromises = trueIds.map((id) =>
        Department.findById(id)
      );
      const departmentInfos = await Promise.all(departmentInfoPromises);

      // Create department symbols string
      const departmentSymbols = departmentInfos
        .map((info) => info.brief)
        .join("_");

      // Get current date information
      const currentDate = new Date();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear().toString().slice(-2);

      // Generate the code
      const code = `${departmentSymbols}${month}${year}${NumberBook}`;

      // Log and return the code
      console.log(code);
      return code;
    } catch (error) {
      console.error("Error fetching department information:", error);
      return null;
    }
  }
  return null;
};
let browser;
const launchBrowser = async () => {
  if (browser) return;
  browser = await puppeteer.launch();
};
async function handleEvent(userId, response) {
  try {
    const eventHandle = new Event({
      userId: userId,
      productId: response._id,
      projectId: response.projectId,
      departmentId: response.departmentID,
      actions: "edit",
    });

    const saveData = await eventHandle.save();

    if (saveData) {
      const finDataUser = await User.findById(userId);
      const eventData = {
        message: `The user ${finDataUser.name} has to request modification`,
        departmentId: response.departmentID,
      };

      pusher.trigger("poll", "vote", eventData);

      return {
        status: 200,
        message: "Product send request successfully",
        response,
      };
    }
  } catch (error) {
    return {
      status: 500,
      message: "An error occurred while processing the request",
      error: error.message,
    };
  }
}
function convertDataPrice(PriceType, PriceConvert, Price) {
  if (PriceType === "IQD") {
    return Price;
  } else if (PriceType === "USD") {
    return Price;
  } else {
    const afterConvertToUsd = Price / PriceConvert;
    return afterConvertToUsd * PriceConvert;
  }
}
module.exports = {
  generateCode,
  checkTime,
  formatDate,
  launchBrowser,
  handleEvent,
  convertDataPrice,
};
