require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const app = express();
const port = process.env.PORT || 8080;
const startBrowser = require('./crawl_data/browser');
const scrapeController = require('./crawl_data/scrapeController');

app.use(express.json());
app.use(morgan("combined"));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "GET, POST, PUT, PATCH, DELETE");
    res.status(200).json({});
  }
  next();
});

app.use("/api/auth", authRoutes);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  // let browser = startBrowser();
  // scrapeController(browser);
});
