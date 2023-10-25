import assert from 'assert';
import frontendWaiters from '../frontEnd.js';
import waiterQuery from '../services/query.js'
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
    it('should return a message if name is not entered', function () {
        var frontEndTest = frontendWaiters();
        assert.equal("Please provide a username", frontEndTest.setError(""))

    });
    it('should return a message if invalid name is entered', function () {
        var frontEndTest = frontendWaiters();
        assert.equal("Please enter a valid username", frontEndTest.setError('123saZ'))

    });

});
describe('waiterQuery', function () {


    this.timeout(20000);

    beforeEach(async function () {
        await db.none('DELETE FROM shifts;');

        await db.none('DELETE FROM waiter;');

    })
    it('inserts a waiter name into the table and handles duplicates', async () => {

        const query = waiterQuery(db);

        const waiterName = 'John';

        assert.equal(db.oneOrNone('SELECT username FROM waiter WHERE username = $1', [waiterName]));
        assert.equal(db.none('INSERT INTO waiter(username) VALUES ($1)', [waiterName]));

        await query.insertWaiterName(waiterName);

        assert.equal(db.oneOrNone('SELECT username FROM waiter WHERE username = $1', ['john']));
        assert.equal(db.none('INSERT INTO waiter(username) VALUES ($1)', [waiterName]));
    });


});