Schema = {};


PROFILES = new Mongo.Collection('Profiles');

Schema.UserProfile = new SimpleSchema({
   username: {
    type: String,
    label: 'Username',
    optional: true,
    autoform: {
      'label-type': 'floating',
      placeholder: 'Username'
    }
  },
   firstname: {
    type: String,
    label: 'First Name',
    regEx: /^[a-zA-Z-]{2,25}$/,
    optional: true,
    autoform: {
      'label-type': 'floating',
      placeholder: 'First Name'
    }
  },
  lastname: {
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
  }
});

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


Meteor.users.attachSchema(Schema.User);




Meteor.users.allow({
  insert: function(userId, doc){
    return doc && doc.userId === userId;
  },
  update: function(userId, doc){
    return doc && doc.userId === userId;
  }
})

/*
var ProfileHooks = {
  before: {
    insert: function(doc) {
      if(Meteor.userId()){
        doc.userId = Meteor.userId();
      }
      
      return doc;
    }
  }
}

AutoForm.addHooks(Meteor.userId(), ProfileHooks);

*/

if (Meteor.isClient) {

  Template.profile.helpers({

  user: function(){
    return Meteor.userId;
  }
})



}

if (Meteor.isServer) {


}
