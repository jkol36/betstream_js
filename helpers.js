import fetch from 'node-fetch'
import placedBet from './models/placedBet'
import { headers, dimesHeaders, dimesCookies, soccerMatchData, basketballMatchData, footballMatchData, BOVADA_USERNAME, BOVADA_PASSWORD, firebaseRef, BASE_URL } from './config'
const request = require('superagent').agent()


//maybe pass in an index that represents the numbereth result to pull
//if we pull the wrong team url, try the nearest url.
export function getLinkForMatch(homeTeam, awayTeam) {
  console.log('finding link for match', homeTeam, awayTeam)
  return new Promise((resolve, reject) => {
    let url = `https://sports.bovada.lv/services/search/search?q=${homeTeam.split(' ').join('%20')}+${awayTeam.split(' ').join('%20')}&type=sport&json=true&number=5`
    fetch(url, { headers })
      .then(res => res.json())
      .then(json => {
        if (json.data === undefined) {
          console.log('json is undefined', homeTeam, awayTeam)
          return reject({code: 4})
        }
        else {
          let items = json.data.items
          if (items.length > 0) {
              resolve(BASE_URL+items[0].link+'?json=true')
            }
          else {
            reject({code: 5})
          }
        }
      })
  })
}


export function dimesLoginVerify(username, password) {
    return new Promise((resolve, reject)=> {
      request
      .post('http://www.5dimes.eu/LoginVerify.Asp')
      .set({
          'Origin': 'http://www.5dimes.eu',
          'Accept-Encoding': 'gzip, deflate',
          'Accept-Language': 'en-US,en;q=0.8',
          'Upgrade-Insecure-Requests': '1',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Cache-Control': 'max-age=0',
          'Referer': 'http://www.5dimes.eu/',
          'Connection': 'keep-alive',
      })
      .set({
        'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
        'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
        '5DCustomer': `${username}`,
        '78935480-VID': '1219202351480350',
        '78935480-SKEY': '6755025048354475359',
        'HumanClickSiteContainerID_78935480': 'STANDALONE',
        'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE'
      })
      .send(`customerID=${username}&password=${password}&goto=S&submit1=Login`)
      .end((err, res)=> {
        if(err) {
          reject(err)
        }
        else {
          resolve(res)
        }
      })
    })
 }

