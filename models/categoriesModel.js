const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");

const categoriesSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId, 
      ref: "user", 
      required: true,
      unique: true, 
    },
    categories: [
      {
        name: {
          type: String,
          required: true,
          trim: true, 
        },
        description: {
          type: String,
          trim: true,
        },
      },
    ],
  },
  { timestamps: true } 
);

module.exports = model("category", categoriesSchema, "category");