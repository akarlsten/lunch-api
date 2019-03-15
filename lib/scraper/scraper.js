const osmosis = require('osmosis')
const { db } = require('../db/database')

const writeToDb = result => {
  db.get('restaurants') //Remove any old entries
    .remove({ name: this.name })
    .get('restaurants')
    .push(result)
    .write()

  db.get('restaurants')
    .push(result)
    .write()
}

// Restaurang Kolgas
const scrapeKolgas = () => {
  const result = {
    name: 'Kolgas',
    position: {
      lat: '55.61277',
      long: '12.99843'
    },
    address: {
      street: 'Hans Michelsensgatan 1C',
      postCode: '21120',
      city: 'MALMÖ'
    }
  }
  osmosis
    .get('https://kolga.gastrogate.com/lunch/')
    .set([osmosis.find('.lunch-day-content:first > .lunch-menu-item > .td_title').set('dish')])
    .data(data => {
      result.menuItems = data
    })
    .done(() => {
      writeToDb(result)
    })
}

const scrapeSlagt = () => {
  const result = {
    name: 'Slagthuset',
    position: {
      lat: '55.61133',
      long: '13.00281'
    },
    address: {
      street: 'Carlsgatan 12E',
      postCode: '21120',
      city: 'MALMÖ'
    }
  }
  osmosis
    .get('http://slagthusetmmx.se')
    .set([osmosis.find('//*[@id="dagens-lunch"]/div/div[1]/center/p[1]/text()').set('dish')])
    .data(data => {
      const noEmpty = data.filter(entries => entries.dish.length > 0)
      result.menuItems = noEmpty
    })
    .done(() => {
      writeToDb(result)
    })
}

module.exports = { scrapeKolgas, scrapeSlagt }
