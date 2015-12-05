if (Meteor.isClient) {

Template.main.rendered = function(){

    // Add special class for handel top navigation layout
    $('body').addClass('top-navigation navbar-fixed-top navbar-scroll');

}

Template.main.destroyed = function(){

    // Remove special top navigation class
    $('body').removeClass('top-navigation navbar-fixed-top navbar-scroll');
};

// Puisque Meteor ne peut pas attribuer de class au tag body, il fayt le faire côté JS
Meteor.startup(function() {
 //  $('body').attr('class', 'fixed-nav top-navigation');
});


//Fonction lorsqu'on clique sur logout, cela logout l'utilisateur, le renvoit vers la page login et lui affiche un message à travers DHTMLX pour lui dire qu'il est à présent déconnecté
Template.navBar.events({
    'click .logout': function(event){
        event.preventDefault();
        dhtmlx.message({ type:"error", text:"You logged out", expire: 1500}); 
        AccountsTemplates.logout();
        Router.go('loginregister');
        Session.set('selectedPhysicalBook', "");

    }
});

Template.navBar.helpers({
	getProfilePic: function () {
	var currentUser = Meteor.user();
	var profilePicId = currentUser.profile.pic;
    return IMAGES.findOne({_id:profilePicId}); // Where Images is an FS.Collection instance
  }
});


}
if (Meteor.isServer) {
}