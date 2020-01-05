const mongoose = require('mongoose')

const schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minlength: 2
  },
  published: {
    type: Number,
  },
  /*
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author'
  },
  */
  name: String,
  born: Number,
  genres: [
    { type: String}
  ]
})

module.exports = mongoose.model('Book', schema)