
if (Meteor.isClient) {
Meteor.subscribe('images');


	Template.profile.helpers({
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
}



if (Meteor.isServer) {

}