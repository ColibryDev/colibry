// Collection GOOGLE_BOOKS_SEARCH pour stocker provisoirement les query HTTP sur Google Books
// Collection BOOKS_INFOS pour stocker les infos par livre unique = ISBN unique
// Collection PHYSICAL_BOOKS pour stocker l'information de la détention d'un livre unique physique
BOOKS_INFOS = new Mongo.Collection('allBooksInformation');

PHYSICAL_BOOKS = new Mongo.Collection('myPhysicalBooks');

GOOGLE_BOOKS_SEARCH = new Mongo.Collection('GBooks');
// Création d'une collection d'images FS
IMAGES = new FS.Collection(
  "images", {stores: [new FS.Store.GridFS("images", {})]
  });


// Configuration du routeur iron:router, chaque page doit être mentionnée ici ! grâce à Router.route
Router.configure({layoutTemplate: 'main'});

// LANCE L'API GOOGLE MAPS (LA CLÉ EST CACHÉE, lors du deploy, mettre la clé (essai gratuit)
//Lance seulement sur 2 pages nécessaires...
// Clé Google Maps API : AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE
// Colibry, autorisation pour colibry.meteor.com
Router.onBeforeAction(function() {
  GoogleMaps.load({ v: '3', 
//key: 'AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE', 
	libraries: 'geometry,places' });
 this.next();
}, { only: ['borrow', 'profilepage'] });

// Fonction iron:router pour indiquer que sur n'importe quelle page (excepté Lend), si l'utilisateur n'est pas connecté à son compte, iron:router le renvoie vers la page de login
Router.onBeforeAction(function(){
    var currentUser = Meteor.userId();
    if(currentUser){
        this.next();
    } else {
        this.render("loginregister");
    }
}, {
    only: ['lend', 'profilepage']
});

Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/loginregister');
Router.route('/borrow');
Router.route('/profilepage');





if (Meteor.isClient) {

}

if (Meteor.isServer) {
	//autorise l'envoi de mails...
process.env.MAIL_URL="smtp://thecolibry%40gmail.com:Plouf123*@smtp.gmail.com:465/";


Meteor.publish('images',function(){
    var currentUserId = this.userId;
    return IMAGES.find({owner: currentUserId});
  });


IMAGES.allow({
  'insert': function (userId, doc) {
    // add custom authentication code here
    return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
  return true;
  },
  'download': function (userId) {
    // add custom authentication code here
    return true;
}
});
}