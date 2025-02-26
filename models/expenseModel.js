const { Schema, model } = require("mongoose");

const expenseSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    expenses: [
      {
        categoryId: {
          type: Schema.Types.ObjectId,
          ref: "category",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        description: {
          type: String,
          trim: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("expense", expenseSchema, "expense");
