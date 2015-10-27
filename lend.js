
if (Meteor.isClient) {
  // Suscribe collection BOOKS : tous les livres de l'utilisateur actuel
  Meteor.subscribe('allBooksInformation');
 Meteor.subscribe('myPhysicalBooks');


  Session.setDefault('searching', false);
  Session.setDefault('actualGoogleBooksSearch', false);
  Session.setDefault('targetedStatus', "no move");
  Session.setDefault('selectedPhysicalBook', "");

  // fonction liée à la reserche sur l'API Google Books
  Tracker.autorun(function() {  
  if (Session.get('query')) {
    var searchHandle = Meteor.subscribe('GOOGLE_BOOKS_SEARCH', Session.get('query'));
    Session.set('searching', ! searchHandle.ready());
  }
  });





//////////////////////////////////////////// INTERACT //////////////////////////////////////////////////////
// Fonctions pour gérer le drag & drop //
interact('.draggable')
  .draggable({
    // enable inertial throwing
    inertia: true,
    // keep the element within the area of it's parent
    restrict: {
      restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },

    // call this function on every dragmove event
    onmove: dragMoveListener,
    // call this function on every dragend event
    onend: function (event) {
      var textEl = event.target.querySelector('p');

      textEl && (textEl.textContent =
        'moved a distance of '
        + (Math.sqrt(event.dx * event.dx +
                     event.dy * event.dy)|0) + 'px');
    }
  });

  function dragMoveListener (event) {
    var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
        
    // translate the element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);

  }

  // this is used later in the resizing demo
  window.dragMoveListener = dragMoveListener;

interact('.dropzone').dropzone({
  // only accept elements matching this CSS selector
  //accept: '#yes-drop',
  // Require a 75% element overlap for a drop to be possible
  overlap: 0.75,

  // listen for drop related events:

  ondropactivate: function (event) {
    // add active dropzone feedback
    event.target.classList.add('drop-active');
  },
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;

    // feedback the possibility of a drop
    dropzoneElement.classList.add('drop-target');
    draggableElement.classList.add('can-drop');
   // draggableElement.textContent = 'Dragged in';
  },
  ondragleave: function (event) {
    //EN DEHORS d'UNE ZONE !!!
    // remove the drop feedback style
    var dropzoneElement = event.target,
        targetedStatus = dropzoneElement.id;

    Session.set('targetedStatus',targetedStatus);
    var draggableElement = event.relatedTarget;
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
   // event.relatedTarget.textContent = 'Dragged out';


  },
  ondrop: function (event) {
    // LORSQU'ON LACHE L'ITEM
    // Change le statut du livre
   var selectedPhysicalBook = Session.get('selectedPhysicalBook');
   var targetedStatus = Session.get('targetedStatus');

   //On peut passer de la 3eme section à la première.
   //effet visuel zab. Il revient toujours à sa place.
    //Que faire quand on ne le change pas de place ?

   if (targetedStatus == "no move") {}
    else {
    Meteor.call('statusChange', selectedPhysicalBook, targetedStatus);
    var targetedShelf = "available for lending !";
    if (targetedStatus == "0") {targetedShelf = "unavailable for lending !"}
    if (targetedStatus == "2") {targetedShelf = "declared as lent !"}
    dhtmlx.message({type:"dhtmlxsucess", text:"This book is now "+targetedShelf, expire: 1000});
  }
    Session.set('targetedStatus',"no move")

    //event.relatedTarget.textContent = 'Dropped';
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});

//////////////////////// Fin fonctions INTERACT //////////////////////////////////

Template.lend.events({
  'click': function(event){
   // on vient créer une variable classDoc dans laquelle on rentre les class de l'objet qui vient d'être cliqué !
    var classDoc = event.target.classList;
          //si on a cliqué sur une image dont la class est "thum-books", alors on affiche l'explication
      if (classDoc == "thumb-books")
     {
  var currentUserId = Meteor.userId();
      // si on clique sur un livre de sa bibliothèque, la fonction met l'ID du livre de la DB informationBooks dans la variable selectedPhysicalBook (afin que celui ci soit affiché)
    var selectedBook = this._id;
    // on remonte ensuite sur la DB PHYSICAL_BOOKS pour récupérer l'ID dans cette collection
    var selectedPhysicalBook = PHYSICAL_BOOKS.findOne({bookOwner:currentUserId, bookRef:selectedBook});
    Session.set('selectedPhysicalBook', selectedPhysicalBook._id);
     }
     else
     {
      //si on a pas cliqué sur une image alors l'explication sur le livre disparait !
    Session.set('selectedPhysicalBook', "");

     } 
    }
})


// Fonctions events sur le template displaySelectedBook
Template.displaySelectedBook.events({
// Quand on clique sur un item avec la class erasebook (en ce moment : lorsqu'on clique sur le bouton remove sur le template displaySelectedBook)
'click .erase-book' : function(){
    // on récupère l'ID du livre grâce au sessionget selectedPhysicalBook qui change lorsque quelqu'un clique sur un livre.
    var selectedPhysicalBook_Id = Session.get('selectedPhysicalBook');
    // Affichage d'une fenetre de confirmation de la supression effective du livre.
    dhtmlx.message({
    type:"confirm",
    text: "Delete this book from your library?",
    callback: function() {
      // Si l'utilisateur clique sur ok, affichage d'un message
    dhtmlx.message({ type:"error", text:"This book has been removed from your library", expire: 1500}); 
    // Si l'utilisateur clique sur ok, appel Meteor call vers la fonction pour supprimer le bouquin de la liste
    Meteor.call('removeBook', selectedPhysicalBook_Id);
  }
});
    }
});

// Fonctions helpers sur le template displaySelectedBook
Template.displaySelectedBook.helpers({
 'mySelectedBook': function(){  
  // Récupère l'ID du livre actuellement sélectionné (sur lequel on a cliqué)
  var selectedPhysicalBook = Session.get('selectedPhysicalBook');
  // renvoie toutes les infos sur le livre
  if (selectedPhysicalBook != "")
  {
  var selectedBookRef;
  selectedBookRef = PHYSICAL_BOOKS.findOne({_id:selectedPhysicalBook});
  return BOOKS_INFOS.findOne({_id:selectedBookRef.bookRef});
  }
  }
/*
 'showSelectedBook': function()
  {    
  // renvoit l'ID du livre actuellement sélectionné (FONCTION EN DOUBLE ?)
  var selectedPhysicalBook = Session.get('selectedPhysicalBook');
  return selectedPhysicalBook;
  }
  */
});

// Fonctions events sur le template displaySearchGoogleBooks
Template.displaySearchGoogleBooks.events({ 
  // clique sur class add-this-book (c'est à dire sur la photo d'un livre searchGoogleBooks ou sur le boutton ajouter)
 'click .add-this-book': function(){
  // on récupèere les infos de ce sur quoi on a cliqué
  var selectedBookFromGSearch = this;
  // On appelle côté serveur pour ajouter le livre. On envoie toutes les infos et on indique que le livre est actuellement disponible
  Meteor.call(
    //dans le meteor call on envoie une fonction pour qu'il nous revienne une erreur si le livre existe déjà dans la biblio
    'InsertBook',selectedBookFromGSearch.ISBN,selectedBookFromGSearch.title,selectedBookFromGSearch.authors,selectedBookFromGSearch.publisher,"1",selectedBookFromGSearch.snippet,selectedBookFromGSearch.thumb,
    function(error, result)
    {
    if (error) {dhtmlx.message({type:"error", text:"Error", expire: 2000});}
    // Si validation de l'opération, book ajouté
    if (result == "oui") {dhtmlx.message({type:"dhtmlxsucess", text:"This book has been added to your library", expire: 1500});
    // permet de remettre la recherche à zéro, les résultats de la searchGoogleBooks s'efface pour ne pas qu'il restenet à l'écran alors que la recherche a été fructueuse...
  Session.set('actualGoogleBooksSearch', false);}
    // sinon, erreur déjà dans biblio, affichage message avec DHTMLX et rien ne se passe cçoté serveur
    if (result == "error") {dhtmlx.message({type:"error", text:"This book is already in your library", expire: 2000});}
  }
  );
  
  }
});


// Fonctions events sur le template displayMyPhysicalBooks
Template.displayMyPhysicalBooks.events({
   
    });

// Fonctions helpers sur le template displayMyPhysicalBooks
  Template.displayMyPhysicalBooks.helpers({
    // Fonctions pour aller chercher les infos des 3 parties de la bibliothèques. Trié par titre et date de publication
  'myPrivateBooks': function(){ 
    var currentUserId = Meteor.userId();
  // Créé un tableau dans lequel on vient renseigner tous les bookRef des livres détenus dans la biblio en statut 1
  var differentBooks = [];
  PHYSICAL_BOOKS.find({bookOwner:currentUserId, status:"0"}).forEach(function(element) {differentBooks.push(element.bookRef);});
  // renvoi les infos des livres dont les id sont contenus dans le tableau précédent
    return BOOKS_INFOS.find({_id:{ $in:differentBooks}});
  },


  'myPublicBooks': function(){ 
  var currentUserId = Meteor.userId();
  // Créé un tableau dans lequel on vient renseigner tous les bookRef des livres détenus dans la biblio en statut 1
  var differentBooks = [];
  PHYSICAL_BOOKS.find({bookOwner:currentUserId, status:"1"}).forEach(function(element) {differentBooks.push(element.bookRef);});
  // renvoi les infos des livres dont les id sont contenus dans le tableau précédent
    return BOOKS_INFOS.find({_id:{ $in:differentBooks}});
  },

  'myLentBooks': function(){ 
      var currentUserId = Meteor.userId();
  // Créé un tableau dans lequel on vient renseigner tous les bookRef des livres détenus dans la biblio en statut 1
  var differentBooks = [];
  PHYSICAL_BOOKS.find({bookOwner:currentUserId, status:"2"}).forEach(function(element) {differentBooks.push(element.bookRef);});
  // renvoi les infos des livres dont les id sont contenus dans le tableau précédent
    return BOOKS_INFOS.find({_id:{ $in:differentBooks}});
  }

});
  

// Fonctions helpers sur le template bookimage
Template.bookimage.helpers({
imageOrNot: function() {
  // fonction interrogée pour savoir si le livre en question a une image propre ou une image par défaut type (pas d,image available)
    if (this.thumb == "/na.png")
      {return false;}
    else
      {return true;}
  }
});


// Fonctions events sur le template searchGoogleBooks
Template.searchGoogleBooks.events({ 
  'submit form': function(event, template) {
    event.preventDefault();
    // met la variable à true pour afficher les résultats
    Session.set('actualGoogleBooksSearch', true);
    // lance la recherhce sur SearchGoogleBooks côté serveur
    var query = template.$('input[type=text]').val();
    if (query)
      Session.set('query', query);
  }
  });


// Fonctions helpers sur le template searchGoogleBooks
Template.searchGoogleBooks.helpers({  
  // Afficher les résultats de la recherche Gbooks
  GOOGLE_BOOKS_SEARCHFind: function() {
    return GOOGLE_BOOKS_SEARCH.find();
  },
  //Afficher la variable Searching or not
  searching: function() {
    return Session.get('searching');
  },
  // Fonction pour savoir s'il y a un recherche actuellement affichée sur l'écran
  actualGoogleBooksSearch: function() {
  return Session.get('actualGoogleBooksSearch');
  }
  
});

}


