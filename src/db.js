const mongoose = require('mongoose')
const uri = 'mongodb+srv://admin:HYJVPVEaiAG3WyZH@cluster0.vm2ap.mongodb.net/usersDB?retryWrites=true&w=majority'

const db = mongoose.connection

main()
  .catch(err => console.log(err))

async function main() {
  await mongoose.connect(uri)
}

db.once('open', () => {
  console.log('Database conected on', uri)
})