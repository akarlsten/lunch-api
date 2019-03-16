// Runs the scraping once every 24 hrs and updates the db
const {
  writeDateToDb,
  scrapeKolgas,
  scrapeSlagt,
  scrapeInThePink,
  scrapeGlasklart,
  scrapeMiaMarias
} = require('./lib/scraper/scraper')

writeDateToDb()
scrapeKolgas()
scrapeSlagt()
scrapeInThePink()
scrapeGlasklart()
scrapeMiaMarias()
