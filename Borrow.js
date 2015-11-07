

// On créé un index Easy Search pour la DB BOOKS_INFOS
// https://atmospherejs.com/matteodem/easy-search
BIIndex = new EasySearch.Index(
	{
    collection: BOOKS_INFOS,
    fields: ['title', 'authors', 'publisher'],
    engine: new EasySearch.MongoDB()
  	}
);

if (Meteor.isClient) {

	Meteor.subscribe('allAvailableBooks');
	Meteor.subscribe('UsersPublicInfos');
//	Meteor.subscribe('usersInfo');
	

// Le code tout simple que je te propose pour afficher des cartes.
// Tout est là dans le package que j'ai ajouté : https://github.com/dburles/meteor-google-maps#examples
// A mon avis, on peut tout faire avec ca !
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
      return {
        center: new google.maps.LatLng(45.498072,-73.570322),
        zoom: 14

      };
    }
  }
});
// https://developers.google.com/maps/documentation/javascript/examples/layer-fusiontables-simple
Template.mapUsers.onCreated(function(){
	GoogleMaps.ready('mapUsers', function(map){
		Session.get('usersWhoShareCoordinatesSession').forEach(function(coordinates){
			new google.maps.Marker({
		      draggable: true,
		      animation: google.maps.Animation.DROP,
		      position: new google.maps.LatLng(coordinates.lat, coordinates.lng),
		      map: map.instance
		    });
		});
	});
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
   	 	}
	});

// Fonction qui renvoit l'index de BOOKS_INFOS. Cette fonction est utilisée dans la recherche
  	Template.searchToBorrow.helpers({
  	  		biIndex: function(){
  			return BIIndex;
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




  //Meteor.publish('usersInfo',function(){
    //return Meteor.users.find();
  //});	
}
