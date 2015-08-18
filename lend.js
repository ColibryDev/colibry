
if (Meteor.isClient) {
  // Suscribe collection BOOKS : tous les livres de l'utilisateur actuel
    Meteor.subscribe('theBooks');


  Session.setDefault('searching', false);
  Session.setDefault('ActualGSearch', false);
  Session.setDefault('statutcible', "no move");

  // fonction liée à la reserche sur l'API Google Books
  Tracker.autorun(function() {  
  if (Session.get('query')) {
    var searchHandle = Meteor.subscribe('booksSearch', Session.get('query'));
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
   statutcible = dropzoneElement.id;

    Session.set('statutcible',statutcible);
    console.log(statutcible);

    var draggableElement = event.relatedTarget;
    event.target.classList.remove('drop-target');
    event.relatedTarget.classList.remove('can-drop');
   // event.relatedTarget.textContent = 'Dragged out';


  },
  ondrop: function (event) {
    // LORSQU'ON LACHE L'ITEM
 
    // Change le statut du livre
   var selectedbook = Session.get('selectedbook');
   var statutcible = Session.get('statutcible');

   //On peut passer de la 3eme section à la première.
   //effet visuel zab. Il revient toujours à sa place.
    //Que faire quand on ne le change pas de place ?

   if (statutcible == "no move") {}
    else {
    Meteor.call('ChangeStatut', selectedbook, statutcible);
    var Etagerecible = "available for lending !";
    if (statutcible == "0") {Etagerecible = "unavailable for lending !"}
    if (statutcible == "2") {Etagerecible = "declared as lent !"}
    dhtmlx.message({type:"dhtmlxsucess", text:"This book is now "+Etagerecible, expire: 1000});
  }
    Session.set('statutcible',"no move")

    //event.relatedTarget.textContent = 'Dropped';
  },
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('drop-target');
  }
});

//////////////////////// Fin fonctions INTERACT //////////////////////////////////



// Fonctions events sur le template DisplaySelectedBook
Template.DisplaySelectedBook.events({
// Quand on clique sur un item avec la class erasebook (en ce moment : lorsqu'on clique sur le bouton remove sur le template DisplaySelectedBook)
'click .EraseBook' : function(){
    // on récupère l'ID du livre grâce au sessionget selectedbook qui change lorsque quelqu'un clique sur un livre.
    var SelectedBook_Id = Session.get('selectedbook');
    // Affichage d'une fenetre de confirmation de la supression effective du livre.
    dhtmlx.message({
    type:"confirm",
    text: "Delete this book from your library?",
    callback: function() {
      // Si l'utilisateur clique sur ok, affichage d'un message
    dhtmlx.message({ type:"error", text:"This book has been removed from your library", expire: 1500}); 
    // Si l'utilisateur clique sur ok, appel Meteor call vers la fonction pour supprimer le bouquin de la liste
    Meteor.call('RemoveBook', SelectedBook_Id);
  }
});
    }
});

// Fonctions helpers sur le template DisplaySelectedBook
Template.DisplaySelectedBook.helpers({
 'MySelectedBook': function(){  
  // Récupère l'ID du livre actuellement sélectionné (sur lequel on a cliqué)
  var selectedbook = Session.get('selectedbook');
  // renvoie toutes les infos sur le livre
  return BOOKS.find({_id:selectedbook})
  },

 'showselectedbook': function()
  {    
  // renvoit l'ID du livre actuellement sélectionné (FONCTION EN DOUBLE ?)
  var selectedbook = Session.get('selectedbook');
  return selectedbook;
  //if (selectedbook == actualbook){return true} else {return false}
  }
});

// Fonctions events sur le template DisplayGbook
Template.DisplaySearchGbook.events({ 
  // clique sur class Addthisbook (c'est à dire sur la photo d'un livre GSearch ou sur le boutton ajouter)
 'click .Addthisbook': function(){
  // on récupèere les infos de ce sur quoi on a cliqué
  var selectedGBook = this;
  // On appelle côté serveur pour ajouter le livre. On envoie toutes les infos et on indique que le livre est actuellement disponible
  Meteor.call(
    //dans le meteor call on envoie une fonction pour qu'il nous revienne une erreur si le livre existe déjà dans la biblio
    'InsertBook',selectedGBook.ISBN,selectedGBook.Title,selectedGBook.Authors,selectedGBook.Publisher,"1",selectedGBook.Snippet,selectedGBook.Thumb,
    function(error, result)
    {
    if (error) {dhtmlx.message({type:"error", text:"Error", expire: 2000});}
    // Si validation de l'opération, book ajouté
    if (result == "oui") {dhtmlx.message({type:"dhtmlxsucess", text:"This book has been added to your library", expire: 1500});
    // permet de remettre la recherche à zéro, les résultats de la GSearch s'efface pour ne pas qu'il restenet à l'écran alors que la recherche a été fructueuse...
  Session.set('ActualGSearch', false);}
    // sinon, erreur déjà dans biblio, affichage message avec DHTMLX et rien ne se passe cçoté serveur
    if (result == "error") {dhtmlx.message({type:"error", text:"This book is already in your library", expire: 2000});}
  }
  );
  
  }
});


