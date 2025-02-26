const expenseModel = require("../../models/expenseModel");
const mongoose = require("mongoose");

const expenseServices = {
  createExpense: async (userId, expenseData) => {
    return await expenseModel.findOneAndUpdate(
      { userId },
      { $push: { expenses: expenseData } },
      { upsert: true, new: true }
    );
  },

  getTotalExpenses: async (userId) => {
    const result = await expenseModel.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: "$expenses" },
      {
        $lookup: {
          from: "category", // collection name
          let: { expenseCategoryId: "$expenses.categoryId" },
          pipeline: [
            // Unwind the categories array in the category document
            { $unwind: "$categories" },
            {
              $match: {
                $expr: {
                  $eq: ["$categories._id", "$$expenseCategoryId"],
                },
              },
            },
            {
              $project: {
                _id: "$categories._id",
                name: "$categories.name",
                description: "$categories.description",
              },
            },
          ],
          as: "categoryDetails",
        },
      },

      // Unwind categoryDetails. Use preserveNullAndEmptyArrays so that expenses without a matching category still appear.
      {
        $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
      },

      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$expenses.amount" },
          expenses: {
            $push: {
              _id: "$expenses._id",
              amount: "$expenses.amount",
              description: "$expenses.description",
              date: "$expenses.date",
              category: "$categoryDetails",
            },
          },
        },
      },

      { $project: { _id: 0, totalAmount: 1, expenses: 1 } },
    ]);

    return result.length > 0 ? result[0] : { totalAmount: 0, expenses: [] };
  },

  findAllExpenses: async (userId) => {
    const expenseDoc = await expenseModel.findOne({ userId });
    return expenseDoc ? expenseDoc.expenses : [];
  },

  findExpenseById: async (userId, expenseId) => {
    const expenseDoc = await expenseModel.findOne({ userId });
    if (expenseDoc) {
      return expenseDoc.expenses.find(
        (expense) => expense._id.toString() === expenseId
      );
    }
    return null;
  },

  findExpensesByCategory: async (userId, categoryId) => {
    const expenseDoc = await expenseModel.findOne({ userId });
    if (expenseDoc) {
      return expenseDoc.expenses.filter(
        (expense) => expense.categoryId.toString() === categoryId
      );
    }
    return [];
  },

  updateExpenseById: async (userId, expenseId, updates) => {
    return await expenseModel.findOneAndUpdate(
      { userId, "expenses._id": expenseId },
      { $set: { "expenses.$": updates } },
      { new: true }
    );
  },

  deleteExpenseById: async (userId, expenseId) => {
    return await expenseModel.findOneAndUpdate(
      { userId },
      { $pull: { expenses: { _id: expenseId } } },
      { new: true }
    );
  },

  getMonthlyExpenseSummary: async (userId, month, year) => {
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month, 0); // Last day of the month

    const expenseDoc = await expenseModel.findOne({ userId });
    if (!expenseDoc) {
      return { totalExpenses: 0, expenses: [] };
    }

    // Filter expenses for the month
    const expenses = expenseDoc.expenses.filter(
      (expense) => expense.date >= startDate && expense.date <= endDate
    );

    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return {
      totalExpenses,
      expenses,
    };
  },

  getFilteredExpenses: async (userId, filters) => {
    const expenseDoc = await expenseModel.findOne({ userId });
    if (!expenseDoc) {
      return [];
    }

    let expenses = expenseDoc.expenses;

    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      expenses = expenses.filter(
        (expense) => expense.date >= startDate && expense.date <= endDate
      );
    }

    // Filter by category
    if (filters.categoryId) {
      expenses = expenses.filter(
        (expense) => expense.categoryId.toString() === filters.categoryId
      );
    }

    // Filter by amount range
    if (filters.minAmount || filters.maxAmount) {
      if (filters.minAmount) {
        expenses = expenses.filter(
          (expense) => expense.amount >= filters.minAmount
        );
      }
      if (filters.maxAmount) {
        expenses = expenses.filter(
          (expense) => expense.amount <= filters.maxAmount
        );
      }
    }

    return expenses;
  },

  getAllExpensesWithCategory: async (userId) => {
    const result = await expenseModel.aggregate([
      { $match: { userId: userId } },

      { $unwind: "$expenses" },

      {
        $lookup: {
          from: "category",
          let: { categoryId: "$expenses.categoryId" }, // Store categoryId from expense
          pipeline: [
            { $match: { $expr: { $eq: ["$$categoryId", "$categories._id"] } } }, // Match inside categories array
            { $unwind: "$categories" }, // Unwind categories to get individual category object
            { $match: { $expr: { $eq: ["$$categoryId", "$categories._id"] } } }, // Ensure correct category
            {
              $project: {
                _id: "$categories._id",
                name: "$categories.name",
                description: "$categories.description",
              },
            }, // Extract fields
          ],
          as: "categoryDetails",
        },
      },

      {
        $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true },
      }, // Keep expenses even if no category found

      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$expenses.amount" },
          expenses: {
            $push: {
              _id: "$expenses._id",
              amount: "$expenses.amount",
              description: "$expenses.description",
              date: "$expenses.date",
              category: "$categoryDetails",
            },
          },
        },
      },

      { $project: { _id: 0, totalAmount: 1, expenses: 1 } },
    ]);

    if (result.length === 0) {
      return {
        totalAmount: 0,
        expenses: [],
      };
    }

    return result[0];
  },
};

module.exports = expenseServices;
