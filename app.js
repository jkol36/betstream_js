import { headers, BASE_URL, firebaseRef, BOVADA_USERNAME, BOVADA_PASSWORD, initializeDatabase } from './config'
import fetch from 'node-fetch'
import placedBet from './models/placedBet'
import { getLinkForMatch, queryForMatch, checker, ODDSTYPES, OUTCOMETYPES, validateData, placeBetOnBovada, authWithBovada, bovadaBalance, getEdges } from './helpers'


let auth
let profileId
let cookies

function startPromiseChain(edge) {
  let valid
  let stake
  getLinkForMatch(edge.homeTeam, edge.awayTeam)
  .then(link => queryForMatch(link))
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
  .then(data => {
    placedBet.create({outcomeId:valid.outcomeId, edgebetId:edge.offer})
    let userbetRef = firebaseRef.child('userbets').push()
    userbetRef.set({
      status: 1,
      match: {
        _id: edge.matchId,
        homeTeam: edge.homeTeam,
        awayTeam: edge.awayTeam,
        competition: edge.competition,
        country: edge.country,
        startTime: edge.startTime
      },
      bookmaker: edge.bookmaker,
      createdAt: edge.createdAt,
      edge: edge.edge,
      odds: edge.odds,
      oddsType: edge.oddsType,
      oddsTypeCondition: edge.oddsTypeCondition,
      offer: edge.offer,
      output: edge.output,
      sportId: edge.sportId,
      currency: 'USD',
      user: '6727921f-1c23-4397-b63c-1002745a3462',
      wager: stake / 100
    })
  })
  .catch(err => {
    switch(err.code) {
      case 1:
      case 2:
      case 4:
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
    firebaseRef.child('edges').orderByChild('bookmaker/_id').equalTo(567).on('child_added', snap => {
      startPromiseChain(snap.val())
    })

}
run()
