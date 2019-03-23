const path = require('path')
const express = require('express')

const db = require(path.join(__dirname, 'db/db.json')) //get that raw json babby
const { scheduledScrape } = require('./cron')

const app = express()

app.get('/', async (req, res) => {
  try {
    res.send(db)
  } catch (e) {
    res.status(400).send(e)
  }
})

app.listen(3000, () => {
  console.log('Server up on port 3000.')
  scheduledScrape()
})
