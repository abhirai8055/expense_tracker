require("dotenv").config();
const express = require("express");
const app = express();
require("./config/db");
// const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const expenses = require("./routes/expensesRoutes");
const categories = require("./routes/categoeiesRoute");
// const fileUpload = require("express-fileupload");

app.use(express.json());
// app.use(
//   fileUpload({
//     useTempFiles: true,
//     tempFileDir: "C:/Users/mayan/Desktop/a2/profile",
//   })
// );

app.use("/user", userRoutes);
app.use("/expenses", expenses);
app.use("/categories", categories);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