// Côté serveur

if (Meteor.isServer) {
// je ne sais pas...
 var ChildProcess = Npm.require('child_process').exec;


// fonction publish qui renvoit les informations sur la détention en livre d'un utilisateur
  Meteor.publish('myPhysicalBooks',function(){
    var currentUserId = this.userId;
    return PHYSICAL_BOOKS.find({bookOwner: currentUserId});
  });

// fonction publish qui renvoit les infos sur tous les livres enregistrés sur le site.
  Meteor.publish('allBooksInformation',function(){
    return BOOKS_INFOS.find();
  });

  Meteor.methods({
    // POur insérer un livre dans la collection BOOK
  'InsertBook': function(ISBN,title,authors,publisher,status,snippet,thumb,error){
  // var pour l'id de l'utiisateur
  var currentUserId = this.userId;
  // variable ou est stocké l'id unique du livre de la DBMongo BOOKS_INFOS
  var bookRef;
     //VOIR ENSUITE POUR ACTUALISER LES INFORMATIONS ISSUES DE GBOOKS !!! V2
    // VOIR ENSUITE SI ON PEUT VALIDER L'ISBN + FIABLEMENT !!! V2

//PARTIE 1
      //var pour voir si le bouquin est déjà référencé dans la base de données
  var isThisBookAlreadyInTheDatabase = BOOKS_INFOS.find({ISBN: ISBN}).count();
  if (isThisBookAlreadyInTheDatabase == 0) {
    //Si aucun document ne ressort alors on le créé
  // le callback permet de récupérer l'id lorsque l'insertion a réussi
    bookRef = BOOKS_INFOS.insert({
    ISBN: ISBN,
    authors: authors,
    title: title,
    publisher: publisher,    
    snippet:snippet,
    thumb:thumb
    });
  }
  else
  {
    // SInon, on renvoit l'_id du bouquin unique de la base de données pour les fonctions suivantes
    bookRef = BOOKS_INFOS.findOne({ISBN:ISBN})._id;
  }


//PARTIE 2
  // Met dans une variable le nombre de livre qui comporte le même ISBN et qui est dans la librairie de la personne connectée (est ce que le livre est en double)
  var isThisABookAlreadyInTheLibrary = PHYSICAL_BOOKS.find({bookOwner: currentUserId,bookRef: bookRef}).count();
  // Si pas de livre identique dans la biblio de l'utilisateur
  if (isThisABookAlreadyInTheLibrary == 0) {
// Ajoute une nouvelle entrée dans la base de données PHYSICAL_BOOKS pour indiquer que cet utilisateur possède un exemplaire de ce livre portant cet ISBN la. Le statut de base donné est ladisponbile.
    PHYSICAL_BOOKS.insert({
    bookRef: bookRef,
    bookOwner: currentUserId,
    publicationDate: new Date(),
    status: status
    });
    return "oui";
    }
  else {
  return "error";

  }

  },

  'removeBook': function(selectedBook_Id){
    //suppression d'un livre de la bibliothèque
  PHYSICAL_BOOKS.remove(selectedBook_Id);
  },

  'statusChange': function(selectedPhysicalBook,targetedStatus){
// Fonction utilisée par le drag and drop pour changer le statut du livre (1 = available, 0 = private, 2 = lent)
  PHYSICAL_BOOKS.update(selectedPhysicalBook, {$set: {status: targetedStatus}});
  },

});

 Meteor.publish('GOOGLE_BOOKS_SEARCH', function(query) {  
  // FONCTION DE RECHERCHE DANS L'API GOOGLE BOOKS
  var self = this;
  try {
    // FONCTION HTTP.GET
    var response = HTTP.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        // recherche en francais
        langRestrict:"fr",
        // 15 résultats ressortent à chaque fois
        maxResults:15
      }
    });

    _.each(response.data.items, function(item) {
      // si il y a bien une image sur le livre
      if (item.volumeInfo.imageLinks != undefined)
      {
      var doc = {
        thumb: item.volumeInfo.imageLinks.smallThumbnail,
        authors: item.volumeInfo.authors,
        title: item.volumeInfo.title,
        averageRating: item.volumeInfo.averageRating,
        publisher: item.volumeInfo.publisher,
        ISBN: item.volumeInfo.industryIdentifiers,
        snippet: item.searchInfo && item.searchInfo.textSnippet
      };
      // ajoute à la collection Gbooks.
      self.added('GBooks', Random.id(), doc);
    }

    // S'il n'y a pas d'image sur Google Books, alors, j'utilise une image stockée localement (fond gris avec écrit image unavailable...)
    else
      {
      var doc = {
        thumb: "/na.png",
        authors: item.volumeInfo.authors,
        title: item.volumeInfo.title,
        averageRating: item.volumeInfo.averageRating,
        publisher: item.volumeInfo.publisher,
        ISBN: item.volumeInfo.industryIdentifiers,
        snippet: item.searchInfo && item.searchInfo.textSnippet
      };
      
      self.added('GBooks', Random.id(), doc);
    }


    });

    self.ready();

  } catch(error) {
    console.log(error);
  }
});


}