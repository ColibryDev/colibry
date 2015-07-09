BOOKS = new Mongo.Collection('AllBooks');
GBOOKS = new Mongo.Collection('GBooks');

Router.configure({layoutTemplate: 'main'});
Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/register');
Router.route('/login');
Router.route('/borrow');
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
  Session.setDefault('Abookhasjustbeenadded', "non");
  Session.setDefault('ActualGSearch', false);

  Tracker.autorun(function() {  
  if (Session.get('query')) {
    var searchHandle = Meteor.subscribe('booksSearch', Session.get('query'));
    Session.set('searching', ! searchHandle.ready());
  }
  });


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
        var alert = window.alert(error.reason);
        console.log(error.reason); // Output error if registration fails
    } else {
        Router.go("lend"); // Redirect user if registration succeeds
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
    if(error){
        var alert = window.alert(error.reason);
        console.log(error.reason); // Output error when the login fails
    } else {
        Router.go("lend"); // Redirect user when login succeeds
    }
});
    }
});

Template.NavBar.events({
    'click .logout': function(event){
        event.preventDefault();
        Session.set('Abookhasjustbeenadded', "non");
        Meteor.logout();
        Router.go('login');
    }
});





Template.DisplaySelectedBook.events({
'click .EraseBook' : function(){
    var SelectedBook_Id = Session.get('selectedbook');
    var confirm = window.confirm("Delete this book from your library?");
    if(confirm){
    Session.set('Abookhasjustbeenadded',"removed");
    Meteor.call('RemoveBook', SelectedBook_Id);
    }
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
    Session.set('Abookhasjustbeenadded', "non");
    Session.set('selectedbook', selectedbook);
    },

    });

 
Template.Alert.events({
 'click .closealert':function(){
      Session.set('Abookhasjustbeenadded', "non");
  }
});

Template.Alert.helpers({
Hasabookbeenadded: function(statut) {
    return statut === Session.get('Abookhasjustbeenadded');
  }
});

Template.GSearch.events({ 
  'submit form': function(event, template) {
    event.preventDefault();
    Session.set('ActualGSearch', true);
    var query = template.$('input[type=text]').val();
    if (query)
      Session.set('query', query);

  },

 'click .Addthisbook': function(){
  var selectedGBook = this;
  Meteor.call('InsertBook', selectedGBook.ISBN, selectedGBook.title, selectedGBook.authors, selectedGBook.publisher, "1", selectedGBook.snippet,selectedGBook.thumb, function(error, result){Session.set('Abookhasjustbeenadded', result);});
  Session.set('ActualGSearch', false);
  }
  

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
  
  ////////////////////A REMETTRE ////// 
 //var interact = Meteor.npmRequire("interact.js");
  //
  
//});

  Meteor.publish('theBooks',function(){
    var currentUserId = this.userId;
    return BOOKS.find({BookOwner: currentUserId}, {sort: {PublicationDate: 1}})
  });

  Meteor.methods({
  'InsertBook': function(ISBN,Title,Authors,Publisher,Statut,Snippet,thumb,error){
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
    thumb:thumb
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
      var doc = {
        thumb: item.volumeInfo.imageLinks.smallThumbnail,
        authors: item.volumeInfo.authors,
        title: item.volumeInfo.title,
        averageRating: item.volumeInfo.averageRating,
        publisher: item.volumeInfo.publisher,
        ISBN: item.volumeInfo.industryIdentifiers,
        snippet: item.searchInfo && item.searchInfo.textSnippet
      };

      self.added('GBooks', Random.id(), doc);
    });

    self.ready();

  } catch(error) {
    console.log(error);
  }
});

  
  

}