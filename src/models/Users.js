const { model, Schema } = require('mongoose')

const usersSchema = new Schema ({
  email: {
    type: String,
    unique: true
  },
  password: String
})

module.exports = model('Users', usersSchema)