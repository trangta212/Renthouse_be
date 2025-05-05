const express = require("express"); 
const route = express.Router();
const { getListRoomController } = require("../controllers/roomController");
const { getDetailRoomById } = require
("../controllers/roomController");
const { findNearbyRooms } = require("../controllers/roomController");
route.get("/", getListRoomController);
route.get("/near-room", findNearbyRooms);
route.get("/:id", getDetailRoomById);
module.exports = route;