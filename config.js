import firebase from 'firebase'
import mongoose from 'mongoose'

firebase.initializeApp({
  serviceAccount: "./serviceaccount.json",
  databaseURL: "https://trademate-27ec1.firebaseio.com/"
})
export const headers = {
    'Origin': 'https://www.bovada.lv',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.8',
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36',
    'Content-Type': 'application/json;charset=UTF-8',
    'Accept': 'application/json, text/plain, */*',
    'Referer': 'https://www.bovada.lv/?overlay=login',
    'Connection': 'keep-alive',
    'ADRUM': 'isAjax:true',
    'Cookie': 'JOINED=true; BG_UA=Desktop|OS X|10_12_1|Chrome|55.0.2883.95||; ux=created=true; ln_grp=2; LANGUAGE=en; ADRUM=s=1483171346890&r=https%3A%2F%2Fwww.bovada.lv%2F%3F0; has_js=1; DEFLANG=en; s_cc=true; bsp=1; s_fid=25EB81C40CBC6670-086F7CF1DDF960B8; s_sq=bdbovadalv%3D%2526pid%253DbovadaLV%25253AHome%2526pidt%253D1%2526oid%253DLogin%2526oidt%253D3%2526ot%253DSUBMIT'
};


import './models'
export let soccerMatchData = 'inetWagerNumber=0.28686135991562794&inetSportSelection=sport&Soccer_China=on&Soccer_England=on&Soccer_European+Cup=on&Soccer_France=on&Soccer_Germany=on&Soccer_International=on&Soccer_India=on&Soccer_Mexico=on&Soccer_Poland=on&Soccer_Romania=on&Soccer_Scotland=on&Soccer_Slovakia=on&Soccer_South+America=on&Soccer_Women+Intl=on&Soccer_Halftime=on&Soccer_Futures=on'
export let basketballMatchData = 'initWagerNumber=0.028627429840762608&inetSportSelection=sport&Baseball_MLB=on&Baseball_Little+League=on&Baseball_Props=on'
export let footballMatchData = 'inetWagerNumber=0.23246627882217213&inetSportSelection=sport&Football_NFL=on&Football_College=on&Football_College+Extra=on&Football_Canadian=on&Football_Arena=on&Football_NFL+Props=on&Football_College+Props=on&Football_Futures=on'


export const BOVADA_USERNAME = 'Brianlee3369@hotmail.com'
export const BOVADA_PASSWORD = 'Mcgr3g0r'
export const EDGEBET_USER_ID = 'BVk5pMWc9AeBZ9T0h6iTszyRDB62'

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
