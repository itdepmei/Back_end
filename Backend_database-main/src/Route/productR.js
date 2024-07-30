const { Router } = require("express");
const {
  setProduct,
  getAllDataByProjectId,
  productRequestEditPage,
  productRequestEditAllow,
  getDataByRequestAllow,
  getAllDataProductSendDataBYEmploy,
  updateDataProductById,
  getAllDataProductBYdepartmentId,
  deleteById,
  productRequestDeleteAllow,
  productRequestDeletePage,
  updateDataPriceProduct,
  updateDataPriceProductTotalEachProduct,
  setDataProductsFromFileExcel,
} = require("../Controller/ProductContrroler.js");
const Auth = require("../middleware/auth.js");
const upload = require("../middleware/upload.js");

const Route = Router();
Route.post("/setProduct/:id/:DepartmentID", Auth, setProduct);
Route.get("/getDataByProjectName/:id", getAllDataByProjectId);
Route.put("/ProductRequestEdit/:id", Auth, productRequestEditPage);
Route.put(
  "/ProductRequestEditAllow/:productId/:eventId",
  Auth,
  productRequestEditAllow
);
Route.get("/getDataByRequestAllow", getDataByRequestAllow);
Route.get(
  "/getAllDataOfProductForDepartmentID/:id",
  Auth,
  getAllDataProductSendDataBYEmploy
);
Route.get(
  "/getAllDataProductBYdepartmentId",
  Auth,
  getAllDataProductBYdepartmentId
);
Route.put("/updateDataProductById/:id", Auth, updateDataProductById);
Route.delete("/DeleteProduct/:id", Auth, deleteById);
Route.put("/productRequestDeletePage/:id", Auth, productRequestDeletePage);
Route.put(
  "/productRequestDeleteAllow/:productId/:eventId",
  Auth,
  productRequestDeleteAllow
);
Route.put("/updateDataPriceProductTotal/:id", updateDataPriceProduct);
Route.put(
  "/updateDataPriceProductTotalEachProduct/:id",
  updateDataPriceProductTotalEachProduct
);
Route.post("/setDataProductsFromFileExcel", upload.single("fileExcel"), setDataProductsFromFileExcel);
module.exports = Route;
