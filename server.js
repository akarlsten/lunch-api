const express = require('express')

const { db } = require('./lib/db/database')
const { scheduledScrape } = require('./cron')

const app = express()

const restaurantData = db.value()

app.get('/', async (req, res) => {
  try {
    res.send(restaurantData)
  } catch (e) {
    res.status(400).send(e)
  }
})

app.listen(3000, () => {
  console.log('Server up on port 3000.')
  scheduledScrape()
})
