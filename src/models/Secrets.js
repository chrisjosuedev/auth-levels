const { model, Schema } = require('mongoose')

const secretsSchema = new Schema({
  secret: String
})

module.exports = model('Secrets', secretsSchema)