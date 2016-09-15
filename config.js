import Firebase from 'firebase'
import mongoose from 'mongoose'
export const firebaseRef = new Firebase('https://edgebet.firebaseio.com/')
export let headers = {
  'Accept': 'application/json',
  'Content-Type':'application/json;charset=utf-8',
  'Connection':'keep-alive',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0'
}


import './models'
export let soccerMatchData = 'inetWagerNumber=0.28686135991562794&inetSportSelection=sport&Soccer_China=on&Soccer_England=on&Soccer_European+Cup=on&Soccer_France=on&Soccer_Germany=on&Soccer_International=on&Soccer_India=on&Soccer_Mexico=on&Soccer_Poland=on&Soccer_Romania=on&Soccer_Scotland=on&Soccer_Slovakia=on&Soccer_South+America=on&Soccer_Women+Intl=on&Soccer_Halftime=on&Soccer_Futures=on'
export let basketballMatchData = 'initWagerNumber=0.028627429840762608&inetSportSelection=sport&Baseball_MLB=on&Baseball_Little+League=on&Baseball_Props=on'
export let footballMatchData = 'inetWagerNumber=0.23246627882217213&inetSportSelection=sport&Football_NFL=on&Football_College=on&Football_College+Extra=on&Football_Canadian=on&Football_Arena=on&Football_NFL+Props=on&Football_College+Props=on&Football_Futures=on'


export const BOVADA_USERNAME = 'Benj17@comcast.net'
export const BOVADA_PASSWORD = 'ScarletB1974'
export const EDGEBET_USER_ID = '6727921f-1c23-4397-b63c-1002745a3462'

export function initializeDatabase() {
  return new Promise((resolve, reject)=> {
    mongoose.connect('mongodb://localhost/betstream_db');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('connected to database')
      resolve()
    });
  })
}



export const BASE_URL = 'https://sports.bovada.lv'
