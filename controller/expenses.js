const expenseServices = require("./services/expenses");
const categoryServices = require("./services/categories");
const Joi = require("joi");
const mongoose = require("mongoose");

const {
  createExpense,
  updateExpenseById,
  findAllExpenses,
  getTotalExpenses,
  getFilteredExpenses,
  deleteExpenseById,
  getMonthlyExpenseSummary,
} = expenseServices;

const { findCategoryById } = categoryServices;

module.exports = {
  async createExpense(req, res) {
    const schema = Joi.object({
      categoryId: Joi.string().required(),
      amount: Joi.number().min(0).required(),
      description: Joi.string().optional(),
      date: Joi.string()
        .regex(/^\d{4}-\d{2}-\d{2}$/) //(YYYY-MM-DD)
        .optional(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { categoryId, amount, description, date } = validatedBody;

      const userId = req.userId;
      const category = await findCategoryById(userId, categoryId);
      if (!category) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Category not found.",
        });
      }
      const getFormattedDate = (date = new Date()) => {
        return date.toISOString().split("T")[0]; // Extracts YYYY-MM-DD
      };
      const expenseData = {
        categoryId,
        amount,
        description,
        date: date || getFormattedDate(),
      };

      const newExpense = await createExpense(userId, expenseData);

      return res.status(201).json({
        responseCode: 201,
        responseMessage: "Expense created successfully",
        data: newExpense,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async editExpense(req, res) {
    const schema = Joi.object({
      expenseId: Joi.string().required(),
      categoryId: Joi.string().optional(),
      amount: Joi.number().min(0).optional(),
      description: Joi.string().optional(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { expenseId, categoryId, amount, description } = validatedBody;

      const userId = req.userId;
      if (!mongoose.isValidObjectId(expenseId)) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Invalid Expense ID format.",
        });
      }

      const expenseDoc = await findAllExpenses(userId);
      if (!expenseDoc || expenseDoc.length === 0) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "No expenses found for this user.",
        });
      }

      const expenseIndex = expenseDoc.findIndex((expense) =>
        expense._id.equals(expenseId)
      );
      if (expenseIndex === -1) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Expense not found.",
        });
      }

      const existingExpense = expenseDoc[expenseIndex];

      if (categoryId) {
        const categoryExists = await findCategoryById(userId, categoryId);
        if (!categoryExists) {
          return res.status(404).json({
            responseCode: 404,
            responseMessage: "Category not found.",
          });
        }
      }

      const updates = {
        categoryId: categoryId || existingExpense.categoryId,
        amount: amount !== undefined ? amount : existingExpense.amount,
        description:
          description !== undefined ? description : existingExpense.description,
      };

      const updatedExpense = await updateExpenseById(
        userId,
        expenseId,
        updates
      );

      if (!updatedExpense) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Expense update failed.",
          data: null,
        });
      }

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Expense updated successfully",
        data: updatedExpense,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async getAllExpensesWithCategoryDetails(req, res) {
    try {
      const userId = req.userId;
      const result = await getTotalExpenses(userId);
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Expenses fetched successfully",
        data: result,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async getFilteredExpenses(req, res) {
    // Input validation schema
    const schema = Joi.object({
      startDate: Joi.date().optional(),
      endDate: Joi.date().optional(),
      categoryId: Joi.string().optional(),
      minAmount: Joi.number().min(0).optional(),
      maxAmount: Joi.number().min(0).optional(),
    });

    try {
      // Validate query parameters
      const validatedQuery = await schema.validateAsync(req.query);
      const { startDate, endDate, categoryId, minAmount, maxAmount } =
        validatedQuery;

      // Check if userId is available in the request
      const userId = req.userId;

      const filters = {};
      if (startDate && endDate) {
        filters.startDate = startDate;
        filters.endDate = endDate;
      }
      if (categoryId) {
        filters.categoryId = categoryId;
      }
      if (minAmount || maxAmount) {
        if (minAmount) filters.minAmount = minAmount;
        if (maxAmount) filters.maxAmount = maxAmount;
      }

      // Get filtered expenses
      const filteredExpenses = await getFilteredExpenses(userId, filters);

      // Return the response
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Filtered expenses fetched successfully",
        data: filteredExpenses,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async getMonthlyExpenseSummary(req, res) {
    const schema = Joi.object({
      month: Joi.number().min(1).max(12).required(),
      year: Joi.number().min(2000).required(),
    });

    try {
      const validatedQuery = await schema.validateAsync(req.query);
      const { month, year } = validatedQuery;

      const userId = req.userId;
      if (!userId) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "User ID is missing. Please log in again.",
        });
      }

      const summary = await getMonthlyExpenseSummary(
        userId,
        month,
        year
      );

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Monthly expense summary fetched successfully",
        data: summary,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async deleteByExpenseId(req, res) {
    const schema = Joi.object({
      expenseId: Joi.string().required(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { expenseId } = validatedBody;
      const userId = req.userId;

      if (!mongoose.isValidObjectId(expenseId)) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Invalid Expense ID format.",
        });
      }
      const expenseDoc = await findAllExpenses(userId);
      if (!expenseDoc || expenseDoc.length === 0) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "No expenses found for this user.",
        });
      }
      const result = await deleteExpenseById(userId);

      if (!result) {
        return res.status(400).json({
          responseCode: 200,
          responseMessage: "Error while deleting Expenses  ",
          data: null,
        });
      }
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Expenses fetched successfully",
        data: null,
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({
        responseCode: 500,
        responseMessage: "Something went wrong.",
        error: error.message,
      });
    }
  },
};
