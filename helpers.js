import fetch from 'node-fetch'
import { headers, BOVADA_USERNAME, BOVADA_PASSWORD, firebaseRef, BASE_URL } from './config'
const request = require('superagent')


export function getLinkForMatch(homeTeam, awayTeam) {
  return new Promise((resolve, reject) => {
    fetch(`https://sports.bovada.lv/services/search/search?q=${homeTeam}${awayTeam}&type=sport&json=true&number=1`,
          { headers })
      .then(res => res.json())
      .then(json => {
        if (json.data === undefined)
          return reject({code: 4})
        let items = json.data.items
        if (items.length > 0) {
          resolve(BASE_URL+items[0].link+'?json=true')
        } else {
          reject({code: 5})
        }
      }).catch(reject)
  })
}

export function authWithBovada(username, password) {
  let data = {"username": username, "password":password}
  return new Promise((resolve, reject)=> {
    request
      .post('https://sports.bovada.lv/services/web/v2/oauth/token')
      .send(data)
      .set(headers)
      .end((err, res) => {
        if(err) {
          reject(({code: 3}))
        }
        resolve(Object.assign({}, {'body':res.body}, {'headers':res.headers}))
      })
  })

}
export function bovadaBalance(headers, profileId) {
  let url = 'https://sports.bovada.lv/services/web/v2/profiles/'+profileId+'/summary'
  return new Promise((resolve, reject)=> {
    request
    .get(url)
    .set(headers)
    .end((code, res)=> {
      if(code) {
        reject({code: 3})
      }
      try {
        resolve(res.body.wallets.cash.availableBalance.amount)
      }
      catch(err) {
        reject({code:3})
      }
    })

  })


}
export function placeBetOnBovada(data, headers, cookies) {
  let bovadaBetBluePrint = {"channel":"WEB_BS","selections":{"selection":[{"outcomeId":"93276304","id":0,"system":"A","priceId":"80267125","oddsFormat":"DECIMAL"}]},"groups":{"group":[{"type":"STRAIGHT","groupSelections":[{"groupSelection":[{"selectionId":0,"order":0}]}],"id":0}]},"bets":{"bet":[{"betType":"SINGLE","betGroups":{"groupId":[0]},"stakePerLine":50,"isBox":false,"oddsFormat":"DECIMAL","specifyingRisk":true}]},"device":"DESKTOP"}

  let payload = Object.assign({}, bovadaBetBluePrint)
  payload.selections.selection[0].priceId=data.priceId
  payload.selections.selection[0].outcomeId=data.outcomeId
  payload.bets.bet[0].stakePerLine = data.stake
  return new Promise((resolve, reject)=> {
    request
    .post('https://sports.bovada.lv/services/sports/bet/betslip')
    .set(headers)
    .set('Cookie', cookies)
    .send(payload)
    .end((err, res)=> {
      if(!!err) {
        reject(err)
      }
      resolve(res.body)
    })

  })
}

export function validateData(bovadaData, edgebet) {
  let gameLine = bovadaData.gamelines.itemList.filter(line => {
    let oddsType = ODDSTYPES[line.description.split(' ').join('').toLowerCase()]
    if ([3,4,5].indexOf(oddsType)> -1) {
      return oddsType === edgebet.oddsType && (
            +line.outcomes[0].price.handicap === +edgebet.oddsTypeCondition ||
            +line.outcomes[1].price.handicap === +edgebet.oddsTypeCondition
          )
    } else {
      return oddsType === edgebet.oddsType
    }
  })[0]
  if (!gameLine) {
    return -1
  }
  let correctOutcome = gameLine.outcomes.filter(outcome => {
    return (outcome.type === OUTCOMETYPES[edgebet.oddsType][edgebet.output])
  })[0]
  return {
    outcomeId: correctOutcome.price.outcomeId,
    priceId: correctOutcome.price.id,
    kelly:edgebet.kelly
  }

}
export function queryForMatch(link) {
  return new Promise((resolve, reject) => {
    fetch(link, {headers:headers})
    .then(res => res.json())
    .then(json => {
      let dict = json.data.regions.content_center
      let data = dict[Object.keys(dict)[0]]['json-var'].value.items[0].displayGroups
      let alternateLines = data[1]
      let gameLines = data[0]
      data = {gamelines:gameLines, alternateLines:alternateLines}
      resolve(data)
    }).catch(reject)
  })

}


export const ODDSTYPES = {
  '3-waymoneyline':0,
  moneyline:1,
  runline:3,
  pointspread:3,
  totalgoalsou:4,
  total: 4
}


export const OUTCOMETYPES = {
  0: {
    o1: 'H',
    o2: 'D',
    o3: 'A'
  },
  1: {
    o1: 'H',
    o2: 'A'
  },
  3: {
    o1: 'H',
    o2: 'A'
  },
  4: {
    o1: 'O',
    o2: 'U'
  }
}
