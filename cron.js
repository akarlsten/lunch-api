// Runs the scraping once every 24 hrs and updates the db
const { scrapeKolgas, scrapeSlagt } = require('./lib/scraper/scraper')

scrapeKolgas()
scrapeSlagt()
