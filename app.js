import firebase from 'firebase'
import { headers, BASE_URL, firebaseRef, BOVADA_USERNAME, BOVADA_PASSWORD, initializeDatabase, EDGEBET_USER_ID } from './config'
//import {parseDimesSoccerMatches} from './parser'
import placedBet from './models/placedBet'
import mongoose from 'mongoose'
import { getLinkForMatch, dimesVerifyWager, fetch5DimesSoccerMatches, dimesLoginVerify, dimesSportSelection, dimesWagerMenu, dimesLoginViewComments, dimesSoccerMatches, dimesLoginVerify2, queryForMatch, ODDSTYPES, OUTCOMETYPES, validateData, placeBetOnBovada, authWithBovada, bovadaBalance} from './helpers'
import moment from 'moment'
let Promise = require('bluebird')


let auth
let profileId
let cookies
let lastAuth


const reroute = (redirectUrl, edge) => {
  console.log('rerouting')
  queryForMatch(redirectUrl)
  .then(result => validateData(result, edge))
  .then(valid => {
    console.log(valid, edge)
    if(valid != -1) {
      placedBet.findOne({edgebetId:edge.offer})
      .then(result => {
        if(!result) {
          return bovadaBalance(auth, profileId)
        }
      })
      .then(balance => {
        let stake
        stake = Math.round(balance * edge.kelly * 100)/3
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
    }
    else {
      console.log('edge not available anymore')
    }
  })
  .catch(err => {
    switch(err.code) {
      case 1:
      console.log('edge does not exist anymore')
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

const startPromiseChain = (edge)=> {
  console.log('called', edge)
  let valid
  let stake
  if(moment(edge.startTime).diff(moment.now(), 'hours') <= 3 && edge.edge > 2 && edge.sportId !== 5) {
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
        valid = returnedData
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
      stake = Math.round(balance * edge.kelly * 100)/3
      let data = {
        priceId:valid.priceId,
        outcomeId:valid.outcomeId,
        stake
      }
      console.log('got data', data)
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
        console.log('edge does not exist anymore')
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
    console.log(`${edge.homeTeam} vs ${edge.awayTeam} was rejected. Starts: ${moment(edge.startTime).fromNow(true)} edge: ${edge.edge}, odds: ${edge.odds}`)
    Promise.reject()
  }
  
}

function saveBet(valid, edge, stake) {
  console.log('saving bet')
  placedBet.create({outcomeId:valid.outcomeId, edgebetId:edge.offer})
  let usertrade = {
       match: {
        _id: edge.matchId,
        homeTeam: edge.homeTeam,
        awayTeam: edge.awayTeam,
        competition: edge.competition,
        startTime: edge.startTime
      },
      bookmaker: edge.bookmaker,
      createdAt: firebase.database.ServerValue.TIMESTAMP,
      wager: stake / 100,
      currency: 'USD',
      edge: edge.edge,
      closing:edge,
      odds:edge.odds,
      oddsType:edge.oddsType,
      oddsTypeCondition: edge.oddsTypeCondition || 0,
      output:edge.output,
      sport: edge.sportId,
      status: 1,
      user: EDGEBET_USER_ID,
      tradeId: edge._id
    }
    const ref = firebase.database().ref('usertrades').push()
    return firebase.database().ref().update({
    [`usertrade-keys/${EDGEBET_USER_ID}/${ref.key}`]: true,
    [`usertrades/${ref.key}`]: usertrade
  })

}


const removeAllTrades = () => {
  return firebase.database().ref('usertrades').orderByChild('user').equalTo('BVk5pMWc9AeBZ9T0h6iTszyRDB62').once('value', s => {
    console.log(s.val())
  })
}
const authenticateSelf = () => {
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

export const listenForEdges = () => {
  console.log('listening for edges')
  firebase.database().ref('trades').orderByChild('bookmaker').equalTo(567).on('child_added', s => {
    if(moment(lastAuth).diff(moment(moment.now()), 'minutes') >= 10)
      authenticateSelf()
    setTimeout(() => startPromiseChain(s.val(), 1000))
  })
  // firebase.database().ref('trades').orderByChild('bookmaker').equalTo(567).once('value', s => {
  //   authenticateSelf()
  //   Object.keys(s.val()).map(k => {
  //     if(s.val()[k] !== undefined) {
  //       startPromiseChain(s.val()[k])
  //     }
  //   })
  // })
}

const start = () => {
  initializeDatabase()
  .then(authenticateSelf)
  .then(listenForEdges)
  .catch((err)=> console.log(err, err.stack))
}

start()


