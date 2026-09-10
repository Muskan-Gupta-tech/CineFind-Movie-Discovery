const express = require('express');
const movieController = require('../controllers/movieController');
const { validatePage, validateSearchQuery, validateMovieId } = require('../middleware/validate');

const router = express.Router();

// Order matters: /search and /discover must be defined before /:id
// so Express doesn't try to treat "search" as a movie id.
router.get('/popular', validatePage, movieController.getPopular);
router.get('/top-rated', validatePage, movieController.getTopRated);
router.get('/now-playing', validatePage, movieController.getNowPlaying);
router.get('/upcoming', validatePage, movieController.getUpcoming);
router.get('/search', validatePage, validateSearchQuery, movieController.search);
router.get('/discover', validatePage, movieController.discover);
router.get('/:id', validateMovieId, movieController.getDetails);

module.exports = router;
