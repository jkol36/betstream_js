import { headers, BASE_URL, firebaseRef, BOVADA_USERNAME, BOVADA_PASSWORD, initializeDatabase, EDGEBET_USER_ID } from './config'
//import {parseDimesSoccerMatches} from './parser'
import placedBet from './models/placedBet'
import { getLinkForMatch, test, dimesVerifyWager, fetch5DimesSoccerMatches, dimesLoginVerify, dimesSportSelection, dimesWagerMenu, dimesLoginViewComments, dimesSoccerMatches, dimesLoginVerify2, queryForMatch, ODDSTYPES, OUTCOMETYPES, validateData, placeBetOnBovada, authWithBovada, bovadaBalance} from './helpers'
import moment from 'moment'
let Promise = require('bluebird')


let auth
let profileId
let cookies


function startPromiseChain(edge) {
  console.log('called', edge)
  let valid
  let stake
  if(moment(edge.startTime).diff(moment.now(), 'hours') <= 2 ||
    edge.edge > 3) {
    console.log('here we go', edge)
    getLinkForMatch(edge.homeTeam, edge.awayTeam)
    .then(link => {
      console.log('got link for match', link)
      return queryForMatch(link)
    })
    .then(bovadaData => {
      return validateData(bovadaData, edge)
    })
    .then(returnedData => {
      if(returnedData !== -1) {
        return placedBet.findOne({edgebetId:edge.offer})
      }
      else {
        throw ({code:1})
      }
    })
    .then(result => {
      console.log('result', result)
      //!result because we only want to place the bet if there isn't a bet saved in db
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
  else {
    console.log(`${edge.homeTeam} vs ${edge.awayTeam} does not start for another ${moment(edge.startTime).fromNow(true)}`)
    Promise.reject()
  }
  
}

// let userbet = {
//   baseline: edge.baseline,
//   wager: +this.state.wager,
//   currency: this.state.currency,
//   sportId: edge.sportId,
//   match: {
//     _id: edge.matchId,
//     startTime: edge.startTime,
//     homeTeam: edge.homeTeam,
//     awayTeam: edge.awayTeam,
//     competition: edge.competition,
//     country: edge.country
//   },
//   bookmaker: {
//     _id: edge.bookmaker,
//     name: bookmakers[edge.bookmaker]
//   },
//   oddsType: edge.oddsType,
//   oddsTypeCondition: edge.oddsTypeCondition || 0,
//   odds: edge.odds,
//   offer: edge.offer,
//   edge: edge.edge,
//   status: 1,
//   output: edge.output
// }
function saveBet(valid, edge, stake) {
  console.log('saving bet', valid, edge, stake)
  placedBet.create({outcomeId:valid.outcomeId, edgebetId:edge.offer})
  firebaseRef.authWithPassword({email:'jonathankolman@gmail.com', password:'J0nnyb0y123'}, (error)=> {
   let userbetRef = firebaseRef.child('userbets').push()
    userbetRef.set({
      baseline:edge.baseline,
      sportId:edge.sportId,
      status: 1,
      oddsType:edge.oddsType,
      oddsTypeCondition: edge.oddsTypeCondition || 0,
      odds:edge.odds,
      offer:edge.offer,
      edge: edge.edge,
      output:edge.output,
      match: {
        _id: edge.matchId,
        homeTeam: edge.homeTeam,
        awayTeam: edge.awayTeam,
        competition: edge.competition,
        country:edge.country,
        startTime: edge.startTime
      },
      bookmaker: {
        _id: 567,
        name: 'Bovada'
      },
      currency: 'USD',
      user: EDGEBET_USER_ID,
      wager: stake / 100
    })
    .then(()=> console.log('pushed userbet to edgebet'))
    .catch(console.log)
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
    firebaseRef.authWithPassword({email:'jonathankolman@gmail.com', password:'J0nnyb0y123'}, (error) => {
      if(error) {
        console.log('error authenticating with edgebet', error)
      }
      else {
        firebaseRef.child('edges').orderByChild('bookmaker').equalTo(567).once('value', snap=> {
          if(snap.exists()) {
            console.log('got bovada edge')
            Promise.all(Promise.map(Object.keys(snap.val()).map(k => {
              let edge = snap.val()[k]
              return startPromiseChain(edge)
            })
            )).then(data=> console.log(data)).catch(err=> err)
          }
        })
        firebaseRef.child('edges').orderByChild('bookmaker').equalTo(567).on('child_added', snap => {
          if(snap.exists()) {
            console.log('bovada bet added')
            startPromiseChain(snap.val())
          }
        })
        firebaseRef.child('edges').orderByChild('bookmaker').equalTo(567).on('child_changed', snap => {
          console.log('bovada edge changed')
          startPromiseChain(snap.val())
        })
      }
    })
    



}


run()
// let userbetRef = firebaseRef.child('userbets').push()
// userbetRef.set({
//   status: 1,
//   match: {
//     _id: 'testing',
//     homeTeam: 'testing',
//     awayTeam: 'testing',
//     competition: 0,
//     country: 0,
//     startTime: 172381273123
//   },
//   bookmaker: {'id': 567, 'name': 'Bovada'},
//   createdAt: 1472199362667,
//   edge: 3,
//   odds: 1.87,
//   oddsType: 0,
//   oddsTypeCondition: 0,
//   offer: 478702415,
//   output: "o3",
//   sportId: 1,
//   currency: 'USD',
//   user: '6727921f-1c23-4397-b63c-1002745a3462',
//   wager: 100
// })
// .then(()=> console.log('pushed userbet to edgebet'))
// .catch(console.log)
// var ms = moment(now).diff(moment(then));
// var d = moment.duration(ms);
// var s = Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
// console.log(s)
// let username = 'ic35946'
// let password = 'Bettor123'
// dimesLoginVerify(username, password)
// .then(()=> dimesLoginVerify2(username, password))
// .then(()=> dimesLoginViewComments(username))
// .then(()=> dimesWagerMenu(username))
// .then(()=> dimesSportSelection(username))
// .then(()=> dimesVerifyWager('5', 'M1_1'))
// .then((res)=> console.log(res))
// .catch((err)=> console.log(err))