// Fonctions events sur le template DisplayBooks
Template.DisplayBooks.events({
    'click .ThumbBooks': function(){
      // si on clique sur un livre de sa bibliothèque, la fonction met l'ID du livre dans la cariable selectedbook (afin que celui ci soit affiché)
    var selectedbook = this._id;
    Session.set('selectedbook', selectedbook);
    },

    });

// Fonctions helpers sur le template DisplayBooks
  Template.DisplayBooks.helpers({
    // Fonctions pour aller chercher les infos des 3 parties de la bibliothèques. Trié par titre et date de publication
  'MyPrivateBooks': function(){ 
        var currentUserId = Meteor.userId();
   return BOOKS.find({BookOwner:currentUserId , Statut:"0"}, {sort: {Title:1,PublicationDate:1}});},
  'MyPublicBooks': function(){ 
          var currentUserId = Meteor.userId();
 return BOOKS.find({BookOwner:currentUserId, Statut:"1"}, {sort: {Title:1,PublicationDate:1}});},
  'MyLendedBooks': function(){ 
            var currentUserId = Meteor.userId();
 return BOOKS.find({BookOwner:currentUserId, Statut:"2"}, {sort: {Title:1,PublicationDate:1}});}
  });
  

// Fonctions helpers sur le template bookimage
Template.bookimage.helpers({
Imageornot: function() {
  // fonction interrogée pour savoir si le livre en question a une image propre ou une image par défaut type (pas d,image available)
    if (this.Thumb == "/na.png")
      {return false;}
    else
      {return true;}
  }
});


// Fonctions events sur le template GSearch
Template.GSearch.events({ 
  'submit form': function(event, template) {
    event.preventDefault();
    // met la variable à true pour afficher les résultats
    Session.set('ActualGSearch', true);
    // lance la recherhce sur GSEARCH côté serveur
    var query = template.$('input[type=text]').val();
    if (query)
      Session.set('query', query);
  }
  });


// Fonctions helpers sur le template GSearch
Template.GSearch.helpers({  
  // Afficher les résultats de la recherche Gbooks
  GBOOKSFIND: function() {
    return GBOOKS.find();
  },
  //Afficher la variable Searching or not
  searching: function() {
    return Session.get('searching');
  },
  // Fonction pour savoir s'il y a un recherche actuellement affichée sur l'écran
  ActualGSearch: function() {
  return Session.get('ActualGSearch');
  }
  
});

}













// Côté serveur

if (Meteor.isServer) {
// je ne sais pas...
 var ChildProcess = Npm.require('child_process').exec;


// fonction publish qui renvoit juste les livres de l'utilisateur actuellement connecté
  Meteor.publish('theBooks',function(){
    return BOOKS.find();
  });


  Meteor.methods({
    // POur insérer un livre dans la collection BOOK
  'InsertBook': function(ISBN,Title,Authors,Publisher,Statut,Snippet,Thumb,error){
  var currentUserId = Meteor.userId();
  // Met dans une variable le nombre de livre qui comporte le même ISBN et qui est dans la librairie de la personne connectée (est ce que le livre est en double)
  var Isthisbookalreadyinthelibrary = BOOKS.find({BookOwner: currentUserId,ISBN: ISBN}).count();
  // Si pas de livre identique dans la biblio de l'utilisateur
  if (Isthisbookalreadyinthelibrary == 0) {
    BOOKS.insert({
    ISBN: ISBN,
    Authors: Authors,
    Title: Title,
    Publisher: Publisher,
    BookOwner: currentUserId,
    PublicationDate: new Date(),
    Statut: Statut,
    Snippet:Snippet,
    Thumb:Thumb
    });
    return "oui";
    }
  else {
  return "error";

  }

  },

  'RemoveBook': function(SelectedBook_Id){
    //suppression d'un livre de la bibliothèque
  BOOKS.remove(SelectedBook_Id);
  },

  'ChangeStatut': function(selectedbook,statutcible){
// Fonction utilisée par le drag and drop pour changer le statut du livre (1 = available, 0 = private, 2 = lent)
  BOOKS.update(selectedbook, {$set: {Statut: statutcible}});
  },

});

 Meteor.publish('booksSearch', function(query) {  
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
        Thumb: item.volumeInfo.imageLinks.smallThumbnail,
        Authors: item.volumeInfo.authors,
        Title: item.volumeInfo.title,
        AverageRating: item.volumeInfo.averageRating,
        Publisher: item.volumeInfo.publisher,
        ISBN: item.volumeInfo.industryIdentifiers,
        Snippet: item.searchInfo && item.searchInfo.textSnippet
      };
      // ajoute à la collection Gbooks.
      self.added('GBooks', Random.id(), doc);
    }

    // S'il n'y a pas d'image sur Google Books, alors, j'utilise une image stockée localement (fond gris avec écrit image unavailable...)
    else
      {
      var doc = {
        Thumb: "/na.png",
        Authors: item.volumeInfo.authors,
        Title: item.volumeInfo.title,
        AverageRating: item.volumeInfo.averageRating,
        Publisher: item.volumeInfo.publisher,
        ISBN: item.volumeInfo.industryIdentifiers,
        Snippet: item.searchInfo && item.searchInfo.textSnippet
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