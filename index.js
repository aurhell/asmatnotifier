import dotenv from 'dotenv'
import fetch from 'node-fetch'
import { format, formatDistanceStrict } from 'date-fns'
import nodeMailer from 'nodemailer'

dotenv.config()

const NOW = new Date()
const TIME_VALUES = ['seconds', 'minutes', 'hours']
const DAY_VALUE = 'days'

const getDay = (date) => format(date, 'yyyy-MM-dd')
const getFullTime = (date) => format(date, 'HH:mm')

const response = await fetch("https://www.assistantsmaternels35.fr/api/assistantsmaternels/recherche/terms", {
  "headers": {
    "accept": "*/*",
    "accept-language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "sec-ch-ua": "\" Not A;Brand\";v=\"99\", \"Chromium\";v=\"96\", \"Google Chrome\";v=\"96\"",
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": "\"macOS\"",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "x-requested-with": "XMLHttpRequest",
    "cookie": "PHPSESSID=2u7i9oqsombdiqa86lnah06cj0; _pk_ref.2.389e=%5B%22%22%2C%22%22%2C1639319324%2C%22https%3A%2F%2Fwww.google.com%2F%22%5D; _pk_id.2.389e=eada328a47f50f6c.1639319324.; _pk_ses.2.389e=1; cookieconsent_status=dismiss",
    "Referer": "https://www.assistantsmaternels35.fr/",
    "Referrer-Policy": "strict-origin-when-cross-origin"
  },
  "body": process.env.ASMAT_SEARCH_PAYLOAD,
  "method": "POST"
})

console.log(`Getting results at ${getDay(NOW)} ${getFullTime(NOW)}`)

const data = await response.json()

const recentlyUpdated = data.liste.filter((asmat) => {
  if (!asmat.dateMAJWeb) {
    return false
  }
  const date = new Date(asmat.dateMAJWeb.date)
  const [numericValue, dateValue] = formatDistanceStrict(date, NOW).split(' ')

  if (dateValue === DAY_VALUE && numericValue === 1) {
    return true
  } else if (TIME_VALUES.includes(dateValue)) {
    return true
  }
  return false
})

if (recentlyUpdated.length) {
  const results = recentlyUpdated.map((data) => {
    return `
      ${data.civilite} ${data.nom} ${data.prenom}
      ${data.adresse} ${data?.complementAdresse} ${data.communeEtCP}
      ${data.telMobile}
      infos détaillées sur: ${process.env.ASMAT_URL}${data.slug}    
    `
  })
  const body = results.join('\r\n')
  console.log(body)

  // try {
  //   const transporter = nodeMailer.createTransport({
  //     host: process.env.MAILER_HOST,
  //     port: process.env.PORT,
  //     secure: false,
  //     auth: {
  //       user: process.env.MAILER_AUTH,
  //       pass: process.env.MAILER_PASSWORD,
  //     },
  //   })
  
  //   const message = {
  //     from: process.env.FROM,
  //     to: process.env.TO,
  //     cc: process.env.CC,
  //     subject: 'Dispo asmat',
  //     text: body,
  //   }
  
  //   transporter.sendMail(message)
  // } catch (error) {
  //   console.error(error)
  // }
}
