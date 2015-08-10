Schemas = {};


PROFILES = new Mongo.Collection('Profiles');
PROFILES.attachSchema(new SimpleSchema({
  firstname: {
    type: String,
    label: "First name",
    max: 50
  },
  name: {
    type: String,
    label: "Name",
    max: 50
  },
  mail: {
    type: String,
    label: "E-mail",
    max: 50
  },
  birthday: {
    type: Date,
    label: "Birthday",
    optional: true
  }
}));



PROFILES.allow({
    insert: function(_id, doc){
    return doc; //&& doc._id === _id;
  },
  update: function(_id, doc){
    return doc; // && doc._id === _id;
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

  'CurrentUser': function(){
  var currentUserId = Meteor.userId();
  return currentUserId;
  },

  Profiles: function(){
  return PROFILES.find();
}

})
}

if (Meteor.isServer) {


}
