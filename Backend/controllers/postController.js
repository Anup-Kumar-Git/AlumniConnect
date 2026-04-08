const Post = require('../models/Post');
const User = require('../models/User');
const Request = require('../models/Request');

// @route   GET /api/posts
// @desc    Get all posts (announcements)
// @access  Private (All authenticated users can see)
exports.getPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    let posts = [];
    if (user.role === 'Admin') {
      posts = await Post.find().sort({ createdAt: -1 }).lean();
    } else if (user.role === 'Student') {
      const requests = await Request.find({ student: user._id, status: 'Accepted' });
      const connectedAlumniIds = requests.map(req => req.alumni);
      
      const admins = await User.find({ role: 'Admin' });
      const adminIds = admins.map(admin => admin._id);
      
      const allowedIds = [...adminIds, ...connectedAlumniIds, user._id];
      posts = await Post.find({ author: { $in: allowedIds } }).sort({ createdAt: -1 }).lean();
    } else if (user.role === 'Alumni') {
      const admins = await User.find({ role: 'Admin' });
      const adminIds = admins.map(admin => admin._id);
      
      const allowedIds = [...adminIds, user._id];
      posts = await Post.find({ author: { $in: allowedIds } }).sort({ createdAt: -1 }).lean();
    }

    // Attach profile pictures to posts
    if (posts.length > 0) {
      const authorIds = [...new Set(posts.map(p => p.author.toString()))];
      const authors = await User.find({ _id: { $in: authorIds } }).select('profilePicture');
      const authorMap = {};
      authors.forEach(a => authorMap[a._id.toString()] = a.profilePicture);

      posts.forEach(p => {
         p.authorProfilePicture = authorMap[p.author.toString()] || null;
      });
    }

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private (All Roles)
exports.createPost = async (req, res) => {
  try {
    const { title, content, image } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(401).json({ msg: 'Not authorized. User not found.' });
    }

    let authorName = user.name || 'User';
    if (!user.name) {
       if (user.role === 'Admin') authorName = 'Admin';
       else if (user.role === 'Alumni') authorName = 'Alumni';
       else authorName = 'Student';
    }

    const newPost = new Post({
      title,
      content,
      image,
      author: req.user.id,
      authorName: authorName
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

    // Checking if requester is Admin or Post Author
    const user = await User.findById(req.user.id);
    if (!user || (user.role !== 'Admin' && post.author.toString() !== user.id.toString())) {
      return res.status(401).json({ msg: 'Not authorized to delete this post.' });
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

// @route   PUT /api/posts/like/:id
// @desc    Like or Unlike a post
// @access  Private
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    // Check if the post has already been liked by this user
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      // Get remove index
      const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
      post.likes.splice(removeIndex, 1);
    } else {
      post.likes.unshift({ user: req.user.id });
    }

    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   POST /api/posts/comment/:id
// @desc    Comment on a post
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const post = await Post.findById(req.params.id);

    const newComment = {
      text: req.body.text,
      userName: user.name || 'User',
      user: req.user.id
    };

    post.comments.push(newComment); // Add to end of array

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @route   DELETE /api/posts/comment/:id/:comment_id
// @desc    Delete comment
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Pull out comment
    const comment = post.comments.find(
      comment => comment._id.toString() === req.params.comment_id
    );

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist' });
    }

    // Check user (Only author of comment or an Admin can delete)
    const reqUser = await User.findById(req.user.id);
    if (comment.user.toString() !== req.user.id && reqUser.role !== 'Admin') {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    // Get remove index
    const removeIndex = post.comments
      .map(comment => comment._id.toString())
      .indexOf(req.params.comment_id);

    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
