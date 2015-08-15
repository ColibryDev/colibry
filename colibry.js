// Collection GBOOKS pour stocker provisoirement les query HTTP sur Google Books
// Collection BOOKS pour stocker l'ensemble des livres ajoutés par les utilisateurs (scan ou ajouter à la main)
BOOKS = new Mongo.Collection('AllBooks');
GBOOKS = new Mongo.Collection('GBooks');

// Configuration du routeur iron:router, chaque page doit être mentionnée ici ! grâce à Router.route
Router.configure({layoutTemplate: 'main'});
Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/register');
Router.route('/login');
Router.route('/borrow');
Router.route('/profile');

// Fonction iron:router pour indiquer que sur n'importe quelle page (excepté Lend), si l'utilisateur n'est pas connecté à son compte, iron:router le renvoie vers la page de login
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


// 

if (Meteor.isClient) {
 
}

if (Meteor.isServer) {
 
}