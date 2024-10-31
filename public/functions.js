import { getFirestore, 
         collection, 
         addDoc,
         setDoc,
         getDoc,
         doc, 
         updateDoc } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

// Call this function when your app initializes

//----------------------------------------------------------------------------------------------------------------------------------
export const add_info_users = async function addUserToTable(app, UID, email, name) {
    const db = getFirestore(app);
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
//----------------------------------------------------------------------------------------------------------------------------------


//----------------------------------------------------------------------------------------------------------------------------------
export const add_info_trips = async function add_trip(app, destination, start, end, budget) {
    const db = getFirestore(app);
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
        return doc_ref.id;
    }
    
    catch (error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    };

}
//----------------------------------------------------------------------------------------------------------------------------------

export const update_trips_users = async function update_users(app, UID, tripID) {
    const db = getFirestore(app);
    const docref = doc(db, "users", UID);
    
    var trips = await get_trips_users(docref);
    trips.push(tripID);
    const update = {'trips' : trips}
    
    await updateDoc(docref, update);
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