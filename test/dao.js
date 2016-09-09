var dao = require('../db');
var assert = require('assert');

var RETURNED_FALSE_MSG = "Completed without error, but returned false";

describe('Testing DAO', function() {

    after(function() {
        dao.close();
    });

    it('Can create retweet', function(done) {

        dao.createRetweet('cvaughan', '', new Date(), 1, function(err, status) {
            if (err)
            {
                done(new Error(err));
            }
            else
            {
                if (status)
                {
                    done();
                }
                else
                {
                    done(new Error(RETURNED_FALSE_MSG));
                }
            }
        });
    });

    it('Can create tweet', function(done) {
 
        dao.createTweet('cvaughan', 'Test tweet', new Date(), function(err, status) {
            if (err)
            {
                done(new Error(err));
            }
            else
            {
                if (status)
                {
                    done();
                }
                else
                {
                    done(new Error(RETURNED_FALSE_MSG));
                }
            }
        });
    });

    it('Can create new user', function(done) {
        dao.createUser({
            userName: 'test-user' + Math.floor(Math.random() * 100000),
            firstName: 'Test',
            middleName: 'A',
            lastName: 'User',
            password: 'abc'
        }, function(err, result) {
            if (err)
            {
                done(new Error(err));
            }
            else
            {
                if (result)
                {
                    done();
                }
                else
                {
                    done(new Error(RETURNED_FALSE_MSG));
                }
            }
        });
    });

    it('Can authenticate user', function(done) {
        dao.authenticate('cvaughan', 'abc', function(err, result) {
            if (err)
            {
                done(new Error(err));
            }
            else
            {
                if (result)
                {
                    done();
                }
                else
                {
                    done(new Error(RETURNED_FALSE_MSG));
                }
            }
        });
    });

   it('Handles invalid credentials', function(done) {
        dao.authenticate('cvaugha', 'elephant', function(err, result) {
            if (err)
            {
                done(new Error(err));
            }
            else
            {
                if (result)
                {
                    done(new Error("Allowed invalid credentials"));
                }
                else
                {
                    done();
                }
            }
        });
    });
});