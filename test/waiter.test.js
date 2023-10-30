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

        const result = await db.one('SELECT username FROM waiter WHERE LOWER(username) = $1', [waiterName.toLowerCase()]);

        assert.strictEqual(result.username, waiterName.toLowerCase());
    });
    
    it('should return waiter availability', async () => {
        const mockDb = {
          any: async (query) => {
            if (query === 'SELECT * FROM weekdays') {
              return [{ id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }];
            }
          },
          oneOrNone: async (query) => {
            if (query === 'SELECT weekday_id FROM shifts WHERE waiter_id = (SELECT id FROM waiter WHERE username = $1)') {
              return { weekday_id: 1 };
            }
          },
        };
      
        const queryLogic = waiterQuery(mockDb);
      
        const result = await queryLogic.getWaiterAvailability('John');
      
      
        assert.deepStrictEqual(result.weekdays, [{ id: 1, name: 'Monday' }, { id: 2, name: 'Tuesday' }]);
        assert.deepStrictEqual(result.selectedDays, { weekday_id: 1 });
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
    
    
    

