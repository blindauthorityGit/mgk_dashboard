import {initializeApp} from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore/lite'
import {getStorage, ref, uploadBytes, listAll, getDownloadURL} from 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyD0WjiP5tP3Rx4faudMcyK4chkljNCjBIQ',
  authDomain: 'mainglueckskind-a4d01.firebaseapp.com',
  projectId: 'mainglueckskind-a4d01',
  storageBucket: 'mainglueckskind-a4d01.appspot.com',
  messagingSenderId: '736888938250',
  appId: '1:736888938250:web:2b8c5a0a38220106d264f3',
  measurementId: 'G-47QJ8EXBB9',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)

export const deleteReservation = async (id) => {
  try {
    await deleteDoc(doc(db, 'reservierung_cafe', id))
    console.log(`Successfully deleted reservation with ID: ${id}`)
    return true // Indicate success
  } catch (error) {
    console.error(`Failed to delete reservation with ID: ${id}. Error: ${error}`)
    return false // Indicate failure
  }
}

export const deleteBuchung = async (id) => {
  try {
    await deleteDoc(doc(db, 'anmeldung_kurse', id))
    console.log(`Successfully deleted reservation with ID: ${id}`)
    return true // Indicate success
  } catch (error) {
    console.error(`Failed to delete reservation with ID: ${id}. Error: ${error}`)
    return false // Indicate failure
  }
}

export {app, db, storage}

export const fetchFirestoreData = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName))
    const data = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}))
    console.log(data)
    return data
  } catch (error) {
    console.error('Error fetching data:', error)
    return []
  }
}
