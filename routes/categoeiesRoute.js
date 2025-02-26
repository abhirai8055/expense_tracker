const express = require("express");
const router = express.Router();
router.use(express.json());
const common = require("../utils/common");

const controller = require("../controller/categories");

router.post("/createCategory", common.auth, controller.createCategory);
router.put("/updateCategory", common.auth, controller.updateCategory);
router.get("/getCategoryByUserId", common.auth, controller.getCategoryByUserId);
router.get("/getCategoryById/:categoryId", common.auth, controller.getCategoryById);
router.get("/searchCategories", common.auth, controller.searchCategories);
router.delete("/deleteCategory", common.auth, controller.deleteCategory);
router.delete(
  "/deleteCategoryByUserId",
  common.auth,
  controller.deleteCategoryByUserId
);
router.get(
  "/getAllCategoriesByAdmin",
  common.auth,
  controller.getAllCategoriesByAdmin
);

module.exports = router;
