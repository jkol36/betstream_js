import { headers, BASE_URL, firebaseRef, BOVADA_USERNAME, BOVADA_PASSWORD, initializeDatabase, EDGEBET_USER_ID } from './config'
import fetch from 'node-fetch'
import placedBet from './models/placedBet'
import { getLinkForMatch, queryForMatch, checker, ODDSTYPES, OUTCOMETYPES, validateData, placeBetOnBovada, authWithBovada, bovadaBalance} from './helpers'


let auth
let profileId
let cookies



function startPromiseChain(edge) {
  let valid
  let stake

  getLinkForMatch(edge.homeTeam, edge.awayTeam)
  .then(link => {
    console.log('got link for match', link)
    return queryForMatch(link)
  })
  .then(bovadaData => {
    valid = validateData(bovadaData, edge)
    if(valid !== -1) {
      return placedBet.findOne({edgebetId:edge.offer})
    }
    else {
      throw ({code: 1})
    }
  })
  .then(result => {
    console.log('result', result)
    if(!result) {
      return bovadaBalance(auth, profileId)
    }
    else {
      throw ({code: 2})
    }
  })
  .then(balance => {
    stake = Math.round(balance * edge.kelly * 100)
    let data = {
      priceId:valid.priceId,
      outcomeId:valid.outcomeId,
      stake: stake
    }
    return placeBetOnBovada(data, headers, cookies.join())
  })
  .then(res => {
    console.log('placeBetCode', res.code)
    if(res.code === 200) {
      saveBet(valid, edge, stake)
    }
  })
  .catch(err => {
    switch(err.code) {
      case 1:
      case 2:
      case 4:
        break
      case 5:
        console.log('bet not available anymore', edge.offer)
        break
      case 6:
        console.log('failed to place bet')
        break
      case 3:
        authenticateSelf()
        startPromiseChain(edge)
        break
      default:
        console.log(err, err.stack)
    }
  })
}


function saveBet(valid, edge, stake) {
  console.log('saving bet', valid, edge, stake)
  placedBet.create({outcomeId:valid.outcomeId, edgebetId:edge.offer})
    let userbetRef = firebaseRef.child('userbets').push()
    userbetRef.set({
      status: 1,
      match: {
        _id: edge.matchId,
        homeTeam: edge.homeTeam,
        awayTeam: edge.awayTeam,
        competition: edge.competition || 0,
        country: edge.country || 0,
        startTime: edge.startTime
      },
      bookmaker: edge.bookmaker,
      createdAt: edge.createdAt,
      edge: edge.edge,
      odds: edge.odds,
      oddsType: edge.oddsType,
      oddsTypeCondition: edge.oddsTypeCondition || 0,
      offer: edge.offer,
      output: edge.output,
      sportId: edge.sportId,
      currency: 'USD',
      user: EDGEBET_USER_ID,
      wager: stake / 100
    })
    .catch(console.log)
}



function authenticateSelf() {
  if(BOVADA_USERNAME === '' || BOVADA_PASSWORD === '') {
    throw new Error('SET THE BOVADA USERNAME AND PASSWORD IN CONFIG.JS')
  }
  console.log('authenticating myself')
  authWithBovada(BOVADA_USERNAME, BOVADA_PASSWORD)
  .then(authData=> {
    auth = Object.assign({}, headers)
    auth.Authorization = authData.body.token_type + ' '+authData.body.access_token
    profileId = authData.headers['x-profile-id']
    cookies = authData.headers['set-cookie']
  })
}


function run() {
    initializeDatabase()
    authenticateSelf()
    firebaseRef.authWithPassword({email:'jonathankolman@gmail.com', password:'J0nnyb0y123'}, (error) => {
      if(error)
        console.log(error)
        return
      console.log('authenticated with edgebet')
    })
    firebaseRef.child('edges').orderByChild('bookmaker/_id').equalTo(567).on('child_added', snap => {
      startPromiseChain(snap.val())
    })

}
run()
