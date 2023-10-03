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
    it('should return a message if name is not entered',function(){
        var frontEndTest = frontendWaiters();
        assert.equal("Please provide a username",frontEndTest.setError(""))

    });
    it('should return a message if invalid name is entered',function(){
        var frontEndTest = frontendWaiters();
        assert.equal("Please enter a valid username",frontEndTest.setError('123saZ'))

    });

});
// describe('waiterQuery', function () {
//     this.timeout(20000);

//     beforeEach(async function () {
//         await db.none("DELETE FROM waiter")
//     })
//     it('should insert a waiter name into the database', async () => {
//         const db = pgp('your-database-connection-string');
//         const query = waiterQuery(db);
//         const waiterName = 'John Doe';

//         // Ensure that the function resolves without errors
//         await assert.equal(query.insertWaiterName(waiterName)).to.be.fulfilled;

//         // Check if the waiter was actually added to the database
//         const result = await db.oneOrNone('SELECT username FROM waiter WHERE username = $1', [waiterName]);
//         assert.isDefined(result);
//         assert.equal(result.username, waiterName);
//     });


// });