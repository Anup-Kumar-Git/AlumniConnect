const Post = require('../models/Post');
const User = require('../models/User');

// @route   GET /api/posts
// @desc    Get all posts (announcements)
// @access  Private (All authenticated users can see)
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }); // Newest first
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private (Admin only)
exports.createPost = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized. Admins only.' });
    }

    const newPost = new Post({
      title,
      content,
      image,
      author: req.user.id,
      authorName: user.name || 'Admin Admin'
    });

    const post = await newPost.save();
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Admin only)
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Checking if requester is Admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'Admin') {
      return res.status(401).json({ msg: 'Not authorized. Admins only.' });
    }

    await post.deleteOne();
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
};
