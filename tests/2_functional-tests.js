/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

      let testThreadId2;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    let testThreadId1;
    
    suite('POST', function() {
      
      test('Create thred on testBoard', function(done){
        chai.request(server)
        .post('/api/threads/testBoard/')
        .send({ board: 'testBoard',
               text: 'testText',
               delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          
          chai.request(server)
          .post('/api/threads/testBoard/')
          .send({ board: 'testBoard',
                 text: 'testText',
                 delete_password: 'testPass'})
          .end( (err, res) => {
            assert.equal(res.status, 200);

            done();
          });
        });
        
      });
      
    });
    
    suite('GET', function() {
      
      test('Get array with 10 most recend bumped threds with 3 most recent replies', function(done){
        chai.request(server)
        .get('/api/threads/testBoard/')
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'delete_password');
          assert.property(res.body[0], 'replies');
          assert.isArray(res.body[0].replies);
          assert.isAtMost(res.body[0].replies.length, 3);
          if(res.body[0].replies.length != 0) {
            assert.property(res.body[0].replies[0], '_id');
            assert.property(res.body[0].replies[0], 'text');
            assert.property(res.body[0].replies[0], 'created_on');
            assert.notProperty(res.body[0].replies[0], 'reported');
            assert.notProperty(res.body[0].replies[0], 'delete_password');
          };
          testThreadId1 = res.body[0]._id;
          testThreadId2 = res.body[1]._id;
          done();
        });
      });
    });
    
    suite('DELETE', function() {
      
      test('No delete with wrong thread_id', function(done){
        chai.request(server)
        .delete('/api/threads/testBoard/')
        .send({ board: 'testBoard',
                thread_id: '100000000000000000000000',
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread_id');
          
          done();
        });
      });
      
      test('No delete with wrond delete_password', function(done) {
        chai.request(server)
        .delete('/api/threads/testBoard/')
        .send({ board: 'testBoard',
                thread_id: testThreadId1,
                delete_password: ''})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incrrect password');
          
          done();
        });
      });
      
      test('Delete thread with thread_id and delete_password', function(done){
        chai.request(server)
        .delete('/api/threads/testBoard/')
        .send({ board: 'testBoard',
                thread_id: testThreadId1,
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('No reporting when given wrong thread_id', function(done){
        chai.request(server)
        .put('/api/threads/testBoard/')
        .send({ board: 'testBoard',
                thread_id: 100000000000000000000000 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread_id');
          
          done();
        });
      });
      
      test('Thread reported with thread_id', function(done) {
        chai.request(server)
        .put('/api/threads/testBoard/')
        .send({ board: 'testBoard',
                thread_id: testThreadId2 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
          let testReplyId;
    
    suite('POST', function() {
      
      test('Create reply on given thread with thread_id', function(done) {
        chai.request(server)
        .post('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                text: 'testText',
                delete_password: 'testPass' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('Get no thread with board and wrong thread_id', function(done){
        chai.request(server)
        .get('/api/replies/testBoard')
        .query({ thread_id: '100000000000000000000000' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'null');
          
          done();
        });
      });
      
      test('Get thread and all replies with board, thread_id', function(done){
        chai.request(server)
        .get('/api/replies/testBoard')
        .query({ thread_id: testThreadId2 })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.propertyVal(res.body, '_id', testThreadId2);
          assert.property(res.body, 'text');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.notProperty(res.body, 'reported');
          assert.notProperty(res.body, 'delete_password');
          assert.property(res.body, 'replies');
          assert.isArray(res.body.replies);
          if(res.body.replies.length > 0) {
            assert.property(res.body.replies[0], '_id');
            assert.property(res.body.replies[0], 'text');
            assert.property(res.body.replies[0], 'created_on');
            assert.notProperty(res.body.replies[0], 'reported');
            assert.notProperty(res.body.replies[0], 'delete_password');
            testReplyId = res.body.replies[0]._id;
          }
          
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('No reply reporting with wrong thread_id', function(done){
        chai.request(server)
        .put('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: '100000000000000000000000',
                reply_id: testReplyId })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread_id or reply_id');
          
          done();
        });
      });
      
      test('No reply reporting with wrong reply_id', function(done){
        chai.request(server)
        .put('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                reply_id: '100000000000000000000000' })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread_id or reply_id');
          
          done();
        });
      });
      
      test('Report reply with board, thread_id, reply_id', function(done){
        chai.request(server)
        .put('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                reply_id: testReplyId })
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('No reply deleting with board, thread_id, delete_password, wrong reply_id', function(done) {
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                reply_id: '100000000000000000000000',
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect reply_id');
          
          done();
        });
      });
      
      test('No reply deleting with board, reply_id, delete_password, wrong thread_id', function(done) {
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: '100000000000000000000000',
                reply_id: testReplyId,
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect thread_id');
          
          done();
        });
      });
      
      test('No reply deleting with board, reply_id, thread_id, wrong delete_password', function(done) {
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                reply_id: testReplyId,
                delete_password: ''})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          
          done();
        });
      });
      
      test('Delete reply with board, reply_id, thread_id, delete_password', function(done) {
        chai.request(server)
        .delete('/api/replies/testBoard')
        .send({ board: 'testBoard',
                thread_id: testThreadId2,
                reply_id: testReplyId,
                delete_password: 'testPass'})
        .end( (err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          
          done();
        });
      });
      
    });
    
  });

});
