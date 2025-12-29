const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 }
});

module.exports = mongoose.model("Video", videoSchema);
