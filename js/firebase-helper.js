
// root of the firebase database
var root;  // project root for this page
var datastore;
var authProvider;

function firebaseRoot() {
  return root.key;
}


function firebaseInit(config) {
  firebase.initializeApp(JSON.parse(config));
  authProvider = new firebase.auth.GoogleAuthProvider();


  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      let auth_object = {
        displayName : user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        isAnonymous: user.isAnonymous,
        uid: user.uid
      };
      onFirebaseLogin(JSON.stringify(auth_object));
    } else {
      onFirebaseLogout();
    }
  });

  datastore = firebase.database().ref();
  let hash = window.location.hash.replace(/#/g, '');

  if (hash) {
    root = datastore.child(hash);
    return false;
  } else {
    // generate unique location.
    root = datastore.push();
    // add it as a hash to the URL.
    window.location = window.location + '#' + root.key;
    return true;
  }
}


function firebaseLogin() {
  firebase.auth().signInWithPopup(authProvider).then(function(result) {
    // This gives you a Google Access Token. You can use it to access the Google API.
    var token = result.credential.accessToken;
  }).catch(function(error) {
    console.log(`Login error: [${error.code}] ${error.message}`);
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;
  });
}


function firebaseLogout() {
  firebase.auth().signOut();
}


function firebaseAnonymousLogin() {
  firebase.auth().signInAnonymously().catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
  });
}


function firebaseJoin() {
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .catch(function(error) {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
  });
}


function firebaseGenerateChildKey(directory) {
  let ref = datastore.child(directory);
  ref = ref.push();
  return ref.key;
}


function firebaseCreate(directory, jsonString) {
  firebaseUpdate(directory, jsonString);
}


function firebaseUpdate(directory, jsonString) {
  let data = JSON.parse(jsonString);
  let ref = datastore.child(directory);
  ref.set(data)
    .then(function () { })
    .catch(function(error) { console.log('error updating ' + directory); });
}


function firebaseRemove(directory) {
  let ref = datastore.child(directory);
  ref.remove()
    .then(function () { })
    .catch(function(error) { console.log('error deleting ' + directory); });
}


function firebaseIncrement(directory, field, delta) {
  let ref = datastore.child(directory);
  const increment = firebase.firestore.FieldValue.increment(delta);
  let data = { };
  data[field] = increment;
  ref.update(data);
}


function firebaseUpdatedCallback(directory) {
  let ref = datastore.child(directory);
  ref.on("value", function(snapshot) {
    if (snapshot.exists()) {
      onFirebaseUpdate(directory, JSON.stringify(snapshot.val()));
    }
  });
}


function firebaseAddedCallback(directory) {
  let ref = datastore.child(directory);
  ref.on('child_added', function(snapshot, prevKey) {
    onFirebaseAdded(directory, snapshot.key, prevKey, JSON.stringify(snapshot.val()));
  });
}


function firebaseRemovedCallback(directory) {
  let ref = datastore.child(directory);
  ref.on('child_removed', function(oldChild) {
    if (oldChild.ref.path.toString().startsWith(directory)) {
      onFirebaseRemoved(directory, JSON.stringify(oldChild.val()));
    }
  });
}


function trackLibraryUpdate(id, jsonString) {
  let db = firebase.firestore();
  let data = JSON.parse(jsonString);
  let base64 = data.preview;
  delete data.preview;

  let library = db.collection("library");
  library.doc(id).set(JSON.parse(jsonString))
  .then(function() { })
  .catch(function(error) { console.log('error adding' + error); });

  let preview = db.collection("previews");
  preview.doc(id).set( { "mp3-base64" : base64 } );
}


function trackLibraryQuery(searchId, orderBy, sortOrder, filter) {
  let db = firebase.firestore();
  let library = db.collection("library");
  library
    .where('instrument', 'in', JSON.parse(filter))
    //.orderBy(orderBy, sortOrder)
    .get()
    .then(function(querySnapshot) {
      querySnapshot.forEach(function(doc) {
        //console.log(doc.id, " => ", doc.data());
        onFirebaseSearchResult(searchId, JSON.stringify(doc.data()));
      });
      onFirebaseSearchDone(searchId);
    })
    .catch(function(error) {
      console.log("Error getting documents: ", error);
    });
}



function trackLibraryPreview(id) {
  let db = firebase.firestore();
  let preview = db.collection("previews").doc(id).get().then(
    function(doc) {
      if (doc.exists) {
        onFirebaseSearchResult(JSON.stringify(doc.data()));
      } else {
        console.log("No such document!");
      }
    }).catch(function(error) {
      console.log("Error getting document:", error);
    }
  );
}
