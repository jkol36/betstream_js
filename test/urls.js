import { expect } from 'chai'
import mongoose from 'mongoose'
import fetch from 'node-fetch'
import placedBet from '../models/placedBet'
import _ from 'underscore'
import { headers, BASE_URL, firebaseRef, BOVADA_USERNAME, BOVADA_PASSWORD, initializeDatabase } from '../config'
import { getLinkForMatch, queryForMatch, checker, ODDSTYPES, OUTCOMETYPES, validateData, placeBet, authWithBovada, bovadaBalance } from '../helpers'
import jsonfile from 'jsonfile'


describe('Fetcher', () => {
  //let _auth = {}
 //  it('Should authenticate with bovada then get balance', done => {
 //    authWithBovada('mheller92@gmail.com', 'Betpassword9')
 //    .then(auth => {
 //      let specialHeaders = Object.assign({}, headers)
 //      specialHeaders.Authorization = auth.body.token_type + ' '+auth.body.access_token
 //      let profileId = auth.headers['x-profile-id']
 //      _auth.cookies = auth.headers['set-cookie']
 //      return bovadaBalance(specialHeaders, profileId)
 //    })
 //    .then(balance => {
 //      let priceId='156865649'
 //      let outcomeId = '132149117'
 //      let stake = 50
 //      let data = {
 //        priceId:priceId,
 //        outcomeId:outcomeId,
 //        stake:stake
 //      }
 //      let placebetHeaders = Object.assign({}, headers)
 //      placeBet(data, placebetHeaders, _auth.cookies.join())
 //      .then(data => {
 //        console.log(data)
 //        done()
 //      })
 //    })
 // })
  it('should connect to database', done => {
    initializeDatabase()
    .then(success => {
      return placedBet.create({outcomeId:1, edgebetId:1})
    })
    .then(bet => {
      return placedBet.findOne({outcomeId:1})
    }).then(bet=> {
      expect(bet.edgebetId).to.equal(1)
      done()
    }).catch(done)
  })
})
//   it('Should store edgebets to json', done => {
//     firebaseRef.child('edges').once('value', snap => {
//       if (snap.exists()) {
//         let edges = snap.val()
//         for (let key in edges) {
//           if (edges[key].bookmaker._id !== 567) delete edges[key]
//         }
//         jsonfile.writeFileSync('./test/edgebets.json', edges)
//       }
//       done()
//     })
//   })

//   it('Should store bovadabets', done => {
//     let edges = jsonfile.readFileSync('./test/edgebets.json')
//     jsonfile.writeFileSync('./test/bovadabets.json', [])
//     Object.keys(edges).forEach(key => {
//       let edge = edges[key]
//       getLinkForMatch(edge.homeTeam, edge.awayTeam)
//         .then(link => {
//           if (!!link) {
//             return queryForMatch(link)
//           }
//         }).then(res => {
//           if (!!res) {
//             let bovadabets = jsonfile.readFileSync('./test/bovadabets.json')
//             bovadabets.push(Object.assign({}, res, {edgebetId: edge.offer}))
//             jsonfile.writeFileSync('./test/bovadabets.json', bovadabets)
//           } else {
//             console.log('Could not get match')
//           }
//         }).catch(err => {
//           console.log(err)
//           done()
//         })
//     })
//   })
// })

  // it('Should match edge vs bovada', done => {
  //   let edges = jsonfile.readFileSync('./test/edgebets.json')
  //   let bovadabets = jsonfile.readFileSync('./test/bovadabets.json')
  //   console.log(bovadabets.map(bet => bet.edgebetId).filter((v, i, s) => s.indexOf(v) === i).length)
  //   bovadabets.forEach(bovadaBet => {
  //     let edgebet = edges[bovadaBet.edgebetId]
  //     expect(edgebet).to.be.ok
  //     let gameLine = bovadaBet.gamelines.itemList.filter(line => {
  //       let oddsType = ODDSTYPES[line.description.split(' ').join('').toLowerCase()]
  //       if ([3,4,5].indexOf(oddsType) > -1) {
  //         return oddsType === edgebet.oddsType && (
  //           +line.outcomes[0].price.handicap === +edgebet.oddsTypeCondition ||
  //           +line.outcomes[1].price.handicap === +edgebet.oddsTypeCondition)
  //       } else {
  //         return oddsType === edgebet.oddsType
  //       }
  //     })[0]
  //     if (!gameLine) {
  //       console.log(edgebet.offer)
  //       return
  //     }
  //     let correctOutcome = gameLine.outcomes.filter(outcome => {
  //       return (outcome.type === OUTCOMETYPES[edgebet.oddsType][edgebet.output])
  //     })[0]
  //     console.log(correctOutcome.price.decimal, edgebet.odds, edgebet.baseline)
  //   })
  //   done()
  // })

//   it('Should place bets', done => {
//     let counter = 0
//     let profileId
//     let newHeaders = Object.assign({}, headers)
//     let balance
//     authWithBovada(BOVADA_USERNAME, BOVADA_PASSWORD)
//       .then(response => {
//         newHeaders.Authorization = response.body.token_type + ' '+response.body.access_token
//         profileId = response.headers['x-profile-id']
//       }).then(finished=> {
//         bovadaBalance(newHeaders, profileId=profileId)
//       }).then(balance=> {
//         console.log(balance)
//         done
//       })
//       done()

//     firebaseRef.child('edges').orderByChild('bookmaker/_id').equalTo(567).on('child_added', snap => {
//       let edge = snap.val()
//       getLinkForMatch(edge.homeTeam, edge.awayTeam)
//         .then(link => queryForMatch(link))
//         .then(data => {
//           let validatedData = validateData(data, edge)
//           if(!!validatedData) {
//             return placeBet(validatedData, headers)
//           }
//         }).then(result => {
//           if (result.success) {
//             saveToDatabase
//           } else {
//             // ignore
//           }
//         }).catch(console.log)
//     })
//   })
// })





