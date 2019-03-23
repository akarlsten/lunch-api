const path = require('path')
const fs = require('fs')

const axios = require('axios')
const schedule = require('node-schedule')
const moment = require('moment')

const {
  writeDateToDb,
  scrapeKolgas,
  scrapeSlagt,
  scrapeInThePink,
  scrapeGlasklart,
  scrapeMiaMarias,
  scrapeNiagara
} = require('./lib/scraper/scraper')

//Basic logging
const logStream = fs.createWriteStream(path.join(__dirname, 'log/log.txt'), { flags: 'a' })

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
    axios({
      method: 'post',
      url: 'https://api.netlify.com/build_hooks/5c967247036b78814b6488a6',
      data: {}
    })
      .then(res =>
        console.log(`Webhook sent - rebuilding frontend! ${res.statusText} - ${res.status}`)
      )
      .catch(error => console.log(error))
  })
}

// '0 5 * * *' every day at 05:00

const scheduledScrape = () => {
  scrapePages() //run it once every time server starts
  schedule.scheduleJob('0 5 * * *', () => {
    scrapePages()
  })
}

module.exports = { scheduledScrape }
