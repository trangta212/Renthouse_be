const express = require("express"); 
const route = express.Router();
const { roomSearchController } = require("../controllers/roomSearchController");

route.get("/user/home/:location/:type/:priceRange/:area", roomSearchController);
module.exports = route;