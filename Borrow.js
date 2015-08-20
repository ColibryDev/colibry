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
   	 	var searchedBookVar = event.target.searchedBook.value;
   	 	console.log("Form submitted");
   	 	Session.set('searchedBookSession', searchedBookVar);
   	 	Session.set('tryToSearch', true);
   	 	console.log(searchedBookVar)
   	 	
    }
	});

	Template.displaySearchedBooks.helpers({
     	
	});
}


if (Meteor.isServer) {
	// fonction publish qui renvoit la liste de tous les livres available, quel que soit l'utilisateur
	Meteor.publish('allAvailableBooks',function(){
    return PHYSICAL_BOOKS.find({status: "1"});
  });
}
