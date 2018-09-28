const MongoClient      = require('mongodb');
const CONNECTION_STRING = process.env.DB;
const ObjectId          = MongoClient.ObjectId;


function ReplyController() {
  this.postReply = (board, thread_id, text, delete_password, callback) => {
        // db doc.replies => _id, text, created_on, delete_password, reported
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .updateOne(
        {  _id: ObjectId(thread_id) },
        {  $set: { bumped_on: new Date() },
          $push:  { replies:  { _id: new ObjectId(), 
                              text: text, 
                              created_on:  new Date(), 
                              delete_password: delete_password, 
                              reported: false } } },
        (err, dbRes) => {
          if(err) return console.log('Database updateOne err: '+err);
          
          callback(null, dbRes);
        });
      
    });
  };
      // db doc => thread with all replies, hide delete_password and reported
  this.getThread = (board, thread_id, callback) => {
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .findOne(
        { _id: ObjectId(thread_id) },
        // { projection: { reported: false, delete_password: false } },
              function (err, dbRes) {
        if(err) return console.log('Database findOne err: '+err);
        if(dbRes){
          delete dbRes.reported;
          delete dbRes.delete_password;
          dbRes.replies = dbRes.replies.map( item => { delete item.reported; delete item.delete_password; return item;});
        }
        
        callback(null, dbRes);
      });
    });
  };
      // db doc => delete reply with board, thread_id, reply_id, delete_password
  this.delReply  = (board, thread_id, reply_id, delete_password, callback) => {
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .findOne(
        { _id: ObjectId(thread_id) },
        function(err, dbRes) {
          if(err) return console.log('Database findOne err: '+err);
          
          if(dbRes == null) return callback('incorrect thread_id', null);
          
          let index = dbRes.replies.findIndex( elem => elem._id == reply_id);
          if(index === -1) return callback('incorrect reply_id', null);
          if(dbRes.replies[index].delete_password != delete_password) return callback('incorrect password', null);
          
          db.collection(board)
          .updateOne(
            { _id: ObjectId(thread_id),
              "replies._id": ObjectId(reply_id)},
            { $set: {"replies.$.text": '[deleted]' } },
            function(err, dbRes2){
              if(err) return console.log('Database updateOne err: '+err);
              
              callback(null, dbRes2);
            });
        });
      
    });
  };
      // db doc => change reported to true with board, thread_id, reply_id
      // assumed correct input and tried to do it dense 
  this.reportReply  = (board, thread_id, reply_id, callback) => {
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .updateOne(
        { _id: ObjectId(thread_id),
          "replies._id": ObjectId(reply_id) },
        { $set: { "replies.$.reported": true } },
        function(err, dbRes){
          if(err) return console.log('Database updateOne err: '+err);
          if(dbRes.matchedCount == 0) return callback('incorrect thread_id or reply_id', null);
          
          callback(null, dbRes);
        });
      
      
    });
  };
};

module.exports = ReplyController;