BOOKS = new Mongo.Collection('AllBooks');
GBOOKS = new Mongo.Collection('GBooks');

Router.configure({layoutTemplate: 'main'});
Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/register');
Router.route('/login');
Router.route('/borrow');
Router.route('/profile');

Router.onBeforeAction(function(){
    var currentUser = Meteor.userId();
    if(currentUser){
        this.next();
    } else {
        this.render("login");
    }
}, {
    only: "lend"
});



if (Meteor.isClient) {
  Meteor.subscribe('theBooks');
  Session.setDefault('searching', false);
  Session.setDefault('ActualGSearch', false);
  Session.setDefault('statutcible', "no move");



  Tracker.autorun(function() {  
  if (Session.get('query')) {
    var searchHandle = Meteor.subscribe('booksSearch', Session.get('query'));
    Session.set('searching', ! searchHandle.ready());
  }
  });





//////////INTERACT ////////////////////
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

//////////INTERACT ////////////////////







Template.register.events({
    'submit form': function(event){
        event.preventDefault();
        var email = event.target.email.value;
        var password = event.target.password.value;
        Accounts.createUser({
        email: email,
    password: password
    }, function(error){
    if(error){
      dhtmlx.alert({
        title:"Registration error",
        type:"alert-warning",
        text:error.reason
    });
    } else {
     Router.go("lend"); // Redirect user if registration succeeds
     //var currentUserId = Meteor.userId();
     //Meteor.call('NewProfile', currentUserId, email)
    }
});
    }
});

Template.login.events({
    'submit form': function(event){
        event.preventDefault();
        var email = event.target.email.value;
        var password = event.target.password.value;
        Meteor.loginWithPassword(email, password, function(error){
    
//Accounts.loginWithPassword, Accounts.loginWithFacebook, Accounts.createUser and Accounts.forgotPassword 
    if(error){
        dhtmlx.alert({
        title:"Login error",
        type:"alert-warning",
        text:error.reason
    });// Output error when the login fails
    } else {
        Router.go("lend"); // Redirect user when login succeeds
    }
});
    }
});

Template.NavBar.events({
    'click .logout': function(event){
        event.preventDefault();
        dhtmlx.message({ type:"error", text:"You logged out", expire: 1500}); 
        Meteor.logout();
        Router.go('login');
    }
});





Template.DisplaySelectedBook.events({
'click .EraseBook' : function(){
    var SelectedBook_Id = Session.get('selectedbook');
    dhtmlx.message({
    type:"confirm",
    text: "Delete this book from your library?",
    callback: function() {
    dhtmlx.message({ type:"error", text:"This book has been removed from your library", expire: 1500}); 
    Meteor.call('RemoveBook', SelectedBook_Id);
  }
});
    }
});



Template.DisplaySelectedBook.helpers({
 'MySelectedBook': function(){  
  var selectedbook = Session.get('selectedbook');
  return BOOKS.find({_id:selectedbook})
  },

 'showselectedbook': function()
  {    
  //var actualbook = this._id;
  var selectedbook = Session.get('selectedbook');
  return selectedbook;
  //if (selectedbook == actualbook){return true} else {return false}
  }
});

  Template.DisplayBooks.helpers({
  'MyPrivateBooks': function(){  return BOOKS.find({Statut:"0"}, {sort: {Title:1,PublicationDate:1}})},
  'MyPublicBooks': function(){  return BOOKS.find({Statut:"1"}, {sort: {Title:1,PublicationDate:1}})},
  'MyLendedBooks': function(){  return BOOKS.find({Statut:"2"}, {sort: {Title:1,PublicationDate:1}})}
  });
  
  Template.DisplayBooks.events({
    'click .ThumbBooks': function(){
    var selectedbook = this._id;
    Session.set('selectedbook', selectedbook);
    },

    });


Template.bookimage.helpers({
Imageornot: function() {
    if (this.Thumb == "/na.png")
      {return false;}
    else
      {return true;}
  }
});

Template.GSearch.events({ 
  'submit form': function(event, template) {
    event.preventDefault();
    Session.set('ActualGSearch', true);
    var query = template.$('input[type=text]').val();
    if (query)
      Session.set('query', query);

  }
  });

Template.DisplaySearchGbook.events({ 
 'click .Addthisbook': function(){
  var selectedGBook = this;
  Meteor.call(
    'InsertBook',selectedGBook.ISBN,selectedGBook.Title,selectedGBook.Authors,selectedGBook.Publisher,"1",selectedGBook.Snippet,selectedGBook.Thumb,
    function(error, result)
    {
    if (error) {dhtmlx.message({type:"error", text:"Error", expire: 2000});}
    if (result == "oui") {dhtmlx.message({type:"dhtmlxsucess", text:"This book has been added to your library", expire: 1500});}
    if (result == "error") {dhtmlx.message({type:"error", text:"This book is already in your library", expire: 2000});}
  }
  );
  
  Session.set('ActualGSearch', false);
  }
});

Template.DisplaySearchGbook.helpers({ 
  });

Template.GSearch.helpers({  
  GBOOKSFIND: function() {
    return GBOOKS.find();
  },
  searching: function() {
    return Session.get('searching');
  },
  ActualGSearch: function() {
  return Session.get('ActualGSearch');
  }
  
});

}
if (Meteor.isServer) {
  var ChildProcess = Npm.require('child_process').exec;

  Meteor.publish('theBooks',function(){
    var currentUserId = this.userId;
    return BOOKS.find({BookOwner: currentUserId}, {sort: {PublicationDate: 1}})
  });


  Meteor.methods({
  'InsertBook': function(ISBN,Title,Authors,Publisher,Statut,Snippet,Thumb,error){
  var currentUserId = Meteor.userId();
  var Isthisbookalreadyinthelibrary = BOOKS.find({BookOwner: currentUserId,ISBN: ISBN}).count();
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
  //Session.set('Abookhasjustbeenadded', "error");

  }

  },

  'RemoveBook': function(SelectedBook_Id){
  BOOKS.remove(SelectedBook_Id);
  },

  'ChangeStatut': function(selectedbook,statutcible){
  BOOKS.update(selectedbook, {$set: {Statut: statutcible}});
  },

  'NewProfile' : function(currentUserId, email) {
  PROFILES.insert({_id: currentUserId, mail:email});
  }
    // BOOKS.insert({ISBN: 9780545010221,Title:"Harry Potter and the Deathly Hallows",BookOwner:"12345",PublicationDate:42181,statut:0})
});

 Meteor.publish('booksSearch', function(query) {  
  var self = this;
  try {
    var response = HTTP.get('https://www.googleapis.com/books/v1/volumes', {
      params: {
        q: query,
        langRestrict:"fr",
        maxResults:15
      }
    });

    _.each(response.data.items, function(item) {
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
      
      self.added('GBooks', Random.id(), doc);
    }

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