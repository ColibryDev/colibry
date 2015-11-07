
if (Meteor.isClient) {

// SUBSCRIBE toutes les images du
Meteor.subscribe('images');

// Variable est ce qu'on est en train d'upload le profile !
Session.setDefault('updatingProfile', false);
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

  // fonction qui permet de dessiner un cercle sur la carte en question et de renvoyer les données bounds, c'est à dire pour déterminer ensuite le zoom et le center de la map
  // 3 arguments : le om de la map, l'addresse à encercler ainsi que la couleur (rouge pour personal et bleu pour work)
  function setCircle(map, address, color) {
  var addressCircles = new google.maps.Circle({
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: 0.35,
      map: map.instance,
      center: {lat: address.lat, lng: address.lng},
      radius: 80
    });
  return addressCircles.getBounds();
  }

  function setMaps() {
    var currentUser = Meteor.user();
    // Créé la map uniquement si l'addresse 1 existe
    if (currentUser.profile.address1) {
    // Définit la première map pour l'addresse personnelle
  GoogleMaps.ready('address1Map', function(map) {
  // appelle la fonction setCircl et récupère le bounds qui me permet de définir mon centre et mon zoom grace à la fonction fitBounds.
  var bounds = setCircle(map, currentUser.profile.address1, '#FF0000');
  GoogleMaps.maps.address1Map.instance.fitBounds(bounds);
  });
  }

// Créé la map uniquement si l'addresse 2 existe
    if (currentUser.profile.address2) {
    // Définit la deuxième map pour l'addresse work
  GoogleMaps.ready('address2Map', function(map) {
  // appelle la fonction setCircl et récupère le bounds qui me permet de définir mon centre et mon zoom grace à la fonction fitBounds.
  var bounds = setCircle(map, currentUser.profile.address2, '#000080');
  GoogleMaps.maps.address2Map.instance.fitBounds(bounds);
  });
  }

  }

// Création de la map 
Template.profilepage.onCreated(function() {
// Appelle la fonction SetMaps que j'ai créé pour crééer les 2 cartes
 setMaps();
});


Template.profilepage.events({
	'click .updateProfile' : function(){
	Session.set('updatingProfile', true);
	},

	'click .saveProfile' : function(event){
  var userId = Meteor.userId();
	document.getElementById('save-pic').click();
	document.getElementById('save-profileInfo').click();

  // Récupère les valeurs qui sont dans les champs addresses
  var address1 = document.getElementById('address1Field').value;
  var address2 = document.getElementById('address2Field').value;
  // si elles sont nulles alors cela supprime les addresses dans la BD Meteor.usesrs
  if (address1 == ""){
    Meteor.users.update( userId, { $unset: { 'profile.address1': "" } } );
  }
  if (address2 == ""){
    Meteor.users.update( userId, { $unset: { 'profile.address2': "" } } );
  }

	// Appelle la fonction SetMaps que j'ai créé pour recréer les maps avec les bons cercles
  setMaps();
  Session.set('updatingProfile', false);
	},

  // Si l'utilisateur presse entrée (code 13)
  'keypress input': function(event) {
        if (event.charCode == 13) {
            document.getElementById('save-button').click();
            event.stopPropagation();
        }
    },

	'click .suppressAccount' : function(){
	dhtmlx.message({type:"error", text:"Dumb, you thought you could leave like that ? ", expire: 1000});
	}  
});



	Template.profilepage.helpers({
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


    //	if ((currentUser.profile.address1)&&(currentUser.profile.address2)
    //	{
    //	console.log("1 et 2");
    //	}


      // Map initialization options
      return {
      	disableDoubleClickZoom: false, 
      	center : new google.maps.LatLng(45.50737, -73.564101),
      		scrollwheel: false,
         // Apply the map style array to the map.
         zoom :10,
    	styles: styleArray
    	};

    	      
    }
  },

	'actuallyUpdatingProfile' : function(){
	var updatingProfile = Session.get('updatingProfile');
	return updatingProfile;
  },

  'getSecondAddress' : function(){
  var secondAddress = Session.get('secondAddress');
  return secondAddress;
  },

		// Permet d'afficher la photo de profile
	'getProfilePic': function () {
	var currentUser = Meteor.user();
	var profilePicId = currentUser.profile.pic;
    return IMAGES.findOne({_id:profilePicId}); // Where Images is an FS.Collection instance
  	},

	'birthdayDateFormat' : function() {
	// pour s'amuser : http://momentjs.com/docs/#/displaying/from/
	// Permet de mettre la date du jour au bon format
   	var currentUser = Meteor.user();
   	var birthdayDate = moment(currentUser.profile.birthday).format('DD/MM/YYYY');
   	return birthdayDate;
	},

	'timeFromInscription' : function() {
	// pour s'amuser : http://momentjs.com/docs/#/displaying/from/
   	var currentUser = Meteor.user();
   	// CREATEDAT NE FONCTIONNE PAS. A REGLER....
   	var a = currentUser.createdAt;
  
   	console.log(a);
   	var c = moment(a).toNow();
   	console.log(c);
   	return c;
	},

	'actuallyUpdatingProfile' : function(){
	var updatingProfile = Session.get('updatingProfile');
	return updatingProfile;
 	},

 	'getProgressBarPercentage' : function(){
 	var percentage = 0;
 	var currentUser = Meteor.user();
 	if (currentUser.profile.address1) {percentage = percentage +25;}
 	if (currentUser.profile.address2) {percentage = percentage +25;}
 	if (currentUser.profile.birthday) {percentage = percentage +25;}
 	if (currentUser.profile.pic) {percentage = percentage +25;}
 	return percentage;
 	}
});




// Fin côté client
}



if (Meteor.isServer) {
}
