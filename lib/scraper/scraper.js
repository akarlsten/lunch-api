const osmosis = require('osmosis')
const moment = require('moment')
const { db } = require('../db/database')

moment.locale('sv')
const weekday = moment()
  .add(2, 'days')
  .utc()
  .format('E') // day of the week in the format 1-7

const writeDateToDb = async () => {
  await db.set('date', `${moment().format('dddd, Do MMMM')}`).write()
}

const writeToDb = result => {
  db.get('restaurants') //Remove any old entries
    .remove({ name: result.name })
    .write()

  db.get('restaurants')
    .push(result)
    .write()
}

const distanceFromGleerups = (lat, lon) => {
  const toRad = x => {
    return (x * Math.PI) / 180
  }

  const R = 6371 // Radius of the earth in km
  const dLat = toRad(lat - 55.6124) // Javascript functions in radians
  const dLon = toRad(lon - 12.99959)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(55.6124)) * Math.cos(toRad(lat)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return parseFloat(d).toPrecision(1)
}

// Restaurang Kolgas
const scrapeKolgas = async () => {
  const result = {
    id: '1',
    name: 'Kolgas',
    emoji: '🚚',
    description: '"Gedigen" svensk husmanskost.',
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
  await osmosis
    .get('https://kolga.gastrogate.com/lunch/')
    .set([osmosis.find('.lunch-day-content:first > .lunch-menu-item > .td_title').set('dish')])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)

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
const scrapeSlagt = async () => {
  const result = {
    id: '2',
    name: 'Slagthuset',
    emoji: '🍖',
    description: 'Modern och närproducerad husmanskost.',
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
  await osmosis
    .get('http://slagthusetmmx.se')
    .set([osmosis.find('//*[@id="dagens-lunch"]/div/div[1]/center/p[1]/text()').set('dish')])
    .data(data => {
      const noEmpty = data.filter(entries => entries.dish.length > 0)
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
      result.menuItems = noEmpty
    })
    .done(() => {
      writeToDb(result)
    })
}

// In the Pink
const scrapeInThePink = async () => {
  const result = {
    id: '3',
    name: 'In The Pink',
    emoji: '🍲',
    description: 'Soppor och hotpots, ekologiskt och vegetariskt.',
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
  await osmosis
    .get('http://www.inthepink.se/menyer')
    .set([
      osmosis
        .find('#restaurant-menu > div.inner-post-content > div:nth-child(4) .menu-description')
        .set('dish')
    ])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
      if (weekday < 6) {
        result.menuItems = data
      } else {
        result.menuItems = []
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

// GlasKlart
const scrapeGlasklart = async () => {
  const result = {
    id: '4',
    name: 'Glasklart',
    emoji: '🥗',
    description: 'Vanlig husmanskost.',
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
  await osmosis
    .get('https://glasklart.eu/sv/lunch')
    .set([osmosis.find('.widget_glasklartlunchwidget p').set('dish')])
    .data(data => {
      const todaysDish = data[weekday]
      const weeklyVeg = data[data.length - 1] //Always last in the div
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
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

const scrapeMiaMarias = async () => {
  const result = {
    id: '5',
    name: 'MiaMarias',
    emoji: '🥘',
    description: 'Alltid tre rätter att välja mellan: fisk, kött, veg.',
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
  await osmosis
    .get('http://miamarias.nu')
    .set([osmosis.find('#dagens .et_pb_row_2 span:not([style="color: #000000"])').set('dish')])
    .data(data => {
      const noEmpty = data.filter(entries => entries.dish.length > 0)
      const noTorsdagensSoppa = noEmpty.filter(entries => !entries.dish.includes('Torsdagens'))
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
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

const scrapeNiagara = async () => {
  const result = {
    id: '6',
    name: 'Niagara',
    emoji: '🍱',
    description: 'Erbjuder både lokalproducerad husman och asiatiskt.',
    position: {
      lat: '55.60881',
      long: '12.99410'
    },
    address: {
      street: 'Neptuniplan 1',
      postCode: '21118',
      city: 'MALMÖ'
    }
  }
  await osmosis
    .get('https://restaurangniagara.se/lunch/')
    .set([osmosis.find('.lunch tr td:has(br)').set({ dish: 'text()[1]' })])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
      switch (weekday) {
      case '1': // Mon
        result.menuItems = data.slice(0, 6)
        break
      case '2': // Tue
        result.menuItems = data.slice(6, 12)
        break
      case '3': //Weds
        result.menuItems = data.slice(12, 18)
        break
      case '4': //Thurs
        result.menuItems = data.slice(18, 24)
        break
      case '5': //fri
        result.menuItems = data.slice(24, 30)
        break
      default:
        result.menuItems = []
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

const scrapeSaltimporten = async () => {
  const result = {
    id: '7',
    name: 'Saltimporten',
    emoji: '🍝',
    description: 'Lokalproducerat, lite fancy.',
    position: {
      lat: '55.61588',
      long: '12.99733'
    },
    address: {
      street: 'Grimsbygatan 24',
      postCode: '21120',
      city: 'MALMÖ'
    }
  }
  await osmosis
    .get('http://www.saltimporten.com')
    .set([osmosis.find('#lunch li').set({ dish: '.meal' })])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
      const todaysDish = data[weekday - 1]
      const weeklyVeg = data[data.length - 1] //Always last in the div
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
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

const scrapeValfarden = async () => {
  const result = {
    id: '8',
    name: 'Välfärden',
    emoji: '🥦',
    description: 'Skånska råvaror, spexiga rätter, alltid vegetariska alternativ',
    position: {
      lat: '55.61129',
      long: '12.99416'
    },
    address: {
      street: 'Anckargripsgatan 3',
      postCode: '21119',
      city: 'MALMÖ'
    }
  }
  await osmosis
    .get('https://valfarden.nu/dagens-lunch')
    .set([
      osmosis.find('.single_inside_content p[style="text-align: center;"]').set({ dish: 'text()' })
    ])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)
      switch (weekday) {
      case '1': // Mon
        result.menuItems = data.slice(2, 4)
        break
      case '2': // Tue
        result.menuItems = data.slice(5, 7)
        break
      case '3': //Weds
        result.menuItems = data.slice(8, 10)
        break
      case '4': //Thurs
        result.menuItems = data.slice(11, 13)
        break
      case '5': //fri
        result.menuItems = data.slice(14, 16)
        break
      default:
        result.menuItems = []
      }
    })
    .done(() => {
      writeToDb(result)
    })
}

const scrapeKP = async () => {
  const result = {
    id: '9',
    name: 'Restaurang KP',
    emoji: '📮',
    description: 'Lunchbuffé med kött, fisk och veg att välja mellan.',
    position: {
      lat: '55.60994',
      long: '12.99862'
    },
    address: {
      street: 'Posthusplatsen 4',
      postCode: '21120',
      city: 'MALMÖ'
    }
  }
  await osmosis
    .get('https://restaurangkp.se/lunchbuffe')
    .set([osmosis.find('.lunch-day-content:first > .lunch-menu-item > .td_title').set('dish')])
    .data(data => {
      result.distance = distanceFromGleerups(result.position.lat, result.position.long)

      if (weekday > 5) {
        result.menuItems = []
      } else {
        result.menuItems = data
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
  scrapeMiaMarias,
  scrapeNiagara,
  scrapeSaltimporten,
  scrapeValfarden,
  scrapeKP
}
