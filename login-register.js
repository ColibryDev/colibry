

// On attache le schema à la collection meteor.users.
Meteor.users.attachSchema(Schema.User);



// on autorise l'update uniquement
Meteor.users.allow({
/*{
 insert: function(userId, doc){
  return doc && doc.userId === userId;
 },*/
  update: function(userId, doc){
    return doc && doc.userId === userId;
  }
})

/* client/validation/user.js */




// Utilisation d'un package accounts
// Redéfinition des informations voulues pour se connecter : email OU username

var pwd = AccountsTemplates.removeField('password');
AccountsTemplates.removeField('email');
AccountsTemplates.addFields([
  {
      _id: 'email',
      type: 'email',
      required: true,
      displayName: "email",
      re: /.+@(.+){2,}\.(.+){2,}/,
      errStr: 'Invalid email',
  },

  {
   _id: 'firstName',
    type: 'text',
    required: true,
    displayName: "First Name",
    re: /^[a-zA-Z-]{2,25}$/
},
 {
   _id: 'lastName',
    type: 'text',
    required: true,
    displayName: "Last Name",
    re: /^[a-zA-Z-]{2,25}$/
},
  
  pwd
]);

//définir ce qu'il se passe lorsque le signin ou le signup a fonctionné
var mySubmitFunc = function(error, state){
  if (!error) {
    if (state === "signIn") {
          Router.go('lend');

    }
    if (state === "signUp") {
                //Router.go('lend');

          Router.go('profilepage');
         // Session.set('updatingProfile', false);

    }
  }
};


AccountsTemplates.configure({
    onSubmitHook: mySubmitFunc
});

//configuration du module de connexion : https://github.com/meteor-useraccounts/core/blob/master/Guide.md

AccountsTemplates.configure({
    // Behavior
    confirmPassword: true,
    enablePasswordChange: true,
    forbidClientAccountCreation: false,
    socialLoginStyle:"popup",
    overrideLoginErrors: true,
    sendVerificationEmail: true,
    lowercaseUsername: false,
    focusFirstInput: true,

    // Appearance
    showAddRemoveServices: true,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: true,

    // Client-side Validation
    continuousValidation: true,
    negativeFeedback: false,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    // Privacy Policy and Terms of Use
    privacyUrl: 'privacy',
    termsUrl: 'terms-of-use',

    // Redirects
    homeRoutePath: 'lend',
    redirectTimeout: 4000,

    // Hooks
   // onLogoutHook: myLogoutFunc,
    onSubmitHook: mySubmitFunc,
   // preSignUpHook: myPreSubmitFunc,

    // Texts
    texts: {
      button: {
          signUp: "Register Now!"
      },
      socialSignUp: "Register",
      socialIcons: {
          "meteor-developer": "fa fa-rocket"
      },
      title: {
          forgotPwd: "Recover Your Password"
      },
    },
});





if (Meteor.isClient) {

}




// Côté serveur

if (Meteor.isServer) {

  //vérification de l'unicité du username
  /*
Meteor.methods({
        "userExists": function(username){
            return !!Meteor.users.findOne({username: username});
        },
    });*/
}