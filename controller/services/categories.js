const Category = require("../../models/categoriesModel"); 
const mongoose = require("mongoose");

const categoryServices = {
  checkCategoryExists: async (userId) => {
    return await Category.findOne({ userId });
  },

  createCategory: async (userId, category) => {
    const newCategory = new Category({
      userId,
      categories: [category],
    });
    return await newCategory.save();
  },

  addCategory: async (userId, category) => {
    return await Category.findOneAndUpdate(
      { userId },
      { $push: { categories: category } },
      { new: true }
    );
  },

  findAllCategories: async () => {
    const categoryDoc = await Category.find({});
    return categoryDoc;
  },

  findCategoryById: async (userId, categoryId) => {
    const categoryDoc = await Category.findOne({ userId });
    if (categoryDoc) {
      return categoryDoc.categories.find(
        (category) => category._id.toString() === categoryId
      );
    }
    return null;
  },

  updateCategoryById: async (userId, categoryId, updates) => {
    return await Category.findOneAndUpdate(
      { userId, "categories._id": categoryId },
      { $set: { "categories.$": updates } },
      { new: true }
    );
  },

  deleteCategoryById: async (userId, categoryId) => {
    return await Category.findOneAndUpdate(
      { userId },
      { $pull: { categories: { _id: categoryId } } },
      { new: true }
    );
  },
  deleteCategoryByUserId: async (userId) => {
    return await Category.findOneAndDelete({ userId });
  },
};

module.exports = categoryServices;
