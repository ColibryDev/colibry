// Collection GOOGLE_BOOKS_SEARCH pour stocker provisoirement les query HTTP sur Google Books
// Collection BOOKS_INFOS pour stocker les infos par livre unique = ISBN unique
// Collection PHYSICAL_BOOKS pour stocker l'information de la détention d'un livre unique physique
BOOKS_INFOS = new Mongo.Collection('allBooksInformation');

PHYSICAL_BOOKS = new Mongo.Collection('myPhysicalBooks');

GOOGLE_BOOKS_SEARCH = new Mongo.Collection('GBooks');
// Création d'une collection d'images FS
IMAGES = new FS.Collection(
  "images", {stores: [new FS.Store.GridFS("images", {})]
  });



Schema = {};
// Création du premier Schéma (garder en haut de l'autre) qui est imbriqué dans le Meteor.users
//ATTENTION, il se peut que le nouveau module de connexion nécessite de drop toute les collections de colibry... !

// SimpleSchema.debug =true;   //TESTING


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
    label: 'Profile Picture',
    optional : true,
    autoform: {
      afFieldInput: {
        type: 'fileUpload',
        collection: 'IMAGES'
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









// Configuration du routeur iron:router, chaque page doit être mentionnée ici ! grâce à Router.route
Router.configure({layoutTemplate: 'main'});

// LANCE L'API GOOGLE MAPS (LA CLÉ EST CACHÉE, lors du deploy, mettre la clé (essai gratuit)
//Lance seulement sur 2 pages nécessaires...
// Clé Google Maps API : AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE
// Colibry, autorisation pour colibry.meteor.com
Router.onBeforeAction(function() {
  GoogleMaps.load({ v: '3', 
//key: 'AIzaSyAqZ2hAdfBQdyoUZresoDfRPrDKoqMF0vE', 
	libraries: 'geometry,places' });
 this.next();
}, { only: ['borrow', 'profilepage'] });

// Fonction iron:router pour indiquer que sur n'importe quelle page (excepté Lend), si l'utilisateur n'est pas connecté à son compte, iron:router le renvoie vers la page de login
Router.onBeforeAction(function(){
    var currentUser = Meteor.userId();
    if(currentUser){
        this.next();
    } else {
        this.render("loginregister");
    }
}, {
    only: ['lend', 'profilepage']
});

Router.route('/', function(){this.render('lend');}, {name: 'lend'});
Router.route('/loginregister');
Router.route('/borrow');
Router.route('/profilepage');





if (Meteor.isClient) {

}

if (Meteor.isServer) {
	//autorise l'envoi de mails...
process.env.MAIL_URL="smtp://thecolibry%40gmail.com:Plouf123*@smtp.gmail.com:465/";


Meteor.publish('images',function(){
    var currentUserId = this.userId;
    return IMAGES.find({owner: currentUserId});
  });


IMAGES.allow({
  'insert': function (userId, doc) {
    // add custom authentication code here
    return true;
  },
  update: function(userId, doc, fieldNames, modifier) {
  return true;
  },
  'download': function (userId) {
    // add custom authentication code here
    return true;
}
});
}