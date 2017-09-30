/**
 * Writes the user's data to the database.
 */
// [START basic_write]
function writeUserData(userId, name, email, imageUrl) {
    firebase.database().ref('users/' + userId).set({
        username: name,
        email: email,
        profile_picture : imageUrl
    });
}
  // [END basic_write]

/**
 * Saves a new post to the Firebase DB.
 */
// [START write_fan_out]
function writeNewListing(uid, username, picture, title, address, geo, overview, pricing, ameneties ) {
    // A post entry.
    var listingData = {
      host: username,
      uid: uid,
      title: title,
      address: address,
      geo: geo,
      starCount: 0,
      overview: overview,
      pricing: pricing,
      ameneties: ameneties,
      ownerpic: picture
    };
  
    // Get a key for a new Post.
    var newListKey = firebase.database().ref().child('listings').push().key;
  
    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/listings/' + newListKey] = listingData;
    updates['/user-listings/' + uid + '/' + newListKey] = listingData;
  
    return firebase.database().ref().update(updates);
  }
  // [END write_fan_out]

/**
 * Creates a new listing for the current user.
 */
function newListingForCurrentUser(title, address, geo, overview, pricing, ameneties) {
    // [START single_value_read]
    var userId = firebase.auth().currentUser.uid;
    return firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
      var username = (snapshot.val() && snapshot.val().username) || 'Anonymous';
      // [START_EXCLUDE]
      return writeNewListing(firebase.auth().currentUser.uid, 
                          username,
                          firebase.auth().currentUser.photoURL,
                          title,
                          address,
                          geo,
                          overview,
                          pricing, 
                          ameneties);
      // [END_EXCLUDE]
    });
    // [END single_value_read]
}

/* ----------------- Start Document ----------------- */
(function($){
"use strict";
    $(document).ready(function(){
        listingSplash = $('#listings-container').clone();

        $('#add-listing-button').click(function(){
            var title = $('#listing-title').val();
            var address = "Cogon Ramos, Cebu City";
            var geo = "10.305410, 123.897837";
            var overview = ""
            +"At Workplace Cafe, we give you everything you need to get your work done, plus the lovely vibe of the coffee shop. "
            +"You are given lots of power outlets, comfy seats, and extra fast WiFi. Other than that, we offer pasta, all-day meals, cakes, health drinks and brain food. ";
            +"Furthermore, you can ask one of our friendly staff to do things for you like printing and scanning your documents."
            var pricing = "35,280";
            var ameneties = "Brewed Coffee or Tea, Fiber Wifi Connection, Lots of Power outlets, Comfortable seats and spacious desks, Napping station"
            newListingForCurrentUser(title, address, geo, overview, pricing, ameneties);
        });
    });
})(this.jQuery);

function createListItem(listingKey,listing){
    var uid = firebase.auth().currentUser.uid;
    var html = ''
    +'<div class="col-lg-12 col-md-12">'
    +'    <div class="listing-item-container list-layout">'
    +'        <a href="/$/cafe/'+listingKey+'" class="listing-item">'     
    +'            <!-- Image -->'
    +'            <div class="listing-item-image">'
    +'                <img src="/images/listing-item-01.jpg" alt="">'
    +'                <span class="tag"><i class="fa fa-coffee"></i>Brewed Coffee</span>'
    +'            </div>'
    +'            <!-- Content -->'
    +'            <div class="listing-item-content">'
    +'                <div class="listing-badge now-open">Now Open</div>'
    +'                <div class="listing-item-inner">'
    +'                    <h3>'+listing.title+'</h3>'
    +'                    <span>'+listing.address+'</span>'
    +'                    <div class="star-rating" data-rating="'+listing.starCount+'">'
    +'                        <div class="rating-counter">(190 reviews)</div>'
    +'                    </div>'
    +'                    <div><i class="im im-icon-Wifi"></i>&nbsp;Fiber Fast</div>'
    +'                </div>'
    +'                <span class="like-icon"></span>'
    +'                <div class="listing-item-details">'
    +'                    <i class="fa fa-clock-o"></i>&nbsp;'
    +'                    ₱ '+listing.pricing.split(',')[0]+' &nbsp; <i class="fa fa-sun-o">'
    +'                    </i>&nbsp;₱ '+listing.pricing.split(',')[1]+'</div>    '
    +'            </div>'
    +'        </a>'
    +'    </div>'
    +'</div>';

    $('#listings-container').append(html);
    
}

function startDBQuery(){
  // [START my_top_posts_query]
  var userId = firebase.auth().currentUser.uid;
  var recentListingsRef = firebase.database().ref('listings').limitToLast(100);
  recentListingsRef.on('child_added', function(data){
    createListItem(data.key,data.val());
    $('.timeline-wrapper').remove();
  });

  listeningFirebaseRefs.push(recentListingsRef);
}

var listeningFirebaseRefs = [];
var listingSplash;
/**
 * Cleanups the UI and removes all Firebase listeners.
 */
function cleanupUi() {

    $('#listings-container').html('');
    $('#listings-container').append(listingSplash.html());
    
    // Stop all currently listening Firebase listeners.
    listeningFirebaseRefs.forEach(function(ref) {
        ref.off();
    });
    listeningFirebaseRefs = [];
}