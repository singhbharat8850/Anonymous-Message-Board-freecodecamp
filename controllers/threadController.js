const MongoClient      = require('mongodb');
const CONNECTION_STRING = process.env.DB;
const ObjectId          = MongoClient.ObjectId;


function ThreadController() {
      // db doc => _id, text, created_on, bumped_on, reported, delete_password, replies
  this.postThread  = function(board, text, delete_password, callback){
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .insertOne(
        { text: text || '',
          created_on: new Date(),
          bumped_on: new Date(),
          reported: false,
          delete_password: delete_password || '',
          replies: []  },
        function(err, dbRes) {
          if(err) return console.log('Database insertOne err: '+err);
          
          callback( null, dbRes);
        });
    });
  };
      // db doc => [10 most recend bumped threds with 3 most recent replies]
  this.getThreads   = function(board, callback) {
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .find(
        {  },
        { limit: 10,
          sort: [['bumped_on', -1]]})
      .project( { reported: 0, delete_password: 0} )
      .toArray( (err, dbRes) => {
        if(err) return console.log('Database find err: '+err);
        
        let result = dbRes.map( elem => {
          elem.replyCount = elem.replies.length;
          // 3 elem from end
          elem.replies = elem.replies.slice( elem.replies.length >= 3 ? -3 : -elem.replies.length );
          elem.replies = elem.replies.map( item => { delete item.reported; delete item.delete_password; return item;});
          return elem;
        });
        
        callback(null, result);
      });
    });
  };
      // db doc => delete thread witd thread_id and delete_password
  this.delThread   = function(board, thread_id, delete_password, callback){
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .findOne(
        { _id: ObjectId(thread_id) },
        function(err, dbRes){
          if(err) return console.log('Database findOneAndDelete err: '+err);
          
          if(dbRes === null) return callback('incorrect thread_id', null);
          if(dbRes.delete_password !== delete_password) return callback('incrrect password');
          
          db.collection(board)
          .deleteOne(
            { _id: ObjectId(dbRes._id) },
            function(err, dbRes2) {
              if(err) return console.log('Database deleteOne err: '+err);
              
              callback(null, dbRes2);
            });
          
        });
    });
  };
      // db doc => set reported=true with board, thread_id
  this.reportThread= function(board, thread_id, callback){
    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      if (err) return console.log('Database connection err: '+err);
      db.collection(board)
      .updateOne(
        { _id: ObjectId(thread_id) },
        { $set: {  reported: true } },
        function(err, dbRes){
          if(err) return console.log('Database updateOne err: '+err);
          if(dbRes.matchedCount == 0) return callback('incorrect thread_id', null);
          
          callback(null, dbRes);
        });
      
    });
  };
  
  
};
  
module.exports = ThreadController;