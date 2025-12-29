const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Poster",
  new mongoose.Schema({
    image: String
  })
);
