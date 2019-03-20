// Runs the scraping once every 24 hrs and updates the db
const schedule = require('node-schedule')
const path = require('path')
const fs = require('fs')
const moment = require('moment')

const { db } = require(path.join(__dirname, '/lib/db/database'))
const logStream = fs.createWriteStream(path.join(__dirname, 'log/log.txt'), { flags: 'a' })
const {
  writeDateToDb,
  scrapeKolgas,
  scrapeSlagt,
  scrapeInThePink,
  scrapeGlasklart,
  scrapeMiaMarias,
  scrapeNiagara
} = require('./lib/scraper/scraper')

const scrapePages = () => {
  Promise.all([
    //wait for all the scraping to finish and update the db
    writeDateToDb(),
    scrapeKolgas(),
    scrapeSlagt(),
    scrapeInThePink(),
    scrapeGlasklart(),
    scrapeMiaMarias(),
    scrapeNiagara()
  ]).then(() => {
    logStream.write(`${moment().format('Y/M/D - HH:mm:ss')} - Database updated!\n`)
    console.log(`Database updated! At: ${moment().format('Y/M/D - HH:mm:ss')}`)
  })
}

// '0 5 * * *'

const scheduledScrape = () => {
  schedule.scheduleJob('0 5 * * *', () => {
    scrapePages()
  })
}

module.exports = { scheduledScrape }
