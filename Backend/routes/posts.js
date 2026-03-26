const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

// All endpoints apply `auth` middleware implicitly
router.get('/', auth, postController.getPosts);
router.post('/', auth, postController.createPost);
router.delete('/:id', auth, postController.deletePost);

module.exports = router;
