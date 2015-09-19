
if (Meteor.isClient) {
Meteor.subscribe('images');


	Template.infoProfile.helpers({
// Options de connexion a l'API GOOGLE uniquement pour la partie
// adresses de location, ici on pourra jouer sur le country. Pour les autres options, regarder les données du package ou de l'API GOOGLE
  optsGoogleplace: function() {
    return {
       type: 'googleUI',
       stopTimeoutOnKeyup: false,
       googleOptions: {
         componentRestrictions: { country:'ca' }
       }
    }
  },



// données de configuration de la map qu'on affiche sur le profile
  addressesMapOptions: function() {
    // Make sure the maps API has loaded
   	var currentUser = Meteor.user();

    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(currentUser.profile.address1.lat,currentUser.profile.address1.lng),
        scrollwheel: false,
         // Apply the map style array to the map.
    	styles: styleArray,
        zoom: 8
      };
    }
  }

});




Template.infoProfile.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  GoogleMaps.ready('addressesMap', function(map) {
    // Add a marker to the map once it's ready
    var marker = new google.maps.Marker({
      position: map.options.center,
      map: map.instance
    });
  });
});


  // Specify features and elements to define styles of my map
// On peut jouer dedans...
 var styleArray = [
    {
      featureType: "all",
      stylers: [
       { saturation: -80 }
      ]
    },{
      featureType: "road.arterial",
      elementType: "geometry",
      stylers: [
        { hue: "#00ffee" },
        { saturation: 50 }
      ]
    },{
      featureType: "poi.business",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    }
  ];




 

	

	Template.photoProfile.helpers({
	getProfilePic: function () {
	var currentUser = Meteor.user();
	var profilePicId = currentUser.profile.pic;
    return IMAGES.findOne({_id:profilePicId}); // Where Images is an FS.Collection instance
  }
});

}



if (Meteor.isServer) {
}
