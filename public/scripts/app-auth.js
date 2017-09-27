/**
 * Function called when clicking the Login/Logout button.
 */
// [START buttoncallback]
function toggleSignIn() {
    if (!firebase.auth().currentUser) {
    // [START createprovider]
    var provider = new firebase.auth.GoogleAuthProvider();
    // [END createprovider]
    // [START addscopes]
    provider.addScope('https://www.googleapis.com/auth/plus.login');
    // [END addscopes]
    // [START signin]
    firebase.auth().signInWithRedirect(provider);
    // [END signin]
    } else {
    // [START signout]
    firebase.auth().signOut();
    // [END signout]
    }
    // [START_EXCLUDE]
    document.getElementById('quickstart-sign-in').disabled = true;
    // [END_EXCLUDE]
}
// [END buttoncallback]
/**
 * initApp handles setting up UI event listeners and registering Firebase auth listeners:
 *  - firebase.auth().onAuthStateChanged: This listener is called when the user is signed in or
 *    out, and that is where we update the UI.
 */
function initApp() {
    // Result from Redirect auth flow.
    // [START getidptoken]
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
            // This gives you a Google Access Token. You can use it to access the Google API.
            var token = result.credential.accessToken;
            // [START_EXCLUDE]
            console.log(token);
        } else {
            console.log('null');
            // [END_EXCLUDE]
        }
        // The signed-in user info.
        var user = result.user;
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // [START_EXCLUDE]
        if (errorCode === 'auth/account-exists-with-different-credential') {
            alert('You have already signed up with a different auth provider for that email.');
            // If you are using multiple auth providers on your app you should handle linking
            // the user's accounts here.
        } else {
            console.error(error);
        }
        // [END_EXCLUDE]
    });
    // [END getidptoken]
    // Listening for auth state changes.
    // [START authstatelistener]
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

            var newUserMenuElem = $(''
            +'<div id="user-menu" class="user-menu">'
            +'<div class="user-name"><span><img src="'+photoURL+'" alt=""></span>'+displayName+'</div>'
            +'<ul>'
            +'    <li><a href="/$/dashboard"><i class="sl sl-icon-settings"></i> Dashboard</a></li>'
            +'    <li><a href="/$/inbox"><i class="sl sl-icon-envelope-open"></i> Messages</a></li>'
            +'    <li><a href="/$/profile"><i class="sl sl-icon-user"></i> My Profile</a></li>'
            +'    <li><a href="#" onclick="toggleSignIn()"><i class="sl sl-icon-power"></i> Logout</a></li>'
            +'</ul>'
            +'</div>'
            );
            $("#sign-in").hide();
            $('.header-widget').append(newUserMenuElem);

        } else {
        
            $("#sign-in").show();
            $("#user-menu").remove();
        }
        // [START_EXCLUDE]
        document.getElementById('sign-in').disabled = false;
        // [END_EXCLUDE]
    });
    // [END authstatelistener]
    document.getElementById('google-login-button').addEventListener('click', toggleSignIn, false);
}

window.onload = function() {
    initApp();
};