export function dimesLoginVerify2(username, password) {
  return new Promise((resolve, reject)=> {
    request
    .post('http://www.5dimes.eu/LoginVerify2.Asp')
    .set({
        'Origin': 'http://www.5dimes.eu',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Referer': 'http://www.5dimes.eu/LoginVerify.Asp',
        'Connection': 'keep-alive'
    })
    .set({
      'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
      'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
      '5DCustomer': `${username}`,
      '78935480-VID': '1219202351480350',
      '78935480-SKEY': '6755025048354475359',
      'HumanClickSiteContainerID_78935480': 'STANDALONE',
      'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE'
    })
    .send(`customerID=${username}&password=${password}&goto=S&ioBB=0400R9HVeoYv1gsNf94lis1ztkb1RWgb4ZAt%2B9xxA32YhA%2F7t%2FXdl3yovcBEtpQUidHpL66jjezG%2FfXXnfra5uHnDwI%2BY73H2L2OdUsprl5Sq8nl3OCiMt8Ua81mEx5T4nMe2V8MP4h2JKRMHa4CePzc2Qz1gslwtNv6MLejutG4hxLRAWjwuaoD5SgO%2BUqpxb%2B%2BsZBfgyIR%2BXyE6hsi11FUlhkwfCqvl92YFoMYq0xp4y64xI1RTIYC8ouD71qCKcmZqa%2Bc5UMfdLNXqLz%2B1vlqUAr9dE2jcfl0wgroQBfpyuLBX2tqQuRw89ZA7Bf4iSOrVTw2C4oQ2p5KKlg2xwOLLtPtb5t32w%2BKigIYmGjEZZSZsEq6iTzfMHoP%2F7tyR4jyYtRAfcOg9jbPrUkHB8HIR7yGLvlRliwz898GnyP1mBxLEwrNkykUlAfOtP2LQF5swOGCmEaWeJamIif%2FiDuMCcLUB69g4E97xS9GTGQ%2FPXHr6cXXHZ4V1gkH%2BzgzCnlu2IdccHc397y%2FuWnmR53MjcYRY3uox5K7Yg8CuMOt5MLq4WCiHMbq2GjALu16znkKgpMf97%2B4%2BapLMrPrMVvJlvLE8xAy%2Fthn2bG0spfZB%2BdxKzY0c1nMArLlM2qhzPAJGVfyNMcvdtBAR27Zdi%2BvjqcgW2OSBx1tiK7pMCw9zdSiIoabLPGlRpxSY1DdVpEfj4CAIIdX%2FsP8HELp2Y6%2BcWUiZtnt5TG%2BDi8R6wVNV9r6qoxEqm2gQ71%2FY9e8eiB47caT1pbMLWo04sGPxWGvdUjXzk77ILZ%2FeUsQ7RNrLro1kTKIs1496YkpIh3A707lm2e25SQbo1PhMwGxYRYC00R70kxJPvuMTn3Cs8SNRaHmY1XpDGBtyWF8hRwW7Jsss29L0sFkQPnkjHloApNDPJIEFaG7TsuZ7u6UZrLMXNZ90c4daMxzNcOazUYYzBb5UsHozl%2BXYShmK7Ltd63OEQm68rvRvAGkcYv1IEAR88cFJGkaA%2BtmVfLCciltSYY5s4MRORiqGLNXVODf8eZox9UMy8j4SDVyQ8IeKP0QDx60rx43O43OFKivCA%2BbKa9FMwFk%2B4ow9GK05eRGD5irbYJnbndIx5YYMNTZUpKej4IeaZ4E2y9YwH6mAJ3ZTHu22dBsS3fnOJQ3hhuMSInGTfpnqGm%2BFh%2FCQvUypvL9OHrB05MsEQB3lVhTny7QKm0Bva3jH3nbRHFsVWEIaCzMHcO8ldW2m1EPRNmBDAZAU2huETNTvnNzP4as2WNIMWI0LYOMX%2FzzUhhTH6BeN7B%2BETiEuyx%2BfdZIO0PdhRirnrsUUA3pDXHzRR0J0Z3KrDBtdh49pTzw7czYXo3BTCX2hk%2FYqCTeRjyO%2B9xxA32YhA%2FyUYXQ91QqKBcWvEsMdd2%2BlZWzQe%2FQPJCa%2BSEM%2Bh%2BfhCakGVW650VyO%2BFuGA4WaPDl9%2Fy4h%2FVUMcQwdw8dkokWaDROmN1a%2FaedizKgcTSmkr1WxaVIZDonIi7SoUevORqKAhiYaMRllJmwSrqJPN8weg%2F%2Fu3JHiPJi1EB9w6D2Ns%2BtSQcHwchH8yTvxpRpME0%3D`)
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })

  })
}

export function dimesLoginViewComments(username) {
  return new Promise((resolve, reject)=> {
    request
    .get('http://www.5dimes.eu/LoginViewComments.asp')
    .set({
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'http://www.5dimes.eu/LoginVerify.Asp',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
    })
    .set({
        'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
        'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
        'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE',
        '78935480-VID': '1219202351480350',
        '78935480-SKEY': '6755025048354475359',
        'HumanClickSiteContainerID_78935480': 'STANDALONE',
        '5DCustomer': `${username}`
    })
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })

  })
}

export function dimesVerifyWager(wager, wager_id) {
  return new Promise((resolve, reject)=> {
    request
    .post('http://www.5dimes.eu/BbVerifyWager.asp')
    .set({
      'ASPSESSIONIDQQSSRTTC': 'GFPCJFKCMIJBNBBGHLGHFELM',
      'ASP.NET_SessionId': 'noiwgxrvzidv5gxfxknki0f3',
      'ASPSESSIONIDSSASDACD': 'AFPIINEDPNGPFMFDJBMDGBEJ',
      '5DCustomer': 'ic35946',
      '78935480-VID': '1219202365275975',
      '78935480-SKEY': '1021840675925824236',
      'HumanClickSiteContainerID_78935480': 'STANDALONE',
    })
    .set({
      'Origin': 'http://www.5dimes.eu',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,en;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'max-age=0',
      'Referer': 'http://www.5dimes.eu/BbGameSelection.asp',
      'Connection': 'keep-alive'
    })
    .send(`inetWagerNumber=0.26684630946845644&${wager_id}=${wager}`)
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })

}

export function checkAcceptancePassword() {
  return new Promise((resolve, reject)=> {
    request
    .post('http://www.5dimes.eu/CheckAcceptancePassword.asp')
    .set({
      'Origin': 'http://www.5dimes.eu',
      'Accept-Encoding': 'gzip, deflate',
      'Accept-Language': 'en-US,en;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Cache-Control': 'max-age=0',
      'Referer': 'http://www.5dimes.eu/BbVerifyWager.asp',
      'Connection': 'keep-alive'
    })
    .set({
      'ASPSESSIONIDQQSSRTTC': 'GFPCJFKCMIJBNBBGHLGHFELM',
      'ASP.NET_SessionId': 'noiwgxrvzidv5gxfxknki0f3',
      'ASPSESSIONIDSSASDACD': 'AFPIINEDPNGPFMFDJBMDGBEJ',
      'ASPSESSIONIDQSAQCACD': 'MBJJINEDMPMKCGLBADFJHFPO',
      '5DCustomer': 'ic35946',
      '78935480-VID': '1219202365275975',
      '78935480-SKEY': '1021840675925824236',
      'HumanClickSiteContainerID_78935480': 'STANDALONE'
    })
    .send('inetWagerNumber=0.9776774649911901&ffid=ic35946&ffsux=ffsux&password=Bettor123')
  })
}

export function dimesWagerMenu(username) {
  return new Promise((resolve, reject)=> {
    request
    .post('http://www.5dimes.eu/WagerMenu.asp')
    .set({
        'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
        'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
        'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE',
        '78935480-VID': '1219202351480350',
        '78935480-SKEY': '6755025048354475359',
        'HumanClickSiteContainerID_78935480': 'STANDALONE',
        '5DCustomer': `${username}`
    })
    .set({
        'Origin': 'http://www.5dimes.eu',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Referer': 'http://www.5dimes.eu/LoginViewComments.asp',
        'Connection': 'keep-alive'
    })
    .send('gotFlash=Y')
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })
  })
}

export function dimesSportSelection(username) {
  return new Promise((resolve, reject)=> {
    request
    .get('http://www.5dimes.eu/bbSportSelection.asp')
    .set({
        'Accept-Encoding': 'gzip, deflate, sdch',
        'Accept-Language': 'en-US,en;q=0.8',
        'Upgrade-Insecure-Requests': '1',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'http://www.5dimes.eu/LoginVerify.Asp',
        'Connection': 'keep-alive',
        'Cache-Control': 'max-age=0'
    })
    .set({
        'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
        'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
        'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE',
        '78935480-VID': '1219202351480350',
        '78935480-SKEY': '6755025048354475359',
        'HumanClickSiteContainerID_78935480': 'STANDALONE',
        '5DCustomer': `${username}`
    })
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })

  })
}
export function dimesSoccerMatches(username) {
  return new Promise((resolve, reject)=> {
    request
    .post('http://www.5dimes.eu/BbGameSelection.asp')
    .set({
      'Accept-Encoding': 'gzip, deflate, sdch',
      'Accept-Language': 'en-US,en;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Referer': 'http://www.5dimes.eu/LoginViewComments.asp',
      'Connection': 'keep-alive',
      'Cache-Control': 'max-age=0'
    })
    .set({
      'ASPSESSIONIDQSQRCADC': 'CLOFMIBANEAJKNCJLOCACEBM',
      'ASPSESSIONIDAQRSDDAB': 'GMOJMIBANDNKJKBHMKNOCNOL',
      'ASPSESSIONIDQSBQCADD': 'DLMMMIBAIJJPPFILCLNHCKLE',
      '78935480-VID': '1219202351480350',
      '78935480-SKEY': '6755025048354475359',
      'HumanClickSiteContainerID_78935480': 'STANDALONE',
      '5DCustomer': `${username}`
    })
    .send(soccerMatchData)
    .end((err, res)=> {
      if(err) {
        reject(err)
      }
      else {
        resolve(res)
      }
    })
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
        if(!!err) {
          reject(({code: 3}))
        }
        else {
          resolve(Object.assign({}, {'body':res.body}, {'headers':res.headers}))
        }
      })
  })

}

