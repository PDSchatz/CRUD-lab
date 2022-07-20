const mongoose = require('mongoose')

const Robots = new mongoose.Schema({
  creatorName: String,
  robotName: String,
  robotColor: String,
  killer: Boolean,
  friend: Boolean,
  serialNumber: Number,
  date: Date
})

module.exports = mongoose.model("robots", Robots)