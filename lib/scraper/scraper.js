const osmosis = require('osmosis')
const moment = require('moment')
const { db } = require('../db/database')

moment.locale('sv')
const weekday = moment().format('E') // day of the week in the format 1-7

const writeDateToDb = () => {
  db.set('date', `${moment().format('dddd, Do MMMM')}`).write()
}

const writeToDb = result => {
  db.get('restaurants') //Remove any old entries
    .remove({ name: result.name })
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
      if (data.length > 3) {
        result.menuItems = []
      } else {
        result.menuItems = data
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

// Slagthuset MMX
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

// In the Pink

const scrapeInThePink = () => {
  const result = {
    name: 'In The Pink',
    position: {
      lat: '55.61018',
      long: '13.00015'
    },
    address: {
      street: 'Rälsplatsen 3',
      postCode: '21120',
      city: 'MALMÖ'
    }
  }
  osmosis
    .get('https://www.inthepink.se/menyer')
    .set([osmosis.find('.menu-stack:nth(1) .menu-description').set('dish')])
    .data(data => {
      result.menuItems = data
    })
    .done(() => {
      writeToDb(result)
    })
}

// GlasKlart
const scrapeGlasklart = () => {
  const result = {
    name: 'Glasklart',
    position: {
      lat: '55.61525',
      long: '12.99042'
    },
    address: {
      street: 'Dockplatsen 1',
      postCode: '21119',
      city: 'MALMÖ'
    }
  }
  osmosis
    .get('https://glasklart.eu/sv/lunch')
    .set([osmosis.find('.widget_glasklartlunchwidget p').set('dish')])
    .data(data => {
      const todaysDish = data[weekday]
      const weeklyVeg = data[data.length - 1] //Always last in the div
      if (weekday < 6) {
        result.menuItems = [todaysDish, weeklyVeg]
      } else {
        result.menuItems = []
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

const scrapeMiaMarias = () => {
  const result = {
    name: 'MiaMarias',
    position: {
      lat: '55.61355',
      long: '12.99189'
    },
    address: {
      street: 'Isbergs gata 7',
      postCode: '21119',
      city: 'MALMÖ'
    }
  }
  osmosis
    .get('http://miamarias.nu')
    .set([osmosis.find('#dagens .et_pb_row_2 span:not([style="color: #000000"])').set('dish')])
    .data(data => {
      const noEmpty = data.filter(entries => entries.dish.length > 0)
      const noTorsdagensSoppa = noEmpty.filter(entries => !entries.dish.includes('Torsdagens'))
      switch (weekday) {
      case '1': // Mon
        result.menuItems = noTorsdagensSoppa.slice(0, 3)
        break
      case '2': // Tue
        result.menuItems = noTorsdagensSoppa.slice(3, 6)
        break
      case '3': //Weds
        result.menuItems = noTorsdagensSoppa.slice(6, 9)
        break
      case '4': //Thurs
        result.menuItems = noTorsdagensSoppa.slice(9, 13) // 4 items because theres a soup..
        break
      case '5': //fri
        result.menuItems = noTorsdagensSoppa.slice(13, 16)
        break
      default:
        result.menuItems = []
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

module.exports = {
  writeDateToDb,
  scrapeKolgas,
  scrapeSlagt,
  scrapeInThePink,
  scrapeGlasklart,
  scrapeMiaMarias
}