export function authWithIntertops(username, password) {
  console.log('called')
  let data = {username: username, password:password}
  return new Promise((resolve, reject)=> {
    request
      .post('https://sports.intertops.eu/en/Account/Logon')
      .send(data)
      .end((err, res)=> {
        if(err) {
          console.log('got err')
          reject(err)
        }
        else {
          console.log('no error')
          resolve(Object.assign({}, {'body':res.body}, {'res': res}, {'headers':res.headers}))
        }
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
  console.log('placing bet on bovada', data, cookies)
  let bovadaBetBluePrint = {"channel":"WEB_BS","selections":{"selection":[{"outcomeId":"93276304","id":0,"system":"A","priceId":"80267125","oddsFormat":"DECIMAL"}]},"groups":{"group":[{"type":"STRAIGHT","groupSelections":[{"groupSelection":[{"selectionId":0,"order":0}]}],"id":0}]},"bets":{"bet":[{"betType":"SINGLE","betGroups":{"groupId":[0]},"stakePerLine":50,"isBox":false,"oddsFormat":"DECIMAL","specifyingRisk":true}]},"device":"DESKTOP"}

  let payload = Object.assign({}, bovadaBetBluePrint)
  payload.selections.selection[0].priceId=data.priceId
  payload.selections.selection[0].outcomeId=data.outcomeId
  payload.bets.bet[0].stakePerLine = data.stake
  return new Promise((resolve, reject)=> {
    request
    .post('https://sports.bovada.lv/services/sports/bet/betslip/validate')
    .set(headers)
    .set('Cookie', cookies)
    .send(payload)
    .end((err, res)=> {
      if(!!err) {
        console.log('error validating bet', err)
        reject(err)
      }
      resolve(res.body)
    })
  })
  .then(result => {
    return new Promise((resolve, reject)=> {
      if(result.status != 'AVAILABLE') {
        reject({code:5})
      }
      request
      .post(`https://sports.bovada.lv/services/sports/bet/betslip/`)
      .set(headers)
      .set('Cookie', cookies)
      .send(payload)
      .end((err, res)=> {
        if(!!err) {
          console.log('error placing bet', err)
          reject(err)
        }
        resolve(res.body)
      })
    })
    .then(result => {
      return new Promise((resolve, reject)=> {
        let key = result.key
        console.log('got key', key)
        request
        .get(`https://sports.bovada.lv/services/sports/bet/betslip/${key}`)
        .set(headers)
        .set('Cookie', cookies)
        .end((err, res)=> {
          if(!!err) {
            console.log('cannot get key', err)
            reject(err)
          }
          resolve({body:res.body, status:res.body.status})
        })
      })
    })
    .then(status => {
      console.log('status is', status)
      return new Promise((resolve, reject)=> {
        switch(status.status) {
          case 'SUCCESS':
            resolve({code:200})
          case 'FAIL':
            console.log('failed to place bet', res.body)
            reject({code:4})
          case 'PLACING':
            resolve({code:200})
        }
      })
    })
  })
}

export function validateData(bovadaData, edgebet) {
  return new Promise((resolve, reject)=> {
    console.log('validating data...')
    let gameLine = bovadaData.gamelines.itemList.filter(line => {
    let oddsType 
      try {
        oddsType = ODDSTYPES[line.mainMarketType.split(' ').join('').toLowerCase()]
      }
      catch(err) {
        reject(err)
      }
      let isGood = false
      if ([3,4,5].indexOf(oddsType)> -1) {
        try {
          isGood = oddsType === edgebet.oddsType && (
              +line.outcomes[0].price.handicap === +edgebet.oddsTypeCondition ||
              +line.outcomes[1].price.handicap === +edgebet.oddsTypeCondition
            )
        }
        catch(err) {
          isGood = oddsType === edgebet.oddsType
        }
      } else {
        isGood = oddsType === edgebet.oddsType
      }
      return isGood
    })[0]
    if (!gameLine) {
      resolve(-1)
    }

    let correctOutcome = gameLine.outcomes.filter(outcome => {
      return (outcome.type === OUTCOMETYPES[edgebet.oddsType][edgebet.output])
    })[0]
    if(+correctOutcome.price.decimal - edgebet.odds < 0.01 || +correctOutcome.price.decimal > edgebet.odds) {
      resolve({
        outcomeId: correctOutcome.price.outcomeId,
        priceId: correctOutcome.price.id,
        kelly:edgebet.kelly
      })
    }
    else{
      resolve(-1)
    }
  })
}
export function queryForMatch(link) {
  console.log('fetching url', link)
  return new Promise((resolve, reject) => {
    request
    .get(link)
    .set(headers)
    .end((err, res)=> {
      if(err) {
        console.log('got err')
        reject({error: {code: err.status, redirectUrl: err.response.redirects[0]}})
      }
      else {
        let dict = res.body.data.regions.content_center
        let data = dict[Object.keys(dict)[0]]['json-var'].value.items[0].displayGroups
        let alternateLines = data[1]
        let gameLines = data[0]
        let dataDict = {gamelines:gameLines, alternateLines:alternateLines}
        resolve(dataDict)
      }
    })
  })
}



export const ODDSTYPES = {
  '3-waymoneyline':0,
  moneyline:1,
  runline:3,
  pointspread:3,
  spread:3,
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
