const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  hotel_id: { type: String, required: true, index: true },
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  rating_overall: { type: Number, required: true, min: 0, max: 10 },
  ratings: {
    cleanliness: { type: Number, min: 0, max: 10 },
    staff: { type: Number, min: 0, max: 10 },
    facilities: { type: Number, min: 0, max: 10 },
    location: { type: Number, min: 0, max: 10 },
    eco_friendliness: { type: Number, min: 0, max: 10 }
  },
  comment_text: { type: String },
  nights_stayed: { type: Number },
  created_at: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

const createComment = async (req, res) => {
  const { hotel_id, user_name, rating_overall, ratings, comment_text, nights_stayed } = req.body;
  try {
    const comment = new Comment({
      hotel_id,
      user_id: req.user.uid,
      user_name,
      rating_overall,
      ratings,
      comment_text,
      nights_stayed
    });
    await comment.save();
    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create comment' });
  }
};

const getCommentsByHotel = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;
  try {
    const comments = await Comment.find({ hotel_id: req.params.hotelId })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Comment.countDocuments({ hotel_id: req.params.hotelId });

    // Calculate average ratings
    const aggregation = await Comment.aggregate([
      { $match: { hotel_id: req.params.hotelId } },
      {
        $group: {
          _id: null,
          avg_overall: { $avg: '$rating_overall' },
          avg_cleanliness: { $avg: '$ratings.cleanliness' },
          avg_staff: { $avg: '$ratings.staff' },
          avg_facilities: { $avg: '$ratings.facilities' },
          avg_location: { $avg: '$ratings.location' },
          avg_eco_friendliness: { $avg: '$ratings.eco_friendliness' }
        }
      }
    ]);

    res.json({
      data: comments,
      averages: aggregation[0] || null,
      total,
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

module.exports = { createComment, getCommentsByHotel };