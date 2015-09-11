Schema = {};
// Création du premier Schéma (garder en haut de l'autre) qui est imbriqué dans le Meteor.users
//ATTENTION, il se peut que le nouveau module de connexion nécessite de drop toute les collections de colibry... !

SimpleSchema.debug =true;   //TESTING


//Création d'un schema pour l'adresse. Ne pas touché, utilisé par le package gérant les adresses
Schema.AddressSchema =new SimpleSchema({
  fullAddress: {
    type: String,
    optional: true
  },
  lat: {
    type: Number,
    decimal: true,
    optional: true
  },
  lng: {
    type: Number,
    decimal: true,
    optional: true
  },
  street: {
    type: String,
    max: 100,
    optional: true
  },
  city: {
    type: String,
    max: 50,
    optional: true
  },
  state: {
    type: String,
    // Source d'erreur pour le package. 
  //  regEx: /^A[LKSZRAEP]|C[AOT]|D[EC]|F[LM]|G[AU]|HI|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HKR]|P[ARW]|RI|S[CD]|T[NX]|UT|V[AIT]|W[AIVY]$/,
    optional: true
  },
  zip: {
    type: String,
        // Source d'erreur pour le package. 
    //regEx: /^[0-9]{5}$/,
    optional: true
  },
  country: {
    type: String,
    optional: true
  }
});


Schema.UserProfile = new SimpleSchema({
    
   firstName: {
    type: String,
    label: 'First Name',
    regEx: /^[a-zA-Z-]{2,25}$/,
    optional: true,
    autoform: {
      'label-type': 'floating',
      placeholder: 'First Name'
    }
  },
  lastName: {
    type: String,
    label: 'Last Name',
    regEx: /^[a-zA-Z-]{2,25}$/,
    optional: true,
    autoform: {
      'label-type': 'floating',
      placeholder: 'Last Name'
    }
  },
  birthday: {
    type: Date,
    label: "Birthday",
    optional: true
  },
  address1: {
    type: Schema.AddressSchema,
    label: 'Personal address',
    optional: true
  },
  address2: {
    type: Schema.AddressSchema,
    label: 'Work address',
    optional: true
  },
  pic: {
    type: String,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'Images',
        label: 'Profile Picture', 
        optional : true
      }}
      }
});

// deuxieme schema. Schema principale de Meteor.users dans lequel on inclue dans profile le schema ci-dessus
Schema.User = new SimpleSchema({
    emails: {
        type: [Object],
        // this must be optional if you also use other login services like facebook,
        // but if you use only accounts-password, then it can be required
        optional: true
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date

    },
    profile: {
        type: Schema.UserProfile,
        optional: true
    },
    services: {
        type: Object,
        optional: true,
        blackbox: true
    }

  }); 

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
          Router.go('profile');

    }
  }
};

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
    homeRoutePath: '/lend',
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