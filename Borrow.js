if (Meteor.isClient) {

	Meteor.subscribe('allAvailableBooks');
	

	Template.displayAvailableBooks.helpers({
    // Fonctions pour montrer toutes les infos des livres de PHYSICAL_BOOKS qui ont un statut 1
  		'availableBooks': function(){  
   		 var differentBooks = [];
   		 PHYSICAL_BOOKS.find({status:"1"}).forEach(function(element) {differentBooks.push(element.bookRef);});
   		 // renvoi les infos des livres dont les id sont contenus dans le tableau précédent
   		 return BOOKS_INFOS.find({_id:{ $in:differentBooks}});
   		 }
  	})

  	Template.searchToBorrow.events({
    // Recuperation de la valeur recherchée
    'submit form': function(event){
   	 	event.preventDefault();
   	 	Session.set('tryToSearch', true);
   	 	var tryToSearch = Session.get('tryToSearch');
   	 	console.log(tryToSearch);
   	 	var searchedBookVar1 = event.target.searchedBook.value;
   	 	console.log("Form submitted");
   	 	Session.set('searchedBookSession',searchedBookVar1);

   	 	}
	});


	Template.displaySearchedBooks.helpers({
		searchInAllAvailableBooks: function() {
		// FOnction pour montrer les llivres en base de donnée qui correspondent à la recherche par titre
		var searchedBookVar2 = Session.get('searchedBookSession');
		console.log(searchedBookVar2);
   		return BOOKS_INFOS.find({title:{
                     $regex : new RegExp(searchedBookVar2, "i") }});
		},

		tryToSearch: function() {
    		return Session.get('tryToSearch');
  		}
	});
}


if (Meteor.isServer) {
	// fonction publish qui renvoit la liste de tous les livres available, quel que soit l'utilisateur
	Meteor.publish('allAvailableBooks',function(){
    return PHYSICAL_BOOKS.find({status: "1"});
  });

	
}
