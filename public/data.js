import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getFirestore, 
         collection, 
         addDoc,
         getDocs } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";

import { config } from './stuff.js';

const firebaseApp = initializeApp(config);
const db = getFirestore(firebaseApp);

const table = collection(db, 'users');

// JUST TESTING CODE

let data = {
    name: 'you', 
    age: 20
};

addDoc(table, data)
    .then( () => {
        console.log('added')
    })
    .catch((error) => {
        console.log('there wasn an error')
    });

let all = [];
const querySnapshot = await getDocs(table);
for (let doc of querySnapshot.docs) {
    all.push(doc.data()); 
}

console.log(all);

const app = Vue.createApp({ 
    data() { 
        return { 
              items : all
        };
    }
});
const vm = app.mount('#app'); 