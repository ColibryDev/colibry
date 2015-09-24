// Connecte à l'API GOOGLE MAPS POUR AFFICHER UNE CARTE SEULEMENT SUR borrow et lend 
// Attention sur Profile, cela fait un doublon de merde. Dur a regler...


if (Meteor.isClient) {

// LANCE L'API GOOGLE MAPS (LA CLÉ EST CACHÉE, lors du deploy, mettre la clé (essai gratuit)
// Clé Google Maps API : AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE
// Colibry, autorisation pour colibry.meteor.com
Meteor.startup(function() {
GoogleMaps.load({ v: '3', 
//key: 'AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE', 
	libraries: 'geometry,places' });
});


// Le code tout simple que je te propose pour afficher des cartes.
// Tout est là dans le package que j'ai ajouté : https://github.com/dburles/meteor-google-maps#examples
// A mon avis, on peut tout faire avec ca !
Template.map.helpers({
  
  'usersCoordinates': function(){
		// Récupère l'ID du livre choisi et sauvegarde dans un tableau les utilisateurs qui peuvent le prêter
		var chosenBookId = Session.get('chosenBookSession');
		console.log(chosenBookId);
		var userWhoCanShare = [];
			PHYSICAL_BOOKS.find({bookRef:chosenBookId, status:"1"}).forEach(function(element) {userWhoCanShare.push(element.bookOwner);});
		Session.set('usersWhoShareSession',userWhoCanShare);
		var userWhoCanShareCoordinates = [];
			Meteor.users.find({_id:{ $in:userWhoCanShare}}).forEach(function(element) {userWhoCanShareCoordinates.push(element.profile.address2.lat , element.profile.address2.lng);});
		Session.set('usersWhoShareCoordinatesSession',userWhoCanShareCoordinates);
		console.log(userWhoCanShareCoordinates);
		return userWhoCanShareCoordinates;
		
	},

  exampleMapOptions: function() {
    // Make sure the maps API has loaded
    if (GoogleMaps.loaded()) {
      // Map initialization options
      return {
        center: new google.maps.LatLng(45.498072,-73.570322),
        zoom: 11
      };
    }
  }
});

Template.map.onCreated(function() {
  // We can use the `ready` callback to interact with the map API once the map is ready.
  	GoogleMaps.ready('exampleMap', function(map) {
	    // Add a marker to the map once it's ready
	    var coordinates = usersCoordinates();
	    coordinates.forEach(function (element) {
		    var marker = new google.maps.Marker({
		        position: new google.maps.LatLng(element.profile.address2.lat, element.profile.address2.lng),
		        title: element.firstName,
		        postId: element._id
		    });
		    marker.setMap(map);
		});
	});
 });

}

if (Meteor.isClient) {

	Meteor.subscribe('allAvailableBooks');
	Meteor.subscribe('usersInfo');
	


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
   	 		console.log("Form submitted");
   	 		// on met la valeur recherchée dans searchedBookSession pour ouvoir la rappeler ensuite avec un Get
   	 		Session.set('searchedBookSession',searchedBookVar1);
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
  Meteor.publish('usersInfo',function(){
    return users.find();
  });	
}
