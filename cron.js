// Runs the scraping once every 24 hrs and updates the db
const { scrapeKolgas, scrapeSlagt, scrapeInThePink } = require('./lib/scraper/scraper')

scrapeKolgas()
scrapeSlagt()
scrapeInThePink()
