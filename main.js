if (Meteor.isClient) {




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