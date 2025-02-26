const express = require("express");
const router = express.Router();
router.use(express.json());
const common = require("../utils/common");

const controller = require("../controller/expenses");

router.post("/createExpense", common.auth, controller.createExpense);
router.put("/editExpense", common.auth, controller.editExpense);

router.get(
  "/getAllExpensesWithCategoryDetails",
  common.auth,
  controller.getAllExpensesWithCategoryDetails
);

router.get("/getFilteredExpenses", common.auth, controller.getFilteredExpenses);
router.get(
  "/getMonthlyExpenseSummary",
  common.auth,
  controller.getMonthlyExpenseSummary
);
router.delete("deleteByExpenseId", common.auth, controller.deleteByExpenseId);

module.exports = router;
