// Collection GOOGLE_BOOKS_SEARCH pour stocker provisoirement les query HTTP sur Google Books
// Collection BOOKS_INFOS pour stocker les infos par livre unique = ISBN unique
// Collection PHYSICAL_BOOKS pour stocker l'information de la détention d'un livre unique physique
BOOKS_INFOS = new Mongo.Collection('allBooksInformation');

PHYSICAL_BOOKS = new Mongo.Collection('myPhysicalBooks');

GOOGLE_BOOKS_SEARCH = new Mongo.Collection('GBooks');

// Collection MAILBOX pour stocker toutes les conversation (qui demande à qui quel bouquin quand et à quel moment il est prêté, etc.)
// Collection CHAT pour stocker les dicussions chaque conversation
MAILBOX = new Mongo.Collection('mailbox');

CHAT = new Mongo.Collection('chat');

// Création d'une collection d'images FS
IMAGES = new FS.Collection(
  "images", {stores: [new FS.Store.GridFS("images", {})]
  });


// On créé un index Easy Search pour la DB BOOKS_INFOS
// https://atmospherejs.com/matteodem/easy-search
BIIndex = new EasySearch.Index(
  {
    collection: BOOKS_INFOS,
    fields: ['title', 'authors', 'publisher'],
    engine: new EasySearch.MongoDB(),
    defaultSearchOptions: {limit: 20}
    }
);



Schema = {};
// Création du premier Schéma (garder en haut de l'autre) qui est imbriqué dans le Meteor.users

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
      },
  description: {
    type: String,
    label: "Brief summary",
    optional: true,
    max: 1000,
    autoform: {
       type: "textarea",
      'label-type': 'floating',
      placeholder: 'About me...'
    }
  },
  createdAt: {
        type: Date,
        autoValue: function() {
      if (this.isInsert) {
        return new Date();
      } else if (this.isUpsert) {
        return {$setOnInsert: new Date()};
      } else {
        this.unset();  // Prevent user from supplying their own value
      }
    }
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



// SCHEMA de MAILBOX
Schema.MAILBOX = new SimpleSchema({
    sender_Id: {
    type: String,
    },
    recipient_Id: {
    type: String,
    },
    book_Id: {
    type: String,
    },
    physicalBook_Id: {
    type: String,
    },
    createdAt: {
    type: Date
    },
    lastDiscussionDate: {
    type: Date
    },
    readBySender: {
    type: Boolean
    },
    readByRecipient: {
    type: Boolean
    },
    status: {
    type: String
    }
  }); 

Schema.CHAT = new SimpleSchema({
    mailbox_Id: {
    type: String
    },
    sender_Id: {
    type: String,
    },
    recipient_Id: {
    type: String,
    },
    date: {
    type: Date
    },
    message: {
    type: String,
    label: "Message",
    optional: true,
    max: 1000,
    autoform: {
       type: "textarea",
      'label-type': 'floating'
    }
  },
}); 

if (Meteor.isClient) {
  Meteor.subscribe('mailbox');
}

if (Meteor.isServer) {
  //autorise l'envoi de mails...
process.env.MAIL_URL="smtp://thecolibry%40gmail.com:C@mp1267.*@smtp.gmail.com:465/";
// avant 465

Meteor.methods({
  sendEmail: function (to, from, subject, text) {
    check([to, from, subject, text], [String]);

    // Let other method calls from the same client start running,
    // without waiting for the email sending to complete.
    this.unblock();

    Email.send({
      to: to,
      from: from,
      subject: subject,
      text: text
    });

    
  }
});




Meteor.publish('images',function(){
    var currentUserId = this.userId;
    return IMAGES.find();
  });

Meteor.publish('mailbox',function(){
    var currentUserId = this.userId;
    return MAILBOX.find({ $or: [{ sender_Id: currentUserId }, {recipient_Id: currentUserId } ] });
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


