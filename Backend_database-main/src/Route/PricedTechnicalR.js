const { Router } = require("express");
const { setPricedTechnical, setPdfDataOverPrice } = require("../Controller/PricedTechnicalControoler.js");
const upload = require("../middleware/upload.js");

const route = Router();
route.post("/setPricedTechnical", upload.single("filePricedTechnical"), setPricedTechnical);
route.post("/setPdfDataOverPrice", upload.single("filePricedTechnical"), setPdfDataOverPrice);
module.exports = route;
