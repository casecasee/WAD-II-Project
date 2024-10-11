import { getFirestore, 
         collection, 
         addDoc,
         getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

export const add = async function addUserToTable(app, UID, email, name) {
    const db = getFirestore(app);
    const table = collection(db, 'users');
    
    const data = {
        'uid' : UID,
        'email' : email, 
        'name' : name
    };

    try {
        await addDoc(table, data);
        console.log('added');
    }

    catch (error) {
        const errCode = error.code;
        const errMsg = error.message;
        console.log(errCode + errMsg);
    };

}