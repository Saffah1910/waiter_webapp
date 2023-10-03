export default function waiterQuery(db) {
    //this function will first check if the username already exists or not then only will it insert the username 
    async function insertWaiterName(name) {

        const existingUserName = await db.oneOrNone('SELECT username FROM waiter WHERE username = $1', [name]);
        if (!existingUserName) {
            // Insert the waiter name if it doesn't exist
            await db.none('INSERT INTO waiter(username) VALUES ($1)', [name]);

            // console.log('Waiter added successfully');
        } 
    }

    // async function insertWaiterName(name, selectedDays) {

    //     const existingUserName = await db.oneOrNone('SELECT username FROM waiter WHERE username = $1', [name]);

    //     if (!existingUserName) {
    //         // Insert the waiter name if it doesn't exist
    //         const waiterId = await db.one('INSERT INTO waiter(username) VALUES ($1) RETURNING id', [name]);

    //         // Get the IDs of the selected days in a single query
    //         const weekdayIds = await db.many('SELECT id FROM weekdays WHERE weekday IN ($1:csv)', [selectedDays]);

    //         // Construct the array of values for the INSERT statement
    //         const valuesArray = weekdayIds.map(weekdayId => `(${waiterId}, ${weekdayId.id})`).join(', ');

    //         // Insert all rows into the shifts table in a single query
    //         await db.none(`INSERT INTO shifts(waiter_id, weekday_id) VALUES ${valuesArray}`);

    //         console.log('Waiter and shifts added successfully');
    //     } else {
    //         console.log('Waiter with the same username already exists');
    //     }

    // }




    async function addShift(waiterId, weekdayId) {
        await db.none('INSERT INTO shifts (waiter_id, weekday_id) VALUES ($1, $2)',[waiterId,weekdayId]);
    }


    async function getWaiterId(username) {
        
       // console.log("test waiter")
            const result = await db.one('SELECT id FROM waiter WHERE username = $1', [username]);
            return result.id;
     
    }
    
    async function getWeekdayId(weekday) {
     
            const result = await db.one('SELECT id FROM weekdays WHERE weekday = $1', [weekday]);
            return result.id;
   
    }


    async function showDays() {
        await db.any('SELECT weekday FROM weekdays;')

    }


    return {
        insertWaiterName,
        addShift,
        showDays,
        getWaiterId,
        getWeekdayId

    }
}

