const { processContactAction,getContractListController } = require('../controllers/contactController');
const express = require("express"); 
const router = express.Router();
const { authenticateJWT } = require("../middlewares/auth");

router.post('/', authenticateJWT, processContactAction); 
router.get('/list', authenticateJWT, getContractListController);

module.exports = router;
