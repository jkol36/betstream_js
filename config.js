import Firebase from 'firebase'
import mongoose from 'mongoose'
export const firebaseRef = new Firebase('https://edgebet.firebaseio.com/')
export let headers = {
  'Accept': 'application/json',
  'Content-Type':'application/json;charset=utf-8',
  'Connection':'keep-alive',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.10; rv:40.0) Gecko/20100101 Firefox/40.0'
}



export const BOVADA_USERNAME = 'Benj17@comcast.net'
export const BOVADA_PASSWORD = 'ScarletB1974'
export const EDGEBET_USER_ID = '6727921f-1c23-4397-b63c-1002745a3462'

export function initializeDatabase() {
  return new Promise((resolve, reject)=> {
    mongoose.connect('mongodb://localhost/test');
    let db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error:'));
    db.once('open', function() {
      console.log('connected to database')
      resolve()
    });
  })
}


export const BASE_URL = 'https://sports.bovada.lv'
