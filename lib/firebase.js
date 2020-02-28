import firebase from "firebase/app"
import "firebase/analytics"
import "firebase/firestore"
import "firebase/auth"

const config = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
}

if (!firebase.apps.length) {
  firebase.initializeApp(config)

  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log(`logged in as ${user.uid}`)
    } else {
      console.log("not logged in")
    }
  })

  firebase.auth().signInAnonymously().catch(error => {
    console.error(error)
  })
}

export default firebase
