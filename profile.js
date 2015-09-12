
if (Meteor.isClient) {
Meteor.subscribe('images');


	Template.infoProfile.helpers({
		// Options de connexion a l'API GOOGLE, ici on pourra jouer sur le country. Pour les autres options, regarder les données du package ou de l'API GOOGLE
  optsGoogleplace: function() {
    return {
       type: 'googleUI',
       stopTimeoutOnKeyup: false,
       googleOptions: {
         componentRestrictions: { country:'ca' }
       }
    }
  }
});

	Template.photoProfile.helpers({
	getProfilePic: function () {
	var currentUser = Meteor.user();
	var profilePicId = currentUser.profile.pic;
    return IMAGES.findOne({_id:profilePicId}); // Where Images is an FS.Collection instance
  }
});

}



if (Meteor.isServer) {
}
