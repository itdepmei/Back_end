const express = require("express");
const cors = require("cors");
const { connect } = require("mongoose");
const { config } = require("dotenv");
const errorHandler = require("./src/middleware/errorHandel.js");

const UserRoute = require("./src/Route/UserRote.js");
const ProjectRoute = require("./src/Route/ProjectR.js");
const ProductRoute = require("./src/Route/productR.js");
const MinistriesRoute = require("./src/Route/MinistriesR.js");
const WorkNaturalRoute = require("./src/Route/WorkNaturalR.js");
const departmentRout = require("./src/Route/DepartmentR.js");
const EventRout = require("./src/Route/Event.js");
const MethodOption = require("./src/Route/MetodOptionR.js");
const SystemPriceR = require("./src/Route/SystemPriceR.js");
const UnitSystem = require("./src/Route/UintR.js");
const NotesRoute = require("./src/Route/NotesR.js");
const PricedTechnicalR = require("./src/Route/PricedTechnicalR.js");
const RoleRote = require("./src/Route/RoleRote.js");
const PermissionRote = require("./src/Route/PermassionRoter.js");
const UplaodFileRout = require("./src/Route/FileUploadR.js");
const path = require("path");
config();
const App = express();
App.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
App.use(express.json());
App.use(express.static("src/upload_Data/"));
App.use(express.static("src/Controller/pdfs"));
App.use("/api", UserRoute);
App.use("/api", ProjectRoute);
App.use("/api", ProductRoute);
App.use("/api/", MinistriesRoute);
App.use("/api/", WorkNaturalRoute);
App.use("/api/", departmentRout);
App.use("/api", EventRout);
App.use("/api/", MethodOption);
App.use("/api/", SystemPriceR);
App.use("/api", UnitSystem);
App.use("/api/", NotesRoute);
App.use("/api/", PricedTechnicalR);
App.use("/api", RoleRote);
App.use("/api", PermissionRote);
App.use("/api", UplaodFileRout);
App.use("/api", require("./src/Route/WProjectMutual.js"));
App.use("/api", require("./src/Route/ReportDailyR.js"));
App.use("/api", require("./src/Route/ReportMonth.js"));
App.use("/api", require("./src/Route/ExhibitionCompanyR.js"));


const port = process.env.PORT || 4000;
// connect(process.env.CONNECT || "mongodb://127.0.0.1:27017/atomaitionProject")
connect(
  process.env.CONNECT ||
    " mongodb+srv://bssmz97842:basseim12345678@cluster0.vlm5nfj.mongodb.net/testProject"
)
  .then(() => {
    console.log("connection");
  })
  .catch((error) => {
    console.log("failed", error);
  });
App.use(errorHandler);
App.get("/", (req, res) => {
  res.send("<h1>Welcome to my API </h1>");
});
App.all("*", (req, res) => {
  return res.status(404).json({ message: "not found route " });
});
App.listen(port, () => {
  console.log(`Server is running on http://127.0.0.1:${port}`);
});
