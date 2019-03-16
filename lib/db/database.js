const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync') // Will only be run from the server once a day
const adapter = new FileSync('db/db.json')
const db = low(adapter)

db.defaults({ date: '', restaurants: [] }).write()

module.exports = { db }
