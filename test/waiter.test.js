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
describe('Database functions', function () {


    this.timeout(20000);

    beforeEach(async function () {
        await db.none('DELETE FROM shifts;');

        await db.none('DELETE FROM waiter;');

    })
    it('should insert a waiter name into the database', async () => {
        const queryLogic = waiterQuery(db);
        const waiterName = 'JohnDoe';

        await queryLogic.insertWaiterName(waiterName);

        // Query the database to check if the waiter was inserted
        const result = await db.one('SELECT username FROM waiter WHERE LOWER(username) = $1', [waiterName.toLowerCase()]);

        assert.strictEqual(result.username, waiterName.toLowerCase());
    });
    

    it('should return waiter availability', async () => {

        const testUsername = 'John';

        const mockWeekdays = [{ id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }, /*...*/];
        const mockSelectedDays = [{ weekday_id: 1 }, /*...*/];

        // Mock the database functions
        const db = {
            any: async (query) => {
                if (query === 'SELECT * FROM weekdays') {
                    return mockWeekdays;
                } else if (query === 'SELECT weekday_id FROM shifts WHERE waiter_id = (SELECT id FROM waiter WHERE username = $1)') {
                    return mockSelectedDays;
                }
            },
        };

        const queryLogic = waiterQuery(db);


        // Call the function to get waiter availability
        const result = await queryLogic.getWaiterAvailability(testUsername);

        assert.strictEqual(typeof result, 'object');
        assert.ok(result.hasOwnProperty('weekdays'));
        assert.ok(result.hasOwnProperty('selectedDays'));

        assert.ok(Array.isArray(result.weekdays));
        assert.ok(Array.isArray(result.selectedDays));


        assert.notEqual(result.weekdays, null);
        assert.notEqual(result.selectedDays, null);
    });
    

    it('should return an array of weekdays', async () => {
        const mockWeekdays = [
          { id: 1, name: 'Monday' },
          { id: 2, name: 'Tuesday' },
        ];
    
        const db = {
          many: async (query) => {
            assert.strictEqual(query, 'SELECT * FROM weekdays;');
            return mockWeekdays;
          },
        };
    
        const queryLogic = waiterQuery(db);
    
        const result = await queryLogic.showDays();
    
        assert.ok(Array.isArray(result), 'Result should be an array');
        assert.deepStrictEqual(result, mockWeekdays, 'Result should match the mock weekdays');
      });
  

});
    
    
    

