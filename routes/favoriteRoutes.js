const express = require('express');
const router = express.Router();

const { addFavoriteRoomController,getFavoriteRoomsController,removeSelectedFavoriteRoomsController } = require('../controllers/favoriteController');
const { authenticateJWT } = require('../middlewares/auth'); 

router.post('/add', authenticateJWT, addFavoriteRoomController);
router.get('/list', authenticateJWT, getFavoriteRoomsController);
 router.delete('/remove', authenticateJWT, removeSelectedFavoriteRoomsController); // Uncomment if you implement the remove functionality

module.exports = router;