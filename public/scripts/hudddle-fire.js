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
function writeNewListing(uid, username, picture, title, address, geo, overview, pricing, ameneties, picture, wifiSpeed, freeCoffee ) {
    // A post entry.
    var listingData = {
      host: username,
      uid: uid,
      title: title,
      address: address,
      geo: geo,
      starCount: 1,
      overview: overview,
      pricing: pricing,
      ameneties: ameneties,
      ownerpic: picture,
      reviewCount: 0,
      wifiSpeed: wifiSpeed,
      freeCoffee: freeCoffee,
      isNew: true
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
function newListingForCurrentUser(title, address, geo, overview, pricing, ameneties, picture, wifiSpeed, freeCoffee) {
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
                          ameneties,
                          picture, 
                          wifiSpeed, 
                          freeCoffee);
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
            var address = $('#listing-address').val();//"Cogon Ramos, Cebu City";
            var area = $('#listing-area').val();
            var geo = "10.305410, 123.897837";
            var overview = $('#listing-overview').val();
            var pricing = $('#listing-pricing-hour input').val() +','+ $('#listing-pricing-day input').val();// csv hourly,daily
            var ameneties = [];
            $('#listing-ameneties :checked').each( function (i){
                var id = $(this).attr('id');
                ameneties.push($($(this).next('[for='+id+']')[0]).html());
            });
            ameneties = ameneties.join(',');
            var picture = ''
            var wifiSpeed = $('.listing-wifi-speed:checked').attr('data-wifi-speed');
            var freeCoffee = $('.listing-free-coffee:checked').attr('data-free-coffee');
            newListingForCurrentUser(title, address, geo, overview, pricing, ameneties, picture, wifiSpeed, freeCoffee);
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
    +'            </div>'
    +'            <!-- Content -->'
    +'            <div class="listing-item-content">'
    +'                <div class="listing-item-inner">'
    +'                    <h3>'+listing.title+'</h3>'
    +'                    <span>'+listing.address+'</span>'
    +'                    <div class="star-rating" data-rating="'+listing.starCount+'">'
    +'                        <div class="rating-counter">('+listing.reviewCount+' reviews)</div>'
    +'                    </div>'
    +'                    <div><i class="im im-icon-Wifi"></i>&nbsp;'+listing.wifiSpeed+'</div>'
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

    if(listing.freeCoffee){
        $('#listings-container').find('.listing-item-image').append(
            '<span class="tag"><i class="fa fa-coffee"></i>'+listing.freeCoffee+'</span>');
    }

    if(listing.isNew){
        $('#listings-container').find('.listing-item-content').prepend(
            '<div class="listing-badge now-open">Now Open</div>' );
    }
    
    
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