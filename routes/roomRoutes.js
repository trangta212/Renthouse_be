const express = require("express"); 
const route = express.Router();
const { getListRoomController } = require("../controllers/roomController");
const { getDetailRoomById } = require
("../controllers/roomController");
route.get("/", getListRoomController);
route.get("/:id", getDetailRoomById);

module.exports = route;