const path = require("path");
const { existsSync, unlink } = require("fs");

const ProcessorFile = (pathfile, res) => {
  try {
    console.log("Processing file:", pathfile);
    if (existsSync(pathfile)) {
      unlink(pathfile, (error) => {
        if (!error) {
          console.log("File deleted successfully");
        } else {
          console.error("Error deleting file:", error);
          res.status(500).json({ error: "Error deleting file" });
        }
      });
    } else {
      console.error("File does not exist:", pathfile);
      res.status(404).json({ error: "File does not exist", path: pathfile });
    }
  } catch (error) {
    console.error("ProcessorFile error:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = ProcessorFile;
