import { getFirestore, 
         collection, 
         addDoc,
         setDoc,
         getDoc,
         doc, 
         updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { firebaseApp } from "./stuff";
const db = getFirestore(firebaseApp);


//------------------------------- get UID of logged in user, else direct to signin page -------------------------------------------
export const UID = function UID() {
    const auth = getAuth(firebaseApp);
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log(user.uid);
                resolve(user.uid); // Resolve the promise with the UID
            } else {
                window.location.href = 'index.html'; // Redirect if no user
                reject("No user signed in");
            }
        })
    })
}
//-------------------------------------------------------- END --------------------------------------------------------------------

//-------------------------------------- add user to DB when they sign up -------------------------------------------------------
export const add_info_users = async function addUserToTable(UID, email, name) {
    const docref = doc(db, 'users', UID);
    
    const data = {
        'email' : email, 
        'name' : name,
        'trips': []
    };

    try {
        await setDoc(docref, data);
    }

    catch (error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    };
}
//------------------------------------------------------------ END ---------------------------------------------------------------


//------------------------- add trip to DB when new trip (ALWAYS CALLED WITH update_trips_user) ---------------------------------
export const add_info_trips = async function add_trip(destination, start, end, budget) {
    const table = collection(db, 'trips');

    const data = {
        'destination' : destination, 
        'startdate' : start,
        'enddate' : end, 
        'budget' : budget,
        'flights' : [], 
        'hotels' : [], 
        'attractions': []
    };
    
    try {
        const doc_ref = await addDoc(table, data);
        console.log('trip added');
        return doc_ref.id;
    }
    
    catch (error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    };
    
// -------------------------------------------------------- END ------------------------------------------------------------------

}

//----------------------------------------- add newly created trip to trips DB ---------------------------------------------------
export const update_trips_users = async function update_users(UID, tripID) {
    const docref = doc(db, "users", UID);

    var trips = await get_trips_users(docref);
    trips.push(tripID);
    const update = {'trips' : trips}
    
    await updateDoc(docref, update);
    console.log('updated in user');
}

async function get_trips_users(docref) {
    try {
        const doc_snap = await getDoc(docref);
        const trips = doc_snap.data().trips;
        return trips // response is trips array
    }
    
    catch(error) {
        console.log(error);
    }
}
// -------------------------------------------------------- END -------------------------------------------------------------------

//----------------------------------------------------- get trips info for specific user -----------------------------------------
export const get_info = async function get_info_trips(UID) {
    let rt = [];
    const docref = doc(db, "users", UID);
    const doc_snap = await getDoc(docref);
    const trips = doc_snap.data().trips;

    for (let trip of trips) {
        const info = await trip_info(trip);
        info['tripID'] = trip;
        console.log(info);
        rt.push(info);
    }
    return rt
}

async function trip_info(docID) {
    const doc_ref = doc(db, "trips", docID);
    const doc_snap = await getDoc(doc_ref);
    console.log(doc_snap.data());
    return doc_snap.data()
}
// -------------------------------------------------------- END ------------------------------------------------------------------