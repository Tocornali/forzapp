/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/explicit-function-return-type */
const fs = require('fs')
const path = require('path')

const dbPath = path.join(__dirname, '../FH6Cars.json')
const fh6CarsPageUrl = 'https://forza.net/fh6cars'

// Normalization function that strips diacritics/accents and non-alphanumeric characters
function normalize(str) {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

// Known mappings to reconcile naming differences between Table and DB
const KNOWN_MAPPINGS = {
  rimac_2021_nevera: 'rimic_2021_nevera',
  funcomotorsports_2018_f9: 'funco_2018_motorsportsf9',
  deberti_2013_jeepwranglerunlimited: 'deberti_2018_jeepwranglerunlimited',
  ford_1968_mustanggt22fastback: 'ford_1968_mustang22fastback',
  ford_1968_mustanggt22fastbackforzaedition: 'ford_1968_mustang22fastbackforzaedition',
  ford_2017_14rahallettermanlaniganracingfiesta: 'ford_2017_14rahallettermanlaniganracinggrcfiesta',
  gmc_2022_hummerevpickup: 'gmc_2022_evhummerpickup',
  gordonmurrayautomotive_2020_t50: 'gordonmurrayautomotive_2022_t50',
  lamborghini_2022_aventadorlp7804ultimae: 'lamborghini_2021_aventadorlp7804ultimae',
  porsche_1985_185959prodriverallyraid: 'porsche_1986_185959prodriverallyraid',
  porsche_1997_911gt1strassenversion: 'porsche_1998_911gt1strassenversion',
  porsche_2021_missionr: 'porsche_2022_missionr',
  rivian_2022_r1t: 'rivian_2021_r1t',
  rjanderson_2016_37polarisrzrpro2truck: 'rjanderson_2016_37polarisrzrrockstarenergypro2truck',
  toyota_1993_1t100bajatruck: 'toyota_1993_1bajat100truck',
  toyota_2013_86: 'toyota_2013_86stories',
  wuling_2013_sunshinesforzaedition: 'wuling_2020_sunshinesforzaedition',
  jimco_2019_240fastballracingclass6100spectrophytruck:
    'jimco_2019_240fastballracingspectrophytruck',
  honda_1990_19101motorsportcrxwtac: 'honda_1990_19crxwtac',
  ford_2014_rangert6rallyraid: 'ford_2014_ranget6rallyraid',
  lotus_2018_scuramotorsportsexigewtac: 'lotus_2018_scuramotorsportexigewtac'
}

// Helper function to extract and parse table row into standardised JSON schema
function parseTableRow(make, carName, carClass, collection) {
  make = make.trim()
  carName = carName.trim()
  carClass = carClass.trim()
  collection = collection.trim()

  // Extract year (first 4 digits)
  const yearMatch = carName.match(/^(\d{4})\b/)
  const year = yearMatch ? yearMatch[1] : ''

  let model = carName
  if (year) {
    model = carName.substring(5).trim()
  }

  // Strip Make/Brand from model if model starts with it
  const makeLower = make.toLowerCase()
  if (model.toLowerCase().startsWith(makeLower)) {
    model = model.substring(make.length).trim()
  }

  // Construct point2580/4160 (Year + Model)
  const point2580 = year ? `${year} ${model}` : model

  // Class formatting: "514 B" -> "B 514"
  let localClass = carClass
  const classMatch = carClass.match(/^(\d+)\s+(.+)$/)
  if (classMatch) {
    localClass = `${classMatch[2]} ${classMatch[1]}`
  }

  // Source formatting
  let localSource = collection.toLowerCase()
  if (localSource.includes('autoshow') && localSource.includes('wheel')) {
    localSource = 'autoshow, wheel'
  } else if (localSource.includes('seasonal') && localSource.includes('wheel')) {
    localSource = 'wheel, seasonal'
  }

  return {
    make,
    year,
    model,
    point2580,
    localClass,
    localSource
  }
}

async function run() {
  try {
    console.log(`Fetching page HTML from ${fh6CarsPageUrl}...`)
    const pageHtml = await fetch(fh6CarsPageUrl).then((r) => r.text())

    // Find payload URL
    const match = pageHtml.match(/_payload\.json\?([a-zA-Z0-9-]+)/)
    if (!match) {
      throw new Error('Failed to find payload hash in page HTML')
    }
    const hash = match[1]
    const payloadUrl = `https://forza.net/fh6cars/_payload.json?${hash}`
    console.log(`Found dynamic payload URL: ${payloadUrl}`)

    console.log('Fetching payload JSON...')
    const payload = await fetch(payloadUrl).then((r) => r.json())
    if (!Array.isArray(payload)) {
      throw new Error('Payload is not in the expected array format')
    }

    // Find the markdown table string
    const tableStr = payload.find(
      (val) => typeof val === 'string' && val.includes('|Make|Car Name|')
    )
    if (!tableStr) {
      throw new Error('Could not find the vehicle markdown table inside payload')
    }

    // Parse rows
    const lines = tableStr.split('\n')
    const rows = lines.filter((l) => l.trim().startsWith('|') && l.trim().endsWith('|'))

    console.log(`Found ${rows.length} raw table rows in payload`)

    // Read local database
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at ${dbPath}`)
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'))
    console.log(`Existing local database contains ${dbData.length} vehicles`)

    // Index existing vehicles by normalized key: make_year_model
    const existingMap = new Map()
    dbData.forEach((car) => {
      const yearMatch = car['point2580/4160'].match(/^(\d{4})\b/)
      const year = yearMatch ? yearMatch[1] : ''
      const model = year ? car['point2580/4160'].substring(5) : car['point2580/4160']

      const key = `${normalize(car.Brand)}_${normalize(year)}_${normalize(model)}`
      existingMap.set(key, car)
    })

    let addedCount = 0
    const finalCars = [...dbData]

    rows.forEach((r) => {
      const cols = r.split('|').map((c) => c.trim())
      // Skip header and separator lines
      if (cols.length < 7 || cols[1] === 'Make' || cols[1] === '---' || cols[1].startsWith('---')) {
        return
      }

      const make = cols[1]
      const carName = cols[2]
      const carClass = cols[4]
      const collection = cols[6]

      const parsedCar = parseTableRow(make, carName, carClass, collection)
      let parsedKey = `${normalize(parsedCar.make)}_${normalize(parsedCar.year)}_${normalize(parsedCar.model)}`

      // Apply known mappings
      if (KNOWN_MAPPINGS[parsedKey]) {
        parsedKey = KNOWN_MAPPINGS[parsedKey]
      }

      if (!existingMap.has(parsedKey)) {
        // Vehicle is new! Let's build the new DB object
        // Find existing brand index or find max index and increment
        const existingBrands = dbData.filter(
          (c) => c.Brand.toLowerCase() === parsedCar.make.toLowerCase()
        )
        let brandIndex = 1
        if (existingBrands.length > 0) {
          brandIndex = Number(existingBrands[0]['1']) || 1
        } else {
          const maxIndex = Math.max(...finalCars.map((c) => Number(c['1']) || 0))
          brandIndex = maxIndex + 1
        }

        const newCarObj = {
          1: brandIndex,
          '': '',
          Brand: parsedCar.make,
          'collect point': 5,
          'point2580/4160': parsedCar.point2580,
          Class: parsedCar.localClass,
          __1: '',
          source: parsedCar.localSource,
          Price: '',
          'Is own?': 'FALSE',
          '326/605': '',
          NeedsRepair: false,
          RaceType: '',
          RacesCount: 0
        }

        finalCars.push(newCarObj)
        // Add to map to prevent duplicates within the same scraper run
        existingMap.set(parsedKey, newCarObj)
        addedCount++
        console.log(
          `[NEW VEHICLE] Added: ${parsedCar.make} ${parsedCar.point2580} (${parsedCar.localClass})`
        )
      }
    })

    console.log(`Added ${addedCount} new vehicles`)

    if (addedCount > 0) {
      // Sort database by Brand index "1" numerically, and then by model name alphabetically
      finalCars.sort((a, b) => {
        const brandA = Number(a['1']) || 0
        const brandB = Number(b['1']) || 0
        if (brandA !== brandB) {
          return brandA - brandB
        }
        return a['point2580/4160'].localeCompare(b['point2580/4160'])
      })

      // Save database file back to disk
      fs.writeFileSync(dbPath, JSON.stringify(finalCars, null, 2), 'utf8')
      console.log(`Successfully updated database file at ${dbPath}`)
    } else {
      console.log('No new vehicles found. Database is up to date.')
    }
  } catch (error) {
    console.error('Synchronization failed:', error)
    process.exit(1)
  }
}

run()
