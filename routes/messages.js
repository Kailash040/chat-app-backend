const express = require('express');
const Message = require('../models/Message');
const auth = require('../middlerware/auth');

const router = express.Router();
router.get('/:roomId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: 1 });

    res.json({
      status: 'success',
      results: messages.length,
      data: {
        messages
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { roomId: { $regex: req.user.id } }
      ]
    }).distinct('roomId');

    res.json({
      status: 'success',
      data: {
        rooms: messages
      }
    });
  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
});

module.exports = router;