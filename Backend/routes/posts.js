const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const postController = require('../controllers/postController');

// All endpoints apply `auth` middleware implicitly
router.get('/', auth, postController.getPosts);
router.post('/', auth, postController.createPost);
router.delete('/:id', auth, postController.deletePost);
router.put('/:id', auth, postController.updatePost);

router.put('/like/:id', auth, postController.likePost);
router.post('/comment/:id', auth, postController.addComment);
router.delete('/comment/:id/:comment_id', auth, postController.deleteComment);
router.get('/user/:id', auth, postController.getPostsByUserId);

module.exports = router;
