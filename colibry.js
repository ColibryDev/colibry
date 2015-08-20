// Collection GOOGLE_BOOKS_SEARCH pour stocker provisoirement les query HTTP sur Google Books
// Collection BOOKS_INFOS pour stocker les infos par livre unique = ISBN unique
// Collection PHYSICAL_BOOKS pour stocker l'information de la détention d'un livre unique physique
BOOKS_INFOS = new Mongo.Collection('allBooksInformation');
PHYSICAL_BOOKS = new Mongo.Collection('myPhysicalBooks');
GOOGLE_BOOKS_SEARCH = new Mongo.Collection('GBooks');

// Configuration du routeur iron:router, chaque page doit être mentionnée ici ! grâce à Router.route
Router.configure({layoutTemplate: 'main'});
Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/loginregister');
Router.route('/borrow');
Router.route('/profile');

// Fonction iron:router pour indiquer que sur n'importe quelle page (excepté Lend), si l'utilisateur n'est pas connecté à son compte, iron:router le renvoie vers la page de login
Router.onBeforeAction(function(){
    var currentUser = Meteor.userId();
    if(currentUser){
        this.next();
    } else {
        this.render("loginregister");
    }
}, {
    only: "lend"
});



if (Meteor.isClient) {
 
}

if (Meteor.isServer) {
	//autorise l'envoi de mails...
process.env.MAIL_URL="smtp://thecolibry%40gmail.com:Plouf123*@smtp.gmail.com:465/";

}