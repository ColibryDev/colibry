// CLIENT SIDE
if (Meteor.isClient) {

	Template.mailbox.helpers({
		getBorrowingMailInfos: function() {
		var currentUserId = Meteor.userId();
		// var mailInfos = [];
		// MAILBOX.find({sender_Id: currentUserId}).forEach(function(element) {mailInfos.push(element);});;
		// console.log(mailInfos);
		return MAILBOX.find({sender_Id: currentUserId});
		},

		getLendingMailInfos: function() {
		var currentUserId = Meteor.userId();
		// var mailInfos = [];
		// MAILBOX.find({sender_Id: currentUserId}).forEach(function(element) {mailInfos.push(element);});;
		// console.log(mailInfos);
		return MAILBOX.find({recipient_Id: currentUserId});
		},

		getSenderPhoto: function() {
		var sender_Id = this.sender_Id;
		var sender = Meteor.users.findOne({_id:sender_Id});
		var senderProfilePic = sender && sender.profile && sender.profile.pic;
		return IMAGES.findOne({_id:senderProfilePic});
		},

		getRecipientPhoto: function() {
		var recipient_Id = this.recipient_Id;
		var recipient = Meteor.users.findOne({_id:recipient_Id});
		var recipientProfilePic = recipient && recipient.profile && recipient.profile.pic;
	    return IMAGES.findOne({_id:recipientProfilePic});

		},

		getSenderName: function() {
		var sender_Id = this.sender_Id;
		var sender = Meteor.users.findOne({_id:sender_Id});
		var senderName = sender && sender.profile && sender.profile.firstName;
		return senderName;
		},
		getRecipientName: function() {
		var recipient_Id = this.recipient_Id;
		var recipient = Meteor.users.findOne({_id:recipient_Id});
		var recipientName = recipient && recipient.profile && recipient.profile.firstName;
		return recipientName;
		},

		getBookTitle: function() {
		var book_Id = this.book_Id;
		var book = BOOKS_INFOS.findOne({_id:book_Id});
		var bookTitle = book && book.title;
		return bookTitle;
		},

		getBookThumb: function() {
		var book_Id = this.book_Id;
		var book = BOOKS_INFOS.findOne({_id:book_Id});
		var thumb = book && book.thumb;
		if (thumb) {
			return BOOKS_INFOS.findOne({_id:book_Id}).thumb;
		}
		},

		getLastDiscussionDate: function() {
		var lastDiscussionDate = this.lastDisussionDate;
		var momentLastDiscussionDate = moment.utc(lastDiscussionDate).format('MMMM Do YYYY');
		var c = moment(momentLastDiscussionDate).fromNow();
		return c;
		},

		getCreatedAt: function() {
		var createdAt = this.createdAt;
		var createdAt = moment.utc(createdAt).format('MMMM Do YYYY');
		return createdAt;
		},

		getReadBySender: function() {
		var readBySender = this.readBySender;
		return readBySender;
		},

		getReadByRecipient: function() {
		var readByRecipient = this.readByRecipient;
		return readByRecipient;
		},

		isStatusWaiting: function() {
		var status = this.status;
		if (status === "waiting"){return true;}
		else {return false;}
		},

		isStatusRefused: function() {
		var status = this.status;
		if (status === "refused"){return true;}
		else {return false;}
		},

		isStatusAccepted: function() {
		var status = this.status;
		if (status === "accepted"){return true;}
		else {return false;}
		},

		getConversationId:function() {
		var Id = this._id;
		return Id;
		}
	});
}
