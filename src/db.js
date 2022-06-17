require('dotenv').config()
const mongoose = require('mongoose')
const uri = process.env.DB_URI

const db = mongoose.connection

main()
  .catch(err => console.log(err))

async function main() {
  await mongoose.connect(uri)
}

db.once('open', () => {
  console.log('Database conected on', uri)
})