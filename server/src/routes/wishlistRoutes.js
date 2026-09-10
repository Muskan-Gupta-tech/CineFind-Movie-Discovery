const express = require('express');
const wishlistController = require('../controllers/wishlistController');
const { validateWishlistPayload } = require('../middleware/validate');

const router = express.Router();

router.get('/', wishlistController.getWishlist);
router.post('/', validateWishlistPayload, wishlistController.addToWishlist);
router.delete('/:movieId', wishlistController.removeFromWishlist);

module.exports = router;
