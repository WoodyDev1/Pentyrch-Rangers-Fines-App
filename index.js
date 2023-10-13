/* === Imports === */
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js"
  import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, updateDoc, increment, deleteField, serverTimestamp  } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js"
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
  const db = getFirestore(app)
/* == UI - Elements == */

/* == Screens == */

const viewLoggedOut = document.getElementById("logged-out-view")
const viewLoggedIn = document.getElementById("logged-in-view")
const viewAddPlayer = document.getElementById("add-player-view")
const viewCurrentPlayer = document.getElementById("current-player-view")
const viewAddFinePage = document.getElementById("add-fine-to-player-view")

/* == LoggedOutPage == */

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
const addFinePageButtonEl = document.getElementById("add-player-fine-view-btn")

const fineInputEl = document.getElementById("fine-input")
const fineReasonEl = document.getElementById("fine-reason-input")
const addFineEl = document.getElementById("add-fine-btn")
const fineTeamPlayedAgainstEl = document.getElementById("fine-team-played-against")

const fineReasonsEl = document.getElementById("fine-reasons")
const fineDateEl = document.getElementById("fine-date")

/* Add Fine to Player Page */

const cancelFineEl = document.getElementById("cancel-fine-btn")

/* = Global Constants = */

const collectionName = "players"

/* == UI - Event Listeners == */

// Logged Out Page

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

addFinePageButtonEl.addEventListener("click", function(){
    showAddFineToPlayerView()
})

// Add Fine to Player Page

cancelFineEl.addEventListener("click", function(){
    showCurrentPlayerView()
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
        addFinePageButtonEl.style.display = "none"
      } else {
        addPlayerViewEl.style.display = ""
        loggedInNavEl.style.justifyContent = "space-between"
        addFinePageButtonEl.style.display = ""
      }
    } else {
      // User is signed out
      showLoggedOutView()
    }
  });
  
/* === Functions === */

/* = Functions - Firebase - Authentication = */

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

async function addPlayerToDB(firstname, lastname) {
    const name = firstname + " " + lastname

    try {
        await setDoc(doc(db, collectionName, name), {
            fine: 0
        })
        console.log("Document written with ID: ", name)
    } catch (error) {
        console.error(error.message)
    }
}

function updateCurrentPlayerFine(selectedPlayerId){
    
    addFineEl.addEventListener("click", function(){
        const newFine = fineInputEl.value
        const fineReason = fineReasonEl.value
        const fineTeamPlayedAgainst = fineTeamPlayedAgainstEl.value
        const fineDate = fineDateEl.value

        if(newFine && fineReason && fineDate && fineTeamPlayedAgainst) {
            increaseFineInDB(selectedPlayerId, newFine, fineReason, fineDate, fineTeamPlayedAgainst)
            fineInputEl.value = ""
            clearInputField(fineReasonEl)
            fineDateEl.value = ""
            showCurrentPlayerView()
            //showLoggedInView()
        }
    })
}

async function increaseFineInDB(docId, newFine, fineReason, fineDate, fineTeamPlayedAgainst) {
    const postRef = doc(db, collectionName, docId)
    const reason = "Increase reason - " + fineReason
    const date = displayDate(fineDate)
    const teamPlayed = fineTeamPlayedAgainst
    const key = `${reason} - ${teamPlayed} - ${date}`

    await updateDoc(postRef, {
        [key]: newFine,
        fine: increment(newFine)
    })
}

function fetchInRealtimeAndRenderPostsFromDB() {
    onSnapshot(collection(db, collectionName), (querySnapshot) => {
        clearAll(playersEl)

        querySnapshot.forEach((doc) =>{
            renderPlayer(playersEl, doc)
        })
    })
}

function fetchInRealtimeAndRenderFineReasonsFromDB(selectedPlayerId) {
    const postRef = doc(db, collectionName, selectedPlayerId)

    onSnapshot(postRef, (doc) => {
        clearAll(fineReasonsEl)
        renderFineReasons(fineReasonsEl, doc)
    })
}

/* == Functions - UI Functions == */

function renderPlayer(playersEl, wholeDoc) {
    const postData = wholeDoc.data()
    const postId = wholeDoc.id
    
    const fine = postData.fine

        const playerDiv = document.createElement("div")
        playerDiv.className = "player"

            const liName = document.createElement("li")
            liName.textContent = postId //firstname + " " + lastname

            const liFine = document.createElement("li")
            liFine.textContent = "£" + fine

        playerDiv.appendChild(liName)
        playerDiv.appendChild(liFine)
    playersEl.appendChild(playerDiv)

    playerDiv.addEventListener("click", function(){
        showCurrentPlayerView()
        fetchInRealtimeAndRenderFineReasonsFromDB(postId)
        updateCurrentPlayerFine(postId)
        fineInputEl.value = ""
    })
}

function renderFineReasons(fineReasonsEl, wholeDoc){
    const postData = wholeDoc.data()
    const postId = wholeDoc.id

    const reason = postData

    for (let key in reason) {
        
        if(key.includes("reason")) {
            // console.log(key, reason[key])
            const fineReason = key.substr(18, 100)
            const fine = reason[key]
            const deleteFine = key
        
            const reasonDiv = document.createElement("div")
            reasonDiv.className = "fine-reason"

                const liReason = document.createElement("li")
                liReason.textContent = fineReason

                const liFine = document.createElement("li")
                liFine.textContent = "£" + fine

            reasonDiv.appendChild(liReason)
            
            reasonDiv.appendChild(liFine)
        fineReasonsEl.appendChild(reasonDiv)

        if(auth.currentUser.uid === "ny9AcswqXlTB9NyHwfrTAquoJkV2") {
            reasonDiv.addEventListener("dblclick", async function(){
                const postRef = doc(db, collectionName, postId)
    
                await updateDoc(postRef, {
                    [deleteFine]: deleteField(),
                    fine: increment(-(fine))
                })
            })
        }
        }
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
    hideView(viewAddFinePage)
    showView(viewLoggedOut)
}

function showLoggedInView() {
    hideView(viewLoggedOut)
    hideView(viewAddPlayer)
    hideView(viewCurrentPlayer)
    hideView(viewAddFinePage)
    showView(viewLoggedIn)
}

function showAddPlayerView(){
    hideView(viewLoggedIn)
    hideView(viewLoggedOut)
    hideView(viewCurrentPlayer)
    hideView(viewAddFinePage)
    showView(viewAddPlayer)
}

function showCurrentPlayerView() {
    hideView(viewLoggedIn)
    hideView(viewLoggedOut)
    hideView(viewAddPlayer)
    hideView(viewAddFinePage)
    showView(viewCurrentPlayer)
}

function showAddFineToPlayerView() {
    hideView(viewLoggedIn)
    hideView(viewLoggedOut)
    hideView(viewAddPlayer)
    hideView(viewCurrentPlayer)
    showView(viewAddFinePage)
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

function displayDate(firebaseDate) {
    if (!firebaseDate) {
        return "Date processing"
    }
    
    const date = new Date()
    
    const day = date.getDate()
    const year = date.getFullYear()
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]

    let hours = date.getHours()
    let minutes = date.getMinutes()
    hours = hours < 10 ? "0" + hours : hours
    minutes = minutes < 10 ? "0" + minutes : minutes

    return `${day} ${month} ${year}`
}