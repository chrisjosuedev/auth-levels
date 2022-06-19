const { model, Schema } = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
//const enc = require('mongoose-encryption')

const usersSchema = new Schema ({
  username: {
    type: String,
    unique: true
  },
  password: String
})

//usersSchema.plugin(enc, {secret: process.env.SECRET, encryptedFields: ['password']})

usersSchema.plugin(passportLocalMongoose)

module.exports = model('Users', usersSchema)