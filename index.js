/* === Imports === */
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
  import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDjpLfT7eNBfSR7V1uUJQORHizBuZnC3E8",
    authDomain: "pentyrch-rangers-fines.firebaseapp.com",
    projectId: "pentyrch-rangers-fines",
    storageBucket: "pentyrch-rangers-fines.appspot.com",
    messagingSenderId: "429528917143",
    appId: "1:429528917143:web:832b6087fcb3ce9a12b5d2"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const provider = new GoogleAuthProvider();  
  const db = getFirestore(app)
/* == UI - Elements == */

/* == Screens == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")
const viewAddPlayer = document.getElementById("add-player-view")
const viewCurrentPlayer = document.getElementById("current-player-view")

/* == LoggedOutPage == */

const signInWithGoogleButtonEl = document.getElementById("sign-in-with-google-btn")

const emailInputEl = document.getElementById("email-input")
const passwordInputEl = document.getElementById("password-input")

const signInButtonEl = document.getElementById("sign-in-btn")
const createAccountButtonEl = document.getElementById("create-account-btn")

/* == LoggedInPage == */

const playersEl = document.getElementById("players")

const signOutButtonEl = document.getElementById("sign-out-btn")
const addPlayerViewEl = document.getElementById("add-player-view-btn")
const loggedInNavEl = document.getElementById("logged-in-nav")

/* == Add Player Page == */

const addPlayerEl = document.getElementById("add-player-btn")
const cancelPlayerEl = document.getElementById("cancel-player-btn")
const firstnameInputEl = document.getElementById("firstname-input")
const lastnameInputEl = document.getElementById("lastname-input")

/* == CurrentPlayerPage == */

const backButtonEl = document.getElementById("back-btn")
const fineInputEl = document.getElementById("fine-input")
const fineReasonEl = document.getElementById("fine-reason-input")
const addFineEl = document.getElementById("add-fine-btn")
const subtractFineEl = document.getElementById("subtract-fine-btn")

/* = Global Constants = */

const collectionName = "players"

/* == UI - Event Listeners == */

// Logged Out Page

signInWithGoogleButtonEl.addEventListener("click", authSignInWithGoogle)

signInButtonEl.addEventListener("click", authSignInWithEmail)
createAccountButtonEl.addEventListener("click", authCreateAccountWithEmail)


// Logged In Page

signOutButtonEl.addEventListener("click", authSignOut)
addPlayerViewEl.addEventListener("click", function(){
    showAddPlayerView()
})


// Add Player Page

addPlayerEl.addEventListener("click", addPlayerButtonPressed)
cancelPlayerEl.addEventListener("click", function(){
    showLoggedInView()
})

// Current Player Page

backButtonEl.addEventListener("click", function(){
    showLoggedInView()
})

/* === Main Code === */

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/auth.user
      showLoggedInView()
      fetchInRealtimeAndRenderPostsFromDB()
      if (user.uid != "ny9AcswqXlTB9NyHwfrTAquoJkV2") {
        addPlayerViewEl.style.display = "none"
        loggedInNavEl.style.justifyContent = "flex-end"
      } else {
        addPlayerViewEl.style.display = ""
        loggedInNavEl.style.justifyContent = "space-between"
      }
    } else {
      // User is signed out
      showLoggedOutView()
    }
  });
  
/* === Functions === */

/* = Functions - Firebase - Authentication = */

function authSignInWithGoogle() {
    signInWithPopup(auth, provider)
    .then((result) => {
        console.log("Signed in with Google")
    }).catch((error) => {
        console.error(error.message)
    });
}

function authSignInWithEmail() {
    const email = emailInputEl.value 
    const password = passwordInputEl.value


    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            clearAuthFields()
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorMessage)
            alert(errorCode)
        });
}


function authCreateAccountWithEmail() {
    const email = emailInputEl.value
    const password = passwordInputEl.value    

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
        clearAuthFields()
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorMessage)
        alert(errorCode)
    });
}

function authSignOut() {
    signOut(auth).then(() => {

    }).catch((error) => {
      console.log(console.error)
    });
}

/* = Functions - Firebase - Cloud Firestore = */

async function addPlayerToDB(firstname, lastname, user) {
    const name = firstname + " " + lastname

    try {
        await setDoc(doc(db, collectionName, name), {
            firstname: firstname,
            lastname: lastname,
            fine: 0,
            createdByUID: user.uid
        })
        console.log("Document written with ID: ", name)
    } catch (error) {
        console.error(error.message)
    }
}

function fetchInRealtimeAndRenderPostsFromDB() {
    onSnapshot(collection(db, collectionName), (querySnapshot) => {
        clearAll(playersEl)

        querySnapshot.forEach((doc) =>{
            renderPlayer(playersEl, doc.data())
        })
    })
}

/* == Functions - UI Functions == */

function renderPlayer(playersEl, postData) {
    //const postData = wholeDoc.data()

    const firstname = postData.firstname
    const lastname = postData.lastname
    const fine = postData.fine

    const playerDiv = document.createElement("div")
    playerDiv.className = "player"

        const liName = document.createElement("li")
        liName.textContent = firstname + " " + lastname

        const liFine = document.createElement("li")
        liFine.textContent = "£" + fine

    playerDiv.appendChild(liName)
    playerDiv.appendChild(liFine)
    playersEl.appendChild(playerDiv)

    if(auth.currentUser.uid === "ny9AcswqXlTB9NyHwfrTAquoJkV2") {
        playerDiv.addEventListener("click", function(){
            showCurrentPlayerView()
        })
    }
}

function addPlayerButtonPressed() {
    const firstname = firstnameInputEl.value
    const lastname = lastnameInputEl.value
    //const fine = fineInputEl.valueAsNumber
    const user = auth.currentUser

    if(firstname && lastname) {
        addPlayerToDB(firstname, lastname, user)
        clearInputField(firstnameInputEl)
        clearInputField(lastnameInputEl)
        //fineInputEl.valueAsNumber = 0
        showLoggedInView()
    } else {
        console.log("You haven't entered a name")
    }
}


function clearAll(element) {
    element.innerHTML = ""
}

function showLoggedOutView() {
    hideView(viewLoggedIn)
    hideView(viewAddPlayer)
    hideView(viewCurrentPlayer)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    hideView(viewAddPlayer)
    hideView(viewCurrentPlayer)
    showView(viewLoggedIn)
}

function showAddPlayerView(){
    hideView(viewLoggedIn)
    hideView(viewLoggedOut)
    hideView(viewCurrentPlayer)
    showView(viewAddPlayer)
}

function showCurrentPlayerView() {
    hideView(viewLoggedIn)
    hideView(viewLoggedOut)
    hideView(viewAddPlayer)
    showView(viewCurrentPlayer)
}

function showView(view) {
    view.style.display = "flex"
}

function hideView(view) {
    view.style.display = "none"
}

function clearInputField(field) {
	field.value = ""
}

function clearAuthFields() {
	clearInputField(emailInputEl)
	clearInputField(passwordInputEl)
}