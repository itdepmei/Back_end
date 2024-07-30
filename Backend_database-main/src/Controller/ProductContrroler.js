const Product = require("../Model/Product.js");
const pusher = require("../Config/pusherINfo.js");
const Event = require("../Model/EventM.js");
const { User } = require("../Model/User.js");
const { convertDataPrice } = require("../Config/function.js");
// insert data in database
const setProduct = async (req, res) => {
  console.log(req.body);
  const projectId = req.params.id;
  const userId = req.user.id;
  const departmentId = req.params.DepartmentID;
  const {
    nameProduct,
    description,
    Quantity,
    comments,
    Price,
    PriceType,
    UnitId,
    typeProduct,
    percent,
    PriceConvert,
    license,
  } = req.body;

  if (!nameProduct || !Quantity) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  const filterPrice = (price) => {
    if (typeof price === "string") {
      return price.replace(/[\s,]+/g, ""); // This removes all whitespace, line breaks, and commas
    }
    return price; // If Price is not a string, return it as is
  };

  const filteredPrice = filterPrice(Price);
  const trimmedNameProduct = nameProduct.trim();
  const trimmedDescription = description ? description.trim() : "";
  const trimmedComments = comments ? comments.trim() : "";
  const trimmedPriceType = PriceType ? PriceType.trim() : "";
  const trimmedTypeProduct = typeProduct ? typeProduct.trim() : "";
  const trimmedLicense = license ? license.trim() : "";
  try {
    const priceFunctionToHandelAnyPrice = convertDataPrice(
      PriceType,
      PriceConvert,
      filteredPrice
    );
    const product = new Product({
      nameProduct: trimmedNameProduct,
      description: trimmedDescription,
      Quantity,
      comments: trimmedComments,
      Price: priceFunctionToHandelAnyPrice,
      percent,
      PriceType: trimmedPriceType,
      UnitId,
      projectId,
      departmentID: departmentId,
      userId,
      typeProduct: trimmedTypeProduct,
      license: trimmedLicense,
      PriceConvert,
    });
    const response = await product.save();
    if (response) {
      const checkUser = await User.findById(userId);
      if (checkUser.user_type !== "H.O.D") {
        const eventHandle = new Event({
          userId,
          productId: response._id,
          projectId, // Use projectId instead of response.projectId
          departmentId: response.departmentId,
          actions: "Add",
        });
        await eventHandle.save();
      }

      const eventData = {
        message: `تم أظافة منتج جديد بواسطة المستخدم ${checkUser.name}`,
        departmentId: response.departmentId, // Include department ID here
      };

      pusher.trigger("poll", "vote", eventData);

      return res.status(200).json({ message: "Product added successfully" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "An error occurred while saving the product",
      error: err.message,
    });
  }
};

// end insert data in data base Product
// start get data by id project to display
const getAllDataByProjectId = async (req, res) => {
  const projectId = req.params.id;
  try {
    if (!projectId) {
      return res.status(400).json({ message: "Project ID is required" });
    }
    const response = await Product.find({ projectId }).populate("UnitId");
    if (response.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(response);
  } catch (err) {
    return res.status(500).json({ message: "An error occurred", error: err });
  }
};

// end
// delete the product
const deleteById = async (req, res) => {
  const productId = req.params.id;
  const userId = req.user.id;
  try {
    const response = await Product.findByIdAndDelete(productId);
    if (response) {
      const CheckUser = await User.findById(userId);
      if (!CheckUser || CheckUser.user_type !== "H.O.D") {
        const EventHandle = new Event({
          userId: userId,
          productId: response._id,
          projectId: response.projectId,
          departmentId: response.departmentID,
          actions: "deleteProduct",
        });
        await EventHandle.save();
        pusher.trigger("client", {
          name: "product_deleteProduct_request",
          message: `delete the product`,
          DepartmentID: response.departmentID,
        });
      }
      res.status(200).json({ message: "Product deleted successfully" });
    } else {
      return res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({
      message: "An error occurred while deleting the product",
      error: error.message,
    });
  }
};

const productRequestEditPage = async (req, res) => {
  const { id: productId } = req.params;
  const { id: userId } = req.user;
  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if a delete request has already been sent
    if (product.requestEdit) {
      return res
        .status(403)
        .json({ message: "This product has been sent already" });
    }
    // Mark the product for deletion
    product.requestEdit = true;
    // Save the product with the delete request flag
    const response = await product.save();

    if (response) {
      let getDataUser = null;
      try {
        getDataUser = await User.findOne({
          DepartmentID: response.departmentID,
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
        productId: response._id,
        projectId: response.projectId,
        departmentId: response.departmentID,
        actions: "edit",
      });
      const saveData = await eventHandle.save();
      if (saveData) {
        // Fetch user details for the event data
        const user = await User.findById(userId);
        // Prepare event data for pusher
        const eventData = {
          name: "product_Edit_request",
          message: `المستخدم ${user.name} طلب تعديل للمنتج `,

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
const productRequestEditAllow = async (req, res) => {
  const { productId, eventId } = req.params;
  const { id: userId } = req.user;
  try {
    // Fetch the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.allowRequest) {
      return res
        .status(403)
        .json({ message: "This product is already allowed to be requested." });
    }
    // Update product's allowRequestDelete field
    product.allowRequest = true;
    const updatedProduct = await product.save();
    // Fetch the event data by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    // Create and save a new event
    const eventHandle = new Event({
      userId,
      productId: product._id,
      projectId: updatedProduct.projectId,
      departmentId: updatedProduct.departmentID,
      actions: "AllowEdit",
    });
    await eventHandle.save();
    // Fetch the user data by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare and send the event data using pusher
    const eventData = {
      name: "product_AllowEdit_request",
      message: `${user.name} تمت الموافقة على التعديل`,
      userId: event.userId,
    };
    pusher.trigger("poll", "vote", eventData);

    // Send success response
    return res.status(200).json({
      message: "Product Edit request allowed successfully",
      product: updatedProduct,
    });
  } catch (error) {
    // Handle errors
    console.error("Error processing the delete request:", error);
    return res.status(500).json({
      message: "An error occurred while processing the edit request",
      error: error.message,
    });
  }
};
const productRequestDeletePage = async (req, res) => {
  const { id: productId } = req.params;
  const { id: userId } = req.user;

  try {
    // Find the product by ID
    const product = await Product.findById(productId);

    // Check if the product exists
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if a delete request has already been sent
    if (product.requestDelete) {
      return res.status(403).json({
        message: "This product has already been requested for deletion",
      });
    }

    // Mark the product for deletion
    product.requestDelete = true;

    // Save the product with the delete request flag
    const response = await product.save();

    console.log("Response from product.save():", response); // Add this line for debugging

    if (!response) {
      return res.status(500).json({
        message: "Error occurred while saving the product",
      });
    }

    console.log(response.departmentID);
    let getDataUser = null;

    try {
      getDataUser = await User.findOne({
        DepartmentID: response.departmentID,
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
      productId: response._id,
      projectId: response.projectId,
      departmentId: response.departmentID,
      actions: "Delete",
    });
    // Save the event
    const saveData = await eventHandle.save();
    if (!saveData) {
      return res.status(500).json({
        message: "Error occurred while saving the event",
      });
    }
    const user = await User.findById(userId);
    const eventData = {
      name: "product_delete_request",
      message: `The user ${user.name} has requested to delete the product`,
      message: `المستخدم ${user.name} طلب حذف للمنتج`,

      userId: getDataUser ? getDataUser._id : null, // Handle case when getDataUser is not found
    };
    pusher.trigger("poll", "vote", eventData);
    return res.status(200).json({
      message: "Product delete request sent successfully",
      response,
    });
  } catch (error) {
    // Handle any errors that occur
    console.error("An error occurred:", error);
    return res.status(500).json({
      message: "An error occurred while processing the request",
      error: error.message,
    });
  }
};

const productRequestDeleteAllow = async (req, res) => {
  // const { ProductId: productId, EventId: eventId } = req.params;
  const { productId, eventId } = req.params;
  const { id: userId } = req.user;
  console.log(productId);
  console.log(eventId);
  try {
    // Fetch the product by ID
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already allowed to be requested
    if (product.allowRequestDelete) {
      return res
        .status(403)
        .json({ message: "This product is already allowed to be requested." });
    }

    // Update product's allowRequestDelete field
    product.allowRequestDelete = true;
    const updatedProduct = await product.save();

    // Fetch the event data by ID
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Create and save a new event
    const eventHandle = new Event({
      userId,
      productId: product._id,
      projectId: updatedProduct.projectId,
      departmentId: updatedProduct.departmentID,
      actions: "AllowDelete",
    });
    await eventHandle.save();
    // Fetch the user data by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare and send the event data using pusher
    const eventData = {
      name: "product_AllowDelete_request",
      message: `${user.name}  وافق على طلب الحذف`,
      userId: event.userId,
    };
    pusher.trigger("poll", "vote", eventData);
    // Send success response
    return res.status(200).json({
      message: "Product Delete request allowed successfully",
      product: updatedProduct,
    });
  } catch (error) {
    // Handle errors
    console.error("Error processing the delete request:", error);
    return res.status(500).json({
      message: "An error occurred while processing the edit request",
      error: error.message,
    });
  }
};

const getAllDataProductSendDataBYEmploy = async (req, res) => {
  try {
    const departmentID = req.params.id;
    const userID = req.user;
    if (userID.user_type !== "H.O.D") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const checkDataIfSendOrNot = await Product.find({ send: true });
    if (checkDataIfSendOrNot.length === 0) {
      return res
        .status(404)
        .json({ message: "No product found with send status true" });
    }
    const response = await Product.find({ departmentID })
      .populate("departmentID", "-_id -brief")
      .populate("userId", "-username -DepartmentID -user_type");
    if (!response || response.length === 0) {
      return res
        .status(404)
        .json({ message: "Product NOT found in this Department" });
    }
    return res.status(200).json({ response });
  } catch (error) {
    console.error("An error occurred while fetching the products", error);
    res.status(500).json({
      message: "An error occurred while fetching the products",
      error,
    });
  }
};

const updateDataProductById = async (req, res) => {
  try {
    const {
      nameProduct,
      description,
      Quantity,
      comments,
      Price,
      PriceType,
      percent,
      PriceConvert,
      UnitId,
      license,
      typeProduct,
    } = req.body;

    const productId = req.params.id;
    const userId = req.user.id;

    const filterPrice = (price) => {
      if (typeof price === "string") {
        return price.replace(/[\s,]+/g, ""); // This removes all whitespace, line breaks, and commas
      }
      return price; // If Price is not a string, return it as is
    };

    const filteredPrice = filterPrice(Price);
    const trimmedNameProduct = nameProduct ? nameProduct.trim() : "";
    const trimmedDescription = description ? description.trim() : "";
    const trimmedComments = comments ? comments.trim() : "";
    const trimmedPriceType = PriceType ? PriceType.trim() : "";
    const trimmedLicense = license ? license.trim() : "";
    const priceFunctionToHandleAnyPrice = convertDataPrice(
      PriceType,
      PriceConvert,
      filteredPrice
    );

    const updatedFields = {};
    if (nameProduct) updatedFields.nameProduct = trimmedNameProduct;
    if (description) updatedFields.description = trimmedDescription;
    if (Price) updatedFields.Price = priceFunctionToHandleAnyPrice;
    if (comments) updatedFields.comments = trimmedComments;
    if (Quantity) updatedFields.Quantity = Quantity;
    if (PriceConvert) updatedFields.PriceConvert = PriceConvert;
    if (percent) updatedFields.percent = percent;
    if (PriceType) updatedFields.PriceType = trimmedPriceType;
    if (typeProduct) updatedFields.typeProduct = typeProduct;
    if (license) updatedFields.license = trimmedLicense;
    if (UnitId) updatedFields.UnitId = UnitId;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updatedFields,
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (req.user.user_type !== "H.O.D") {
      const EventHandle = new Event({
        userId: userId,
        productId: productId,
        projectId: updatedProduct.projectId,
        departmentId: updatedProduct.departmentID,
        actions: "edit",
      });
      await EventHandle.save();
    }

    res
      .status(200)
      .json({ message: "Product updated successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateDataPriceProduct = async (req, res) => {
  try {
    const { productTotalPrice, priceConvertEdit } = req.body;
    const productId = req.params.id;
    console.log(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        Price: productTotalPrice,
        PriceConvert: priceConvertEdit,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "product update successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const updateDataPriceProductTotalEachProduct = async (req, res) => {
  try {
    const { productTotalPrice } = req.body;
    const productId = req.params.id;
    console.log(req.body);
    const filterPrice = (productTotalPrice) => {
      if (typeof productTotalPrice === "string") {
        return productTotalPrice.replace(/[\s,]+/g, ""); // This removes all whitespace, line breaks, and commas
      }
      return productTotalPrice; // If Price is not a string, return it as is
    };

    const filteredPrice = filterPrice(productTotalPrice);
    console.log(filteredPrice);
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        productTotalPrice: filteredPrice,
      },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "product update successfully", updatedProduct });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDataByRequestAllow = async (req, res) => {
  try {
    const products = await Product.find({ allowRequest: true });
    if (products.length === 0) {
      return res
        .status(404)
        .json({ message: "No products found with allow request true" });
    }

    res.status(200).json({ products });
  } catch (error) {
    console.error("An error occurred while fetching the products", error);
    res.status(500).json({
      message: "An error occurred while fetching the products",
      error,
    });
  }
};

const getAllDataProductBYdepartmentId = async (req, res) => {
  try {
    const { DepartmentId } = req.query; // Default values for pagination
    const response = await Product.find({ departmentID: DepartmentId })
      .populate("departmentID", "-_id -brief")
      .populate("userId", "-username -DepartmentID -user_type")
      .populate({
        path: "projectId",
        populate: {
          path: "userId",
          select: "",
        },
      });

    if (!response || response.length === 0) {
      return res
        .status(404)
        .json({ message: "Product NOT found in this Department" });
    }
    return res.status(200).json({ response });
  } catch (error) {
    console.error("An error occurred while fetching the products", error);
    res.status(500).json({
      message: "An error occurred while fetching the products",
      error,
    });
  }
};
const setDataProductsFromFileExcel = async (req, res) => {
  try {
    const buffer = req.file?.buffer;
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const excelData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    console.log(excelData);
    // Save data to MongoDB
    // const response = await Student.insertMany(excelData);
    if (response) {
      res
        .status(200)
        .json({ message: "Data uploaded successfully.", response });
    }
    res.status(500).send("Error uploading data ");
  } catch (error) {
    console.log(error);
    res.status(401).send("Invalid File" + error.message);
  }
};
const setDataFromFileWord = async () => {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    const buffer = req.file.buffer;
    const result = await mammoth.extractRawText({ buffer });

    // Process the extracted text as necessary
    const rawData = result.value;
    console.log(rawData);

    // Assuming the data is JSON-like (you'll need to parse and structure it appropriately)
    const data = JSON.parse(rawData);

    // Save data to MongoDB
    const response = await Student.insertMany(data);
    if (response) {
      res
        .status(200)
        .json({ message: "Data uploaded successfully.", response });
    } else {
      res.status(500).send("Error uploading data");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Invalid File " + error.message);
  }
};
module.exports = {
  setProduct,
  getAllDataByProjectId,
  deleteById,
  productRequestEditPage,
  productRequestEditAllow,
  getDataByRequestAllow,
  getAllDataProductSendDataBYEmploy,
  getAllDataProductBYdepartmentId,
  updateDataProductById,
  productRequestDeleteAllow,
  productRequestDeletePage,
  updateDataPriceProduct,
  updateDataPriceProductTotalEachProduct,

  setDataProductsFromFileExcel,
};
