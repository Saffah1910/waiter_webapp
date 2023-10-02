import assert from 'assert';
import frontendWaiters from '../frontEnd.js';
import pgPromise from 'pg-promise';
import 'dotenv/config';
import { describe } from 'mocha';

const pgp = pgPromise({})
const connectionString = process.env.DATABASE_URL;
const db = pgp(connectionString);

describe('Waiter front end', function () {
    it('Only valid names should pass through the regex', function () {
        var frontEndTest = frontendWaiters();
        assert.equal(true, frontEndTest.checkUsername('saffah'));
    });
    it('should return a message if name is not entered',function(){
        var frontEndTest = frontendWaiters();
        assert.equal("Please provide a username",frontEndTest.setError(""))

    });
    it('should return a message if invalid name is entered',function(){
        var frontEndTest = frontendWaiters();
        assert.equal("Please enter a valid username",frontEndTest.setError('123saZ'))

    });

});