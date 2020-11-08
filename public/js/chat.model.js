const mongoose = require("mongoose")

var chatschema = new mongoose.Schema({
  name: String,
  text: String,
  timestamp: Date
})

module.exports = chatschema