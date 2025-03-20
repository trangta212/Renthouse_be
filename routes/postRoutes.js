const express = require("express"); 
const route = express.Router();
const { createPostController } = require("../controllers/postController");

route.post("/create-post", createPostController);

module.exports = route;


