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
// SUBSCRIBE PHYSICAL BOOKS POUR RÉCUPÉRER TOUTES LES INFOS SUR LES LIVRES
	Meteor.subscribe('allAvailableBooks');
  	// Dans cette session se trouve l'ID (BOOK_INFOS) du bouquin sur lequel l'utilisateur a cliqué
  	Session.setDefault('chosenBookId', "");
  	Session.setDefault('position', "");


		// envoie l'information de quel radio button est sélectionné. Cette fonction permet à la carte de savoir ou centrer
  		function fromWhere(){  

    	if(document.getElementById("home").checked)
    	{return "home";}
    	if(document.getElementById("work").checked)
    	{return "work";}
    	if(document.getElementById("position").checked)
    	{return "position";}
    	else {return "error";}
		}


/////// TEMPLATE BORROW EVENTS //////////////
	Template.borrow.events({
  	'click':function()
  	{
  	// on vient créer une variable classDoc dans laquelle on rentre les class de l'objet qui vient d'être cliqué !
    var classDoc = event.target.classList;
    //si on a cliqué sur une image dont la class est "thumb-books", alors on affiche l'explication
      if (classDoc.contains('thumb-books') == true)
     {
  	var currentUserId = Meteor.userId();
      // si on clique sur un livre de sa bibliothèque, la fonction met l'ID du livre de la DB informationBooks dans la variable selectedPhysicalBook (afin que celui ci soit affiché)
    var selectedBook = this.__originalId;
    Session.set('chosenBookId', selectedBook);
    console.log("caca ",selectedBook);
     }
     else
     {
      //si on a pas cliqué sur une image alors l'explication sur le livre disparait !
    Session.set('chosenBookId', "");
     } 
 	}	
	}); // Fin EVENTS template Borrow

	// Lors de la création de la carte
	Template.booksMap.onCreated(function(){
	GoogleMaps.ready('booksMap', function(map){
		// Avant tout, on lance la localisation de l'utilisateur pour savoir ou il est !
		Location.getGPSState(success, failure, options);
		Location.locate(function(pos){
  		 console.log("Got a position!", pos);
  		 Session.set('position',pos);
			}, function(err){
 	  console.log("Oops! There was an error", err);
		});

		//Session.get('usersWhoShareCoordinatesSession').forEach(function(coordinates){
		// récupère mes infos perso
		var currentUser = Meteor.user();
		// récupère l'info de quel radio button est checked
		var from =fromWhere();
		// Mer un marker home si home est checked
		if (currentUser.profile.address1 && from =="home")
		{new google.maps.Marker({
		draggable: false,
		animation: google.maps.Animation.DROP,
		position: new google.maps.LatLng(currentUser.profile.address1.lat,currentUser.profile.address1.lng),
		title:"Home",
		map: map.instance
		});}
		// Met un marker work si work est checked
		if (currentUser.profile.address2 && from =="work")
		{new google.maps.Marker({
		draggable: false,
		animation: google.maps.Animation.DROP,
		position: new google.maps.LatLng(currentUser.profile.address2.lat,currentUser.profile.address2.lng),
		title:"Work",
		map: map.instance
		});}

		});

	}); // Fin Template



/////////////// TEMPLATE Des radios buttons ////////////
Template.locationRadioButtons.helpers({
	isThisAnAddress:function()
	{
	var currentUser = Meteor.user();
	// add1 = est ce que le bouton radar address 1 est displayed, idem add2
	// add1Active = est ce que le bouton radar address 1 est actif, idem add2 et position
	console.log(currentUser.profile.address1.lat);
	console.log(currentUser.profile.address2.lat);
	var result;
	// address1 et adress2 existent
	if (currentUser.profile.address1.lat && currentUser.profile.address2.lat)
	{console.log("address1 et adress2 existent");
		result = {add1:"",add2:"",add1Active:"active",add2Active:"",positionActive:""};}
	// seule adress2 existe
	else if (currentUser.profile.address1.lat == undefined && currentUser.profile.address2.lat == undefined)
	{console.log("aucune des 2 adresses n'existe");
		result = {add1:none,add2:none,add1Active:"",add2Active:"",positionActive:"active"};}
	
	else if (currentUser.profile.address1.lat == undefined)
	{console.log("seule adress2 existe");
		result = {add1:none,add2:"",add1Active:"",add2Active:"active",positionActive:""};}
	// seule adress1 existe
	else if (currentUser.profile.address2.lat == undefined)
	{console.log("seule adress1 existe");
		result = {add1:"",add2:none,add1Active:"active",add2Active:"",positionActive:""};}
	// si aucune des 2 adresses n'est renseignée
	
	console.log(result);
	return result;
	}
}); // Fin Template



/////////////// TEMPLATE DE LA MAP = booksMap ////////////
Template.booksMap.helpers({
	booksMapOptions: function() {
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
  },

  'usersCoordinates': function(){
		// Récupère l'ID du livre choisi et sauvegarde dans un tableau les utilisateurs qui peuvent le prêter
		// pour l'instant la fonction renvoie les coordonnées des utilisateurs qui peuvent prêter
		// setting dans une session également au cas où une sytaxe paticulière demanderai l'appel d'une session plutôt que d'une fonction
		var chosenBookId = Session.get('chosenBookId');
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
	}
  
}); // fin template

// https://developers.google.com/maps/documentation/javascript/examples/layer-fusiontables-simple
Template.booksMap.onCreated(function(){
	//setBorrowMap();
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

  	Template.displaySearch.events({
    	// Recuperation de la valeur recherchée par l'utilisateur
    	/*'submit form': function(event){
   	 		event.preventDefault();
   	 		//passage à true de tryTosearch pour valider qu'une recherche est effectuée
   	 		Session.set('tryToSearch', true);
   	 		var tryToSearch = Session.get('tryToSearch');
   	 		console.log(tryToSearch);
   	 		var searchedBookVar1 = event.target.searchedBook.value;
   	 		// on met la valeur recherchée dans searchedBookSession pour ouvoir la rappeler ensuite avec un Get
   	 		Session.set('searchedBookSession',searchedBookVar1);		
   	 	},*/

   	 	'change #home' : function(){
   	 		setBorrowMap();
   	 	},
   	 	'change #work' : function(){
   	 		setBorrowMap();
   	 	},
   	 	'change #position' : function(){
		// lorsque je clique sur le 3 eme radio button
   	 	},
   	 	/*'click .searchBooks': function(){
			// si on clique sur un livre proposé suite à la recherche, la fonction met l'ID du livre de la DB BOOKS_INFOS dans la variable selectedBook
			var chosenBookId = this._id;
			//Affiche l'ID BOOKS_INFOS du livre
			console.log(chosenBookId);
			Session.set('chosenBook',chosenBookId);
    	}*/
	});

	Template.displaySearch.helpers({
  	// Fonction qui renvoit l'index de BOOKS_INFOS. Cette fonction est utilisée dans la recherche
	biIndex: function(){
  	return BIIndex;
  	},
  	
  	//retourne les attributs de mon boutton EasySearch load more
  	moreButtonAttributes:function(){
  	return {'class':'btn btn-primary'};
  	}
	});

///////////// HELPERS POUR LE TEMPLATE searchBar ////////////////

  	Template.searchBar.helpers({
	// Fonction qui renvoit l'index de BOOKS_INFOS. Cette fonction est utilisée dans la recherche
	biIndex: function(){
  	return BIIndex;
  	},

	//retourne les attributs de mon input easySearch
  	inputAttributes: function(){
  	return {'class':'form-control', 'placeholder':'Search for a book in your neighbourhood ...'};
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

	Template.displayChosenBook.helpers({
		'myChosenBook': function(){
			// Récupère l'ID du livre choisi par l'utilisateur (sur lequel on a cliqué)
			var chosenBookId = Session.get('chosenBookId');
			// renvoie toutes les infos sur le livre
			return BOOKS_INFOS.findOne({_id:chosenBookId});
		},
		'usersWhoShareIt': function(){
			// Récupère l'ID du livre choisi par l'utilisateur (sur lequel on a cliqué) et renvoi la liste des physcal books correspondant
			var chosenBookId = Session.get('chosenBookId');
			console.log()
			return PHYSICAL_BOOKS.find({bookRef:chosenBookId, status:"1"});
		},
		'userInfos': function(){
		// Cette fonction 
		// On met dans une variable
		var bookOwner = this.bookOwner;
		var actualUser = Meteor.users.findOne({_id:bookOwner});
		console.log(actualUser);
		
		// Distance jusqu'à l'add 1 et l'add 2
		var distanceToAdd1 = 1000000;
		var distanceToAdd2 = 1000000;
		var currentUser = Meteor.user();
		var from = fromWhere();
		console.log(from);
		// si actualUser existe	
	if (actualUser)
	{
		// Si le radio option = home
		if (from == "home"){
			if (currentUser.profile.address1 && actualUser.profile.address1.lat)
				{
				distanceToAdd1 = nearByLocation.getDistance({
				latA: currentUser.profile.address1.lat,
				latB: actualUser.profile.address1.lat,
				lngA: currentUser.profile.address1.lng,
				lngB: actualUser.profile.address1.lng
				});
				}
			if (currentUser.profile.address1 && actualUser.profile.address2.lat)
				{
				distanceToAdd2 = nearByLocation.getDistance({
				latA:currentUser.profile.address1.lat,
				latB: actualUser.profile.address2.lat,
				lngA: currentUser.profile.address1.lng,
				lngB: actualUser.profile.address2.lng
				});
				}
		}
		if (from == "work"){
			if (currentUser.profile.address2 && actualUser.profile.address1.lat)
				{
				distanceToAdd1 = nearByLocation.getDistance({
				latA: currentUser.profile.address2.lat,
				latB: actualUser.profile.address1.lat,
				lngA: currentUser.profile.address2.lng,
				lngB: actualUser.profile.address1.lng
				});
				}
			if (currentUser.profile.address2 && actualUser.profile.address2.lat)
				{
				distanceToAdd2 = nearByLocation.getDistance({
				latA: currentUser.profile.address2.lat,
				latB: actualUser.profile.address2.lat,
				lngA: currentUser.profile.address2.lng,
				lngB: actualUser.profile.address2.lng
				});
				}
		}
		if (from == "position"){
		// calculer la distance depuis ma position
		// var distance = nearByLocation.getDistance({})
		}

		console.log(distanceToAdd2.distance);
		console.log(distanceToAdd1.distance);
		// On calcule qui est le plus proche.
		if (distanceToAdd1.distance > distanceToAdd2.distance) 
		{
			if (distanceToAdd2.distance > 1) 
			{	
			return {firstName:actualUser.profile.firstName,distance:distanceToAdd2.distance.toFixed(1),unit:"km"};
			}
			else
			{
			var distanceFinale = distanceToAdd1.distance*1000;
			return {firstName:actualUser.profile.firstName,distance:distanceFinale.toFixed(0),unit:"m"};
			}
		}
		else 
		{	// on met en mètre si c'est inférieur à 1 km
			if (distanceToAdd1.distance > 1) 
			{	
			return {firstName:actualUser.profile.firstName,distance:distanceToAdd1.distance.toFixed(1),unit:"km"};
			}
			else
			{
			var distanceFinale = distanceToAdd1.distance*1000;
			return {firstName:actualUser.profile.firstName,distance:distanceFinale.toFixed(0),unit:"m"};
			}
		}
		
	}
	else
	{
	return {firstName:"User unavailable",distance:"0", unit:"m"};
	}
	}
	});
	
}


if (Meteor.isServer) {
	// fonction publish qui renvoit la liste de tous les livres available, quel que soit l'utilisateur
	Meteor.publish('allAvailableBooks',function(){
    return PHYSICAL_BOOKS.find({status: "1"});
  });

}
