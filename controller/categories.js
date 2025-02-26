const categoryServices = require("./services/categories");
const userServices = require("./services/user");
const userType = require("../models/enums/userType");

const mongoose = require("mongoose");
const Joi = require("joi");

const {
  checkCategoryExists,
  addCategory,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
  deleteCategoryByUserId,
  findAllCategories,
} = categoryServices;

const { findAdmin } = userServices;

module.exports = {
  async createCategory(req, res) {
    const schema = Joi.object({
      categoryName: Joi.string().required(),
      description: Joi.string().optional(),
    });
    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { categoryName, description } = validatedBody;
      const userId = req.userId;

      const newCategory = {
        name: categoryName,
        description,
      };
      const userCategories = await checkCategoryExists(userId);
      let result;
      if (userCategories) {
        result = await addCategory(userId, newCategory);
      } else {
        result = await createCategory(userId, newCategory);
      }

      return res.status(201).json({
        responseCode: 201,
        responseMessage: "Category created successfully",
        data: newCategory,
      });
    } catch (error) {
      console.log("Error", error);
      return res.status(500).send({
        responseCode: 500,
        message: "Something went wrong.",
        error: error.message,
      });
    }
  },

  async updateCategory(req, res) {
    const schema = Joi.object({
      categoryId: Joi.string().required(),
      categoryName: Joi.string().required(),
      description: Joi.string().optional(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { categoryId, categoryName, description } = validatedBody;

      const userId = req.userId;

      if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Invalid Category ID format.",
        });
      }

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User categories not found.",
        });
      }

      const categoryExists = userCategories.categories.some(
        (cat) => cat.id.toString() === categoryId
      );
      if (!categoryExists) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Category not found.",
        });
      }

      const updates = {
        name: categoryName,
        description,
      };

      const updatedCategory = await updateCategoryById(
        userId,
        categoryId,
        updates
      );

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Category updated successfully",
        data: updatedCategory,
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

  async getCategoryByUserId(req, res) {
    try {
      const userId = req.userId;

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "categories not found.",
        });
      }

      const categories = userCategories.categories;

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Categories fetched successfully",
        data: categories,
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
  
  async getCategoryById(req, res) {
    const schema = Joi.object({
      categoryId: Joi.string().required(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.params);
      const { categoryId } = validatedBody;
      const userId = req.userId;

      if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Invalid Category ID format.",
        });
      }

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User categories not found.",
        });
      }

      // Find the category by ID
      const category = userCategories.categories.find((cat) => cat._id.toString() === categoryId);
      
      if (!category) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Category not found.",
        });
      }

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Category fetched successfully",
        data: category,
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

  async searchCategories(req, res) {
     const schema = Joi.object({
      name: Joi.string().required(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.query);
      const { name } = validatedBody;
      const userId = req.userId;

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User categories not found.",
        });
      }

      // Filter categories by name
      const filteredCategories = userCategories.categories.filter((cat) => cat.name.toLowerCase().trim().includes(name.toLowerCase().trim())  );
   
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Categories fetched successfully",
        data: filteredCategories,
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

  async deleteCategory(req, res) {
    const schema = Joi.object({
      categoryId: Joi.string().required(),
    });

    try {
      const validatedBody = await schema.validateAsync(req.body);
      const { categoryId } = validatedBody;

      const userId = req.userId;
      if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({
          responseCode: 400,
          responseMessage: "Invalid Category ID format.",
        });
      }

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User categories not found.",
        });
      }

      const categoryExists = userCategories.categories.some(
        (cat) => cat._id.toString() === categoryId
      );
      if (!categoryExists) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "Category not found.",
        });
      }

      const result = await deleteCategoryById(userId, categoryId);

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Category deleted successfully",
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
  async deleteCategoryByUserId(req, res) {
    try {
      const userId = req.userId;

      const userCategories = await checkCategoryExists(userId);
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "User categories not found.",
        });
      }
      await deleteCategoryByUserId(userId);
      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Category deleted successfully",
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

  //admin oprations
  async getAllCategoriesByAdmin(req, res) {
    try {
      const userId = req.userId;
      const admin = await findAdmin({
        _id: userId,
        userType: userType.ADMIN,
      });
      if (!admin) {
        return res.status(403).send({
          responseCode: 403,
          responseMessage: "Unothorized, only accessible for admin.",
        });
      }

      const userCategories = await findAllCategories();
      if (!userCategories) {
        return res.status(404).json({
          responseCode: 404,
          responseMessage: "categories not found.",
        });
      }

      return res.status(200).json({
        responseCode: 200,
        responseMessage: "Categories fetched successfully",
        data: userCategories,
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
