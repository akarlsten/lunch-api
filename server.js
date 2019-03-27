const path = require('path')
const fs = require('fs')
const express = require('express')

const { scheduledScrape } = require('./cron')

const app = express()

app.get('/', async (req, res) => {
  try {
    fs.readFile(path.join(__dirname, 'db/db.json'), (err, json) => {
      const obj = JSON.parse(json)
      res.json(obj)
    })
  } catch (e) {
    res.status(400).send(e)
  }
})

app.listen(3000, () => {
  console.log('Server up on port 3000.')
  scheduledScrape()
})
