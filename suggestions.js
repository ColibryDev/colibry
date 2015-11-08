////////////////////////////////////////////////////////////////////// CLIENT SIDE /////////////////////////////////////////////////////////////////////////////
if (Meteor.isClient) {
// SUBSCRIBE POUR RÉCUPÉRER TOUTES LES ADRESSES DES UTILISATEURS
	Meteor.subscribe('UsersPublicInfos');
	Deps.autorun(function () {
  // will re subscribe every the 'center' session changes
//  Meteor.subscribe("locations", Session.get('center'));
	});

	function fromWhere(){  		
    	if(document.getElementById('home').checked)
    	{return 'home';}
    	if(document.getElementById('work').checked)
    	{return 'work';}
    	if(document.getElementById('position').checked)
    	{return 'position';}
		}


	// FONCTION QUI LANCE MA CARTE POUR SAVOIR OU SONT LES UTILISATEURS AUTOUR DE MOI
		function setUsersMap(){
		GoogleMaps.ready('usersMap', function(map){		
		var currentUser = Meteor.user();
		var from =fromWhere();
		if (currentUser.profile.address1 && from =="home")
		{new google.maps.Marker({
		draggable: false,
		animation: google.maps.Animation.DROP,
		position: new google.maps.LatLng(currentUser.profile.address1.lat,currentUser.profile.address1.lng),
		title:"Home",
		map: map.instance
		});}
		
		if (currentUser.profile.address2 && from =="work")
		{new google.maps.Marker({
		draggable: false,
		animation: google.maps.Animation.DROP,
		position: new google.maps.LatLng(currentUser.profile.address2.lat,currentUser.profile.address2.lng),
		title:"Work",
		map: map.instance
		});}

		setLenderCircles(map);
		});
		}

// fonction qui permet de dessiner les cerles des lenders
function setLenderCircles(map) {
var lendersAddresses = [];
var currentUser = Meteor.user();
Meteor.users.find({_id:{$ne:currentUser._id}}).forEach(function(element) 
	{
 	lendersAddresses.push({
		address1:{
			lat : element.profile.address1.lat,
 			lng : element.profile.address1.lng
		},
		address2:{
			lat : element.profile.address2.lat,
 			lng : element.profile.address2.lng
		} 			
 	});
	});

 // maintenant il faut créer un if pour savoir quel point est le plus proche et changer la couleur du cercle en fonction... 		for (var nb in lendersAddresses) {
// Boucle qui déroule toutes les addresses de Meteor.Users pour les placer sur la map.
for (var nb in lendersAddresses)
{
var lenderCircle = new google.maps.Circle({
	strokeColor: '#FF0000',
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: 0.35,
    map: map.instance,
    center: lendersAddresses[nb].address2,
    radius: 80
});
} // Fin de boucle

}


	Template.usersMap.helpers({
	usersMapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      // on récupère l'info sur quel est le radio button qui est actif èa travers la fonction fromWhere()
      var from = fromWhere();
      // on récupère les infos de l'utilisateur actuellement connecté
      var currentUser = Meteor.user();
    if (from == "home")
     	{return {center: new google.maps.LatLng(currentUser.profile.address1.lat,currentUser.profile.address1.lng),
        zoom: 14};
    	}
    if (from == "work")
     	{return {center: new google.maps.LatLng(currentUser.profile.address2.lat,currentUser.profile.address2.lng),
        zoom: 14};
    	}
    if (from == "position")
     	{// A DEFINIR
     	return {center: new google.maps.LatLng(currentUser.profile.address1.lat,currentUser.profile.address1.lng),
        zoom: 14};
    	}
      
    }
  }
	}); // Fin template  

	// Lors de la création
	Template.usersMap.onCreated(function(){
	setUsersMap();
	}); // Fin Template

} // FIN CLIENT SIDE

////////////////////////////////////////////////////////////////////// SERVER SIDE /////////////////////////////////////////////////////////////////////////////
if (Meteor.isServer) {

// Meteor Publish adresses (lat,lgn) des utillisateurs
Meteor.publish('UsersPublicInfos',function(){
// Cela retourne tous les lat / lng des utilisateurs, sauf l'utilisateur actuel..
        var currentUserId = this.userId;
    return Meteor.users.find({_id:{$ne:currentUserId}},{fields:{'profile.address1.lat':1,'profile.address1.lng':1,'profile.address2.lat':1,'profile.address2.lng':1,}});
  });

} // FIN SERVER SIDE