export default function waiterQuery(db) {
    // Function to insert a waiter name if it doesn't exist
    async function insertWaiterName(name) {
        try {
            const existingUserName = await db.oneOrNone('SELECT username FROM waiter WHERE username = $1', [name]);
            if (!existingUserName) {
                await db.none('INSERT INTO waiter(username) VALUES ($1)', [name]);
                // Log success or return a success message
            }
            // Optionally, you might want to handle the case where the username already exists
        } catch (error) {
            console.error('Error in insertWaiterName:', error.message);
            throw error;
        }
    }

    // Function to get waiter availability
    async function getWaiterAvailability(username) {
        try {getWaiterAvailability
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
    

    // Function to add a shift for a waiter on a specific weekday
    async function addShift(waiterId, weekdayId) {
        try {
            await db.none('INSERT INTO shifts (waiter_id, weekday_id) VALUES ($1, $2)', [waiterId, weekdayId]);
            // Log success or return a success message
        } catch (error) {
            console.error('Error in addShift:', error.message);
            throw error;
        }
    }

    // Function to get waiter ID by username
    async function getWaiterId(username) {
        try {
            const result = await db.oneOrNone('SELECT id FROM waiter WHERE username = $1', [username]);
    
            if (result) {
                return result.id;
            } else {
                console.error(`No waiter ID found for '${username}'`);
                return null;
            }
        } catch (error) {
            console.error('Error in getWaiterId:', error.message);
            throw error;
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
    
    
    
    // Function to show all weekdays
    async function showDays() {
        try {
            return await db.any('SELECT * FROM weekdays;');
        } catch (error) {
            console.error('Error in showDays:', error.message);
            throw error;
        }
    }
    

    return {
        insertWaiterName,
        addShift,
        showDays,
        getWaiterId,
        getWeekdayId,
        getWaiterAvailability,
        getSelectedDaysForWaiter
    };
}
