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
        stake = Math.round(balance * edge.kelly/2 * 100)
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
      stake = Math.round(balance * edge.kelly/2 * 100)
      let data = {
        priceId:valid.priceId,
        outcomeId:valid.outcomeId,
        stake: stake
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
      switch(err.error.code) {
        case 301:
        reroute(err.error.redirectUrl, edge)
      }
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
    console.log(`${edge.homeTeam} vs ${edge.awayTeam} does not start for another ${moment(edge.startTime).fromNow(true)}`)
    Promise.reject()
  }
  
}

function saveBet(valid, edge, stake) {
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
  firebaseRef.authWithPassword({email:'jonathankolman@gmail.com', password:'J0nnyb0y123'}, (error) => {
    if(error) {
      console.log('error authenticating with edgebet', error)
    }
    else {
      let ref = firebaseRef.child('edges').orderByChild('bookmaker').equalTo(567)
      ref.once('value', snap=> {
        console.log('new edge', snap.val())
        if(snap.exists()) {
          authenticateSelf()
          Object.keys(snap.val()).map(k =>startPromiseChain(snap.val()[k]))
        }
      })
      ref.on('child_added', snap => {
        console.log('new edge')
        authenticateSelf()
        startPromiseChain(snap.val())
      })
      ref.on('child_changed', snap => {
        startPromiseChain(snap.val())
      })

    }
  })
}

const start = () => {
  initializeDatabase()
  .then(authenticateSelf)
  .then(listenForEdges)
  .catch((err)=> console.log(err, err.stack))
}

start()
