const express = require('express');
const router = express.Router();

const { addFavoriteRoomController } = require('../controllers/favoriteController');
const { authenticateJWT } = require('../middlewares/auth'); 

router.post('/add', authenticateJWT, addFavoriteRoomController);

module.exports = router;