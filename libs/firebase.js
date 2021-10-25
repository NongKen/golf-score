import firebase from "firebase"

const config = {
  apiKey: "AIzaSyDSrlyostNUR3zz31R1Kk1v5cQIvUd6vhs",
  authDomain: "golf-score-9001a.firebaseapp.com",
  databaseURL: "https://golf-score-9001a.firebaseio.com",
  projectId: "golf-score-9001a",
  storageBucket: "golf-score-9001a.appspot.com",
  messagingSenderId: "286917953450"
}

export default !firebase.apps.length ? firebase.initializeApp(config) : firebase.app();