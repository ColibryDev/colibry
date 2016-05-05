
// fonction publish qui renvoit la liste de tous les livres available, quel que soit l'utilisateur
Meteor.publish('allAvailableBooks', function() {
    return PHYSICAL_BOOKS.find({
        status: "1"
    });
});

Meteor.methods({
    'sendMail': function(sender_Id, recipient_Id, book_Id, physicalBook_Id, createdAt, lastDiscussionDate, readBySender, readByRecipient, status) {

        MAILBOX.insert({
            sender_Id: sender_Id,
            recipient_Id: recipient_Id,
            book_Id: book_Id,
            physicalBook_Id: physicalBook_Id,
            createdAt: createdAt,
            lastDiscussionDate: lastDiscussionDate,
            readBySender: readBySender,
            readByRecipient: readByRecipient,
            status: status
        });
    },

    'addChat': function(mailbox_Id, sender_Id, recipient_Id, date, message) {

        CHAT.insert({
            mailbox_Id: mailbox_Id,
            sender_Id: sender_Id,
            recipient_Id: recipient_Id,
            date: date,
            message: message
        });
    }

});

//autorise l'envoi de mails...
process.env.MAIL_URL = "smtp://thecolibry%40gmail.com:C@mp1267.*@smtp.gmail.com:465/";
// avant 465

Meteor.methods({
    sendEmail: function(to, from, subject, text) {
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

Meteor.publish('images', function() {
    var currentUserId = this.userId;
    return IMAGES.find();
});

Meteor.publish('mailbox', function() {
    var currentUserId = this.userId;
    return MAILBOX.find({
        $or: [{
            sender_Id: currentUserId
        }, {
            recipient_Id: currentUserId
        }]
    });
});

IMAGES.allow({
    'insert': function(userId, doc) {
        // add custom authentication code here
        return true;
    },
    update: function(userId, doc, fieldNames, modifier) {
        return true;
    },
    'download': function(userId) {
        // add custom authentication code here
        return true;
    }
});

// je ne sais pas...
var ChildProcess = Npm.require('child_process').exec;


// fonction publish qui renvoit les informations sur la détention en livre d'un utilisateur
Meteor.publish('myPhysicalBooks', function() {
    var currentUserId = this.userId;
    return PHYSICAL_BOOKS.find({
        bookOwner: currentUserId
    });
});

// fonction publish qui renvoit les infos sur tous les livres enregistrés sur le site.
Meteor.publish('allBooksInformation', function() {
    return BOOKS_INFOS.find();
});

Meteor.methods({
    // POur insérer un livre dans la collection BOOK
    'InsertBook': function(ISBN, title, authors, publisher, status, snippet, thumb, averageRating, error) {
        // var pour l'id de l'utiisateur
        var currentUserId = this.userId;
        // variable ou est stocké l'id unique du livre de la DBMongo BOOKS_INFOS
        var bookRef;
        //VOIR ENSUITE POUR ACTUALISER LES INFORMATIONS ISSUES DE GBOOKS !!! V2
        // VOIR ENSUITE SI ON PEUT VALIDER L'ISBN + FIABLEMENT !!! V2

        //PARTIE 1
        //var pour voir si le bouquin est déjà référencé dans la base de données
        var isThisBookAlreadyInTheDatabase = BOOKS_INFOS.find({
            ISBN: ISBN
        }).count();
        if (isThisBookAlreadyInTheDatabase == 0) {
            //Si aucun document ne ressort alors on le créé
            // le callback permet de récupérer l'id lorsque l'insertion a réussi
            bookRef = BOOKS_INFOS.insert({
                ISBN: ISBN,
                authors: authors,
                title: title,
                publisher: publisher,
                snippet: snippet,
                thumb: thumb,
                averageRating: averageRating
            });
        } else {
            // SInon, on renvoit l'_id du bouquin unique de la base de données pour les fonctions suivantes
            bookRef = BOOKS_INFOS.findOne({
                ISBN: ISBN
            })._id;
        }


        //PARTIE 2
        // Met dans une variable le nombre de livre qui comporte le même ISBN et qui est dans la librairie de la personne connectée (est ce que le livre est en double)
        var isThisABookAlreadyInTheLibrary = PHYSICAL_BOOKS.find({
            bookOwner: currentUserId,
            bookRef: bookRef
        }).count();
        // Si pas de livre identique dans la biblio de l'utilisateur
        if (isThisABookAlreadyInTheLibrary == 0) {
            // Ajoute une nouvelle entrée dans la base de données PHYSICAL_BOOKS pour indiquer que cet utilisateur possède un exemplaire de ce livre portant cet ISBN la. Le statut de base donné est ladisponbile.
            PHYSICAL_BOOKS.insert({
                bookRef: bookRef,
                bookOwner: currentUserId,
                publicationDate: new Date(),
                status: status
            });
            return "oui";
        } else {
            return "error";

        }

    },

    'removeBook': function(selectedPhysicalBook_Id) {
        // on stocke la BookRef dans une variable afin de vérifier qu'il n'en existe pas d'autres. Si il n'en existe pas d'autre on suprrime aussi le bouquin de nos BOOKS_INFOS car personne d'autre ne l'a...
        var bookRef = PHYSICAL_BOOKS.findOne(selectedPhysicalBook_Id).bookRef;
        var nbBooksPossessed = PHYSICAL_BOOKS.find({
            bookRef: bookRef
        }).count();
        if (nbBooksPossessed == 1) {
            BOOKS_INFOS.remove(bookRef);
            console.log("supprimé de books_INFOS")
        }
        //suppression d'un livre de la bibliothèque

        PHYSICAL_BOOKS.remove(selectedPhysicalBook_Id);

    },

    'statusChange': function(selectedPhysicalBook, targetedStatus) {
        // Fonction utilisée par le drag and drop pour changer le statut du livre (1 = available, 0 = private, 2 = lent)
        PHYSICAL_BOOKS.update(selectedPhysicalBook, {
            $set: {
                status: targetedStatus
            }
        });
    },

});

Meteor.publish('GOOGLE_BOOKS_SEARCH', function(query) {
    // FONCTION DE RECHERCHE DANS L'API GOOGLE BOOKS
    var self = this;
    try {
        // FONCTION HTTP.GET
        var response = HTTP.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: query,
                // recherche en francais
                langRestrict: "fr",
                // 15 résultats ressortent à chaque fois
                maxResults: 15
            }
        });

        _.each(response.data.items, function(item) {
            // si il y a bien une image sur le livre
            if (item.volumeInfo.imageLinks != undefined) {
                var doc = {
                    thumb: item.volumeInfo.imageLinks.smallThumbnail,
                    authors: item.volumeInfo.authors,
                    title: item.volumeInfo.title,
                    averageRating: item.volumeInfo.averageRating,
                    publisher: item.volumeInfo.publisher,
                    ISBN: item.volumeInfo.industryIdentifiers,
                    snippet: item.searchInfo && item.searchInfo.textSnippet
                };
                // ajoute à la collection Gbooks.
                self.added('GBooks', Random.id(), doc);
            }

            // S'il n'y a pas d'image sur Google Books, alors, j'utilise une image stockée localement (fond gris avec écrit image unavailable...)
            else {
                var doc = {
                    thumb: "/na.png",
                    authors: item.volumeInfo.authors,
                    title: item.volumeInfo.title,
                    averageRating: item.volumeInfo.averageRating,
                    publisher: item.volumeInfo.publisher,
                    ISBN: item.volumeInfo.industryIdentifiers,
                    snippet: item.searchInfo && item.searchInfo.textSnippet
                };

                self.added('GBooks', Random.id(), doc);
            }


        });

        self.ready();

    } catch (error) {
        console.log(error);
    }
});

// Meteor Publish adresses (lat,lgn) des utillisateurs
Meteor.publish('UsersPublicInfos', function() {
    // Cela retourne tous les lat / lng des utilisateurs, sauf l'utilisateur actuel..
    var currentUserId = this.userId;
    return Meteor.users.find({
        _id: {
            $ne: currentUserId
        }
    }, {
        fields: {
            'profile.firstName': 1,
            'profile.address1.lat': 1,
            'profile.address1.lng': 1,
            'profile.address2.lat': 1,
            'profile.address2.lng': 1,
            'profile.pic': 1
        }
    });
});
