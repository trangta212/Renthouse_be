const { processContactAction } = require('../controllers/contactController');
const express = require("express"); 
const router = express.Router();
const { authenticateJWT } = require("../middlewares/auth");

router.post('/', authenticateJWT, processContactAction); 

module.exports = router;
