require('dotenv').config()
const { model, Schema } = require('mongoose')
//const enc = require('mongoose-encryption')

const usersSchema = new Schema ({
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    minlength: 8
  }
})

//usersSchema.plugin(enc, {secret: process.env.SECRET, encryptedFields: ['password']})

module.exports = model('Users', usersSchema)