const { model, Schema } = require('mongoose')
const passportLocalMongoose = require('passport-local-mongoose')
//const enc = require('mongoose-encryption')

// Passport Require
const findOrCreate = require('mongoose-findorcreate')

const usersSchema = new Schema ({
  username: {
    type: String,
    unique: true
  },
  password: String
})

//usersSchema.plugin(enc, {secret: process.env.SECRET, encryptedFields: ['password']})

usersSchema.plugin(passportLocalMongoose)
usersSchema.plugin(findOrCreate)

module.exports = model('Users', usersSchema)