
if (Meteor.isClient) {
// Fonction lorsqu'on clique sur le bouton register pour enregistrer un nouvel utilisateur //
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
      // Messages d'alerte gérés par DHTMLX (voir fonction sur internet)
      dhtmlx.alert({
        title:"Registration error",
        type:"alert-warning",
        text:error.reason
    });
    } else {
     Router.go("lend"); // Redirect user if registration succeed
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
}




// Côté serveur

if (Meteor.isServer) {

}