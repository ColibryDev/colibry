// Configuration du routeur iron:router, chaque page doit être mentionnée ici ! grâce à Router.route
Router.configure({
	
	notFoundTemplate: 'notFound'
});

// LANCE L'API GOOGLE MAPS (LA CLÉ EST CACHÉE, lors du deploy, mettre la clé (essai gratuit)
//Lance seulement sur 2 pages nécessaires...
// Clé Google Maps API : AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE
// Colibry, autorisation pour colibry.meteor.com
Router.onBeforeAction(function() {
  GoogleMaps.load({ v: '3', 
//key: 'AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE', 
	libraries: 'geometry,places' });
 this.next();
}, { only: ['borrow', 'suggestions','profilepage'] });

// Fonction iron:router pour indiquer que sur n'importe quelle page (excepté Lend), si l'utilisateur n'est pas connecté à son compte, iron:router le renvoie vers la page de login
Router.onBeforeAction(function(){
    var currentUser = Meteor.userId();
    if(currentUser){
        this.next();
    } else {
        this.render("loginregister");
    }
}, {
    only: ['lend', 'profilepage','suggestions','mailbox']
});

Router.route('/', function(){
    this.render('bienvenue');
    this.layout(false);}, {name: 'bienvenue'}
    );
Router.route('/welcome');
Router.route('/lend',{layoutTemplate: 'main'});
Router.route('/loginregister',{layoutTemplate: 'main'});
Router.route('/borrow',{layoutTemplate: 'main'});
Router.route('/profilepage',{layoutTemplate: 'main'});
Router.route('/suggestions',{layoutTemplate: 'main'});
Router.route('/mailbox',{layoutTemplate: 'main'});
Router.route('/mailbox/:_id', {
    layoutTemplate: 'main',
    template: 'chat',
    data: function(){
        var currentChat = this.params._id;
        return CHAT.findOne({ _id: currentChat });
    }
});


if (Meteor.isClient) {

}
