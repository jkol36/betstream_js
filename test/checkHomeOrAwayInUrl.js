import { expect } from 'chai'
import {getLinkForMatch} from '../helpers'
import {firebaseRef} from '../config'

describe('Home Team or Away Team should appear in url', () => {
  it('should validate that we are pulling the right url', done => {
    firebaseRef.child('edges').orderByChild('bookmaker/_id').equalTo(567).on('child_added', snap => {
        if(snap.exists()) {
          let homeTeam = snap.val().homeTeam
          let awayTeam = snap.val().awayTeam
            getLinkForMatch(homeTeam, awayTeam)
            .then(link => {
              console.log('got it', link)
              console.log('HomeTeam', homeTeam)
              console.log('awayTeam', awayTeam)
              try {
                let hitHome = link.indexOf(homeTeam.split(' ').join('-').toLowerCase()) > -1
                let hitAway = link.indexOf(awayTeam.split(' ').join('-').toLowerCase()) > -1
                if(hitHome && hitAway)
                  console.log('hitHome and away')
              }
              catch(err) {
                console.log(err)
              }
            })
          }

        })
  })
})
