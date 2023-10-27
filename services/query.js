export default function waiterQuery(db, frontEndLogic) {

    // Function to insert a waiter name if it doesn't exist
    async function insertWaiterName(name) {
        try {
            const lowercasedName = name.toLowerCase(); 
    
            // Check if the lowercase name already exists in the database
            const existingUserName = await db.oneOrNone('SELECT username FROM waiter WHERE LOWER(username) = $1', [lowercasedName]);
    
            if (!existingUserName ) {
                // If the lowercase name doesn't exist, insert the name in consistent case
                await db.none('INSERT INTO waiter(username) VALUES ($1)', [lowercasedName]);
                // Log success or return a success message
            }
        } catch (error) {
            console.error('Error in insertWaiterName:', error.message);
            throw error;
        }
    }
    

    // Function to get waiter availability
    async function getWaiterAvailability(username) {
        try {
            // getWaiterAvailability
            const weekdays = await db.any('SELECT * FROM weekdays');
            const selectedDays = await db.any('SELECT weekday_id FROM shifts WHERE waiter_id = (SELECT id FROM waiter WHERE username = $1)', [username]);

            return { weekdays, selectedDays };
        } catch (error) {
            console.error('Error in getWaiterAvailability:', error.message);
            throw error;
        }
    }

    async function getSelectedDaysForWaiter(waiterId) {
        try {
            const selectedDays = await db.any('SELECT weekday_id FROM shifts WHERE waiter_id = $1', [waiterId]);
            return selectedDays.map(row => row.weekday_id);
        } catch (error) {
            console.error('Error in getSelectedDaysForWaiter:', error.message);
            throw error;
        }
    }


  
    async function addShift(waiterId, weekdayId) {
        try {
            // Check if the maximum number of waiters for the day has been reached
            const currentWaitersCount = await db.one('SELECT COUNT(*) FROM shifts WHERE weekday_id = $1', [weekdayId]);
            if (currentWaitersCount >= 3) {
                console.error('Maximum waiters reached for this day.');
                // Optionally, you might want to throw an error, log a message, or handle it based on your logic
                return;
            }

            // If the limit is not reached, add the shift
            await db.none('INSERT INTO shifts (waiter_id, weekday_id) VALUES ($1, $2)', [waiterId, weekdayId]);
            // Log success or return a success message
        } catch (error) {
            console.error('Error in addShift:', error.message);
            throw error;
        }
    }

    // Function to get waiter ID by username
    async function getWaiterId(username) {
            const result = await db.oneOrNone('SELECT id FROM waiter WHERE username = $1', [username]);

            if (result) {
                return result.id;
            } else {
                console.error(`No waiter ID found for '${username}'`);
                return null;
            }
    
    }


    async function getWeekdayId(weekday) {
        try {
            const result = await db.oneOrNone('SELECT id FROM weekdays WHERE id = $1', [weekday]);
            if (!result) {
                // Handle the case when no data is returned (e.g., log a message, return a default value)
                console.error(`No weekday ID found for '${weekday}'`);
                // You might return a default value, throw an error, or handle it based on your logic
                return null;
            }
            return result.id;
        } catch (error) {
            console.error('Error in getWeekdayId:', error.message);
            // Handle the error (e.g., log the error, throw an error, etc.)
            throw error;
        }
    }



    async function showDays() {
        try {
            return await db.many('SELECT * FROM weekdays;');
        } catch (error) {
            console.error('Error in showDays:', error.message);
            throw error;
        }
    }

    
    async function getWaitersForDay() {
        try {

            const queryResult = await db.any(`
            SELECT DISTINCT waiter.username, weekdays.weekday
            FROM shifts
            INNER JOIN waiter ON shifts.waiter_id = waiter.id
            INNER JOIN weekdays ON shifts.weekday_id = weekdays.id
        `);


            // const waiterUsernames = queryResult.map(result => result.username);
            return queryResult;
        } catch (error) {
            console.error('Error in getWaitersForDay:', error.message);
            throw error;
        }
    }

    async function getWaitersCountForDay(dayName) {
        try {
            const result = await db.one('SELECT COUNT(*) FROM shifts INNER JOIN weekdays ON shifts.weekday_id = weekdays.id WHERE weekdays.weekday = $1', [dayName]);
            return result.count;
        } catch (error) {
            console.error('Error in getWaitersCountForDay:', error.message);
            throw error;
        }
    }

    async function removeShiftsForWaiter(waiterId) {
        try {
            await db.none('DELETE FROM shifts WHERE waiter_id = $1', [waiterId]);
            // Log success or return a success message
        } catch (error) {
            console.error('Error in removeShiftsForWaiter:', error.message);
            throw error;
        }
    }

    async function clearWeekshifts() {

        await db.none('DELETE FROM shifts;');

        await db.none('DELETE FROM waiter;');

    }



    return {
        insertWaiterName,
        addShift,
        showDays,
        getWaiterId,
        getWeekdayId,
        getWaiterAvailability,
        getSelectedDaysForWaiter,
        getWaitersForDay,
        getWaitersCountForDay,
        removeShiftsForWaiter,
        clearWeekshifts
    };
}