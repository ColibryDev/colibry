// On créé un index Easy Search pour la DB BOOKS_INFOS
// https://atmospherejs.com/matteodem/easy-search
BIIndex = new EasySearch.Index(
	{
    collection: BOOKS_INFOS,
    fields: ['title', 'authors', 'publisher'],
    engine: new EasySearch.MongoDB(),
    defaultSearchOptions: {limit: 20}
  	}
);



if (Meteor.isClient) {

	// Session pour savoir d'ou est effectuée la recherche. C'est lié au Radio box
	Session.setDefault('SearchFrom', "fromHome");
// SUBSCRIBE PHYSICAL BOOKS POUR RÉCUPÉRER TOUTES LES INFOS SUR LES LIVRES
	Meteor.subscribe('allAvailableBooks');
// SUBSCRIBE POUR RÉCUPÉRER TOUTES LES ADRESSES DES UTILISATEURS
	Meteor.subscribe('UsersPublicInfos');
	Deps.autorun(function () {
  // will re subscribe every the 'center' session changes
//  Meteor.subscribe("locations", Session.get('center'));
	});

	

	// envoie l'information de quel radio button est sélectionné. Cette fonction permet à la carte de savoir ou centrer
  		function fromWhere(){  		
    	if(document.getElementById('home').checked)
    	{return 'home';}
    	if(document.getElementById('work').checked)
    	{return 'work';}
    	if(document.getElementById('position').checked)
    	{return 'position';}
		}

		function setBorrowMap(){
		GoogleMaps.ready('mapUsers', function(map){
		//Session.get('usersWhoShareCoordinatesSession').forEach(function(coordinates){
		
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

		// fonction qui permet de dessiner un cercle sur la carte en question et de renvoyer les données bounds, c'est à dire pour déterminer ensuite le zoom et le center de la map
 		 // 3 arguments : le nom de la map, l'addresse à encercler ainsi que la couleur (rouge pour personal et bleu pour work)
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

 		// maintenant il faut créer un if pour savoir quel point est le plus proche et changer la couleur du cercle en fonction...
 		
 		for (var nb in lendersAddresses) {
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
    	console.log(lenderCircle);
    	}
  		//return addressCircles.getBounds();*/
  		}

Template.mapUsers.helpers({
  
  'usersCoordinates': function(){
		// Récupère l'ID du livre choisi et sauvegarde dans un tableau les utilisateurs qui peuvent le prêter
		// pour l'instant la fonction renvoie les coordonnées des utilisateurs qui peuvent prêter
		// setting dans une session également au cas où une sytaxe paticulière demanderai l'appel d'une session plutôt que d'une fonction
		var chosenBookId = Session.get('chosenBookSession');
		console.log(chosenBookId);
		// recupération des ID des users qui peuvent partager
		var userWhoCanShare = [];
			PHYSICAL_BOOKS.find({bookRef:chosenBookId, status:"1"}).forEach(function(element) {userWhoCanShare.push(element.bookOwner);});
		Session.set('usersWhoShareSession',userWhoCanShare);
		// recupération des coordonnées des users récupérés dans la ligne du dessus
		var userWhoCanShareCoordinates = [];
		Meteor.users.find({
			_id: {
				$in : userWhoCanShare
			}
		}).forEach(function(element) {
			userWhoCanShareCoordinates.push({
				lat : element.profile.address1.lat,
				lng : element.profile.address1.lng
			});
		});

		console.log(userWhoCanShareCoordinates);
		Session.set('usersWhoShareCoordinatesSession',userWhoCanShareCoordinates);

		return userWhoCanShareCoordinates;
	},

  mapUsersOptions: function() {
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
});
// https://developers.google.com/maps/documentation/javascript/examples/layer-fusiontables-simple
Template.mapUsers.onCreated(function(){
	setBorrowMap();
});


	Template.displayAvailableBooks.helpers({
    // Fonctions pour montrer toutes les infos des livres de PHYSICAL_BOOKS qui ont un statut 1
  		'availableBooks': function(){  
   		 var differentBooks = [];
   		 PHYSICAL_BOOKS.find({status:"1"}).forEach(function(element) {differentBooks.push(element.bookRef);});
   		 // renvoi les infos des livres dont les id sont contenus dans le tableau précédent
   		 return BOOKS_INFOS.find({_id:{ $in:differentBooks}});
   		 }
  	});

  	Template.searchToBorrow.events({
    	// Recuperation de la valeur recherchée par l'utilisateur
    	'submit form': function(event){
   	 		event.preventDefault();
   	 		//passage à true de tryTosearch pour valider qu'une recherche est effectuée
   	 		Session.set('tryToSearch', true);
   	 		var tryToSearch = Session.get('tryToSearch');
   	 		console.log(tryToSearch);
   	 		var searchedBookVar1 = event.target.searchedBook.value;
   	 		// on met la valeur recherchée dans searchedBookSession pour ouvoir la rappeler ensuite avec un Get
   	 		Session.set('searchedBookSession',searchedBookVar1);		
   	 	},

   	 	'change #home' : function(){
   	 		setBorrowMap();
   	 	},
   	 	'change #work' : function(){
   	 		setBorrowMap();
   	 	},
   	 	'change #position' : function(){
		// lorsque je clique sur le 3 eme radio button
   	 	}
	});

// Fonction qui renvoit l'index de BOOKS_INFOS. Cette fonction est utilisée dans la recherche
  	Template.searchToBorrow.helpers({
  	  	biIndex: function(){
  			return BIIndex;
  		},

  		//retourne les attributs de mon input easySearch
  		inputAttributes: function(){
  			return {'class':'form-control', 'placeholder':'Search for a book in your neighbourhood ...'};
  		},

  		//retourne les attributs de mon boutton EasySearch load more
  		moreButtonAttributes:function(){
  			return {'class':'btn btn-primary'};
  		}
	});

	Template.displaySearchedBooks.helpers({

		searchInAllAvailableBooks: function() {
		// Fonction pour montrer les llivres en base de donnée qui correspondent à la recherche par titre
		// on récupère la valeur recherchée
		var searchedBookVar2 = Session.get('searchedBookSession');
		console.log(searchedBookVar2);
		// on renvoie la liste des des livres dont le titre correspond
		// la regex permet de ne pas tenir compte de la casse
   		return BOOKS_INFOS.find({title:{
                     $regex : new RegExp(searchedBookVar2, "i") }});
		},

		tryToSearch: function() {
    		return Session.get('tryToSearch');
  		}
	});

	Template.displaySearchedBooks.events({
		'click .proposedBook': function(){
			// si on clique sur un livre proposé suite à la recherche, la fonction met l'ID du livre de la DB informationBooks dans la variable selectedBook
			var chosenBookId = this._id;
			//Affiche l'ID BOOKS_INFOS du livre
			console.log(chosenBookId);
			Session.set('chosenBookSession',chosenBookId);
    	}
	});

	Template.displayChosenBook.helpers({
		'myChosenBook': function(){
			// Récupère l'ID du livre choisi par l'utilisateur (sur lequel on a cliqué)
			var chosenBookId = Session.get('chosenBookSession');
			// renvoie toutes les infos sur le livre
			return BOOKS_INFOS.findOne({_id:chosenBookId});
		},
		'usersWhoShareIt': function(){
			// Récupère l'ID du livre choisi par l'utilisateur (sur lequel on a cliqué) et renvoi la liste des physcal books correspondant
			var chosenBookId = Session.get('chosenBookSession');
			return PHYSICAL_BOOKS.find({bookRef:chosenBookId, status:"1"});
		}

	});
	
}


if (Meteor.isServer) {
	// fonction publish qui renvoit la liste de tous les livres available, quel que soit l'utilisateur
	Meteor.publish('allAvailableBooks',function(){
    return PHYSICAL_BOOKS.find({status: "1"});
  });

// Meteor Publish adresses (lat,lgn) des utillisateurs
Meteor.publish('UsersPublicInfos',function(){

/*Meteor.users.find().forEach(function(element) {

			if (element.profile.address1 )
			ADDRESSES.push({
				_id : element._id
				//add1Lat : element.profile.address1.lat,
				//add1Lng : element.profile.address1.lng,
				//add2Lat : element.profile.address2.lat,
				//add2Lng : element.profile.address2.lng
			});
		});
console.log(ADDRESSES);*/
// Cela retourne tous les lat / lng des utilisateurs, sauf l'utilisateur actuel..
        var currentUserId = this.userId;
    return Meteor.users.find({_id:{$ne:currentUserId}},{fields:{'profile.address1.lat':1,'profile.address1.lng':1,'profile.address2.lat':1,'profile.address2.lng':1,}});
  });

}
