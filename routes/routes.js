export default function routes(dbLogic, frontEndLogic) {
    //dbLogic must be a paramter



   // Inside your routes file
   async function home (req,res){
    res.redirect('/days')
   }
   async function clear(req,res){
    dbLogic.clearWeekshifts();
    req.flash('clear',"The weekly data has been cleared");
    res.redirect('/days')
   }

   async function adminPage(req, res) {
    try {
        // Initialize an object to store usernames by day
        const availability = {
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": [],
            "Friday": [],
            "Saturday": [],
            "Sunday": [],
        };

        // Fetch the weekdays data from the database
        const weekdays = await dbLogic.showDays();

        // Extract the selected day from the request query parameters
        const { selectedDayId } = req.query;

        // Use your dbLogic function to get the waiter usernames for all days
        const data = await dbLogic.getWaitersForDay();

        // Populate the availability object based on the data fetched
        data.forEach(waiter => {
            const { weekday, username } = waiter;
            if (availability[weekday]) {
                availability[weekday].push(username);
            }
        });

        console.log(availability);

        let clearData = req.flash('clear')[0];

        res.render('admin', {
            weekdays,
            selectedDayId,
            availability,
            clearData
        });
    } catch (error) {
        console.error('Error in adminPage route:', error.message);
        res.status(500).send('Internal Server Error');
    }
}




  
    async function waiter(req, res) {
        try {
            const { username } = req.params;
    
            // Fetch the weekdays data from the database
            const weekdays = await dbLogic.showDays(); // You need to implement this function in dbLogic
    
            // Fetch the selected days for the current waiter
            const waiterId = await dbLogic.getWaiterId(username);
            const selectedDays = await dbLogic.getSelectedDaysForWaiter(waiterId);
    
            // Mark the selected days as checked in the weekdays array
            weekdays.forEach(day => {
                day.checked = selectedDays.includes(day.id);
            });
    
            let success = req.flash('success')[0];
            let error = req.flash('error')[0];
    
            res.render('waiter', {
                username,
                weekdays,
                success,
                error
            });
        } catch (error) {
            console.error('Error in waiter route:', error.message);
            res.status(500).send('Internal Server Error');
        }
    }
    
    
    
    
    async function addWaiter(req, res) {
        try {
            const { username } = req.params;
            const { days } = req.body;
    
            // Insert the waiter name if it doesn't exist
            await dbLogic.insertWaiterName(username);
    
            // Get the waiter ID based on the waiter's name
            const waiterId = await dbLogic.getWaiterId(username);
            if(days.length < 3 || days.length > 5){
                req.flash('error',"Please choose between 3 to 5 days.");
                return res.redirect(`/waiters/${username}`);
            }
    
            // Check if waiterId is valid
            if (!waiterId || isNaN(waiterId)) {
                console.error(`Invalid waiter ID found for '${username}'`);
                return res.status(500).send('Internal Server Error');
            }
    
            // console.log('Selected Days:', days);
    
            if (Array.isArray(days)) {
                // Iterate through selected days and add shifts
                for (const day of days) {
                    // Get the weekday ID based on the selected day
                    const weekdayId = await dbLogic.getWeekdayId(day);
    
                    // Check if weekdayId is valid
                    if (!weekdayId || isNaN(weekdayId)) {
                        console.error(`Invalid weekday ID found for '${day}'`);
                        return res.status(500).send('Internal Server Error');
                    }
    
                    // console.log(`Selected Day: ${day}, Weekday ID: ${weekdayId}`);
    
                    // Add the shift
                    await dbLogic.addShift(waiterId, weekdayId);
                }
            } else {
                // Uncomment this part
                const weekdayId = await dbLogic.getWeekdayId(days);
    
                // Check if weekdayId is valid
                if (!weekdayId || isNaN(weekdayId)) {
                    console.error(`Invalid weekday ID found for '${days}'`);
                    return res.status(500).send('Internal Server Error');
                }
    
                // Add the shift
                await dbLogic.addShift(waiterId, weekdayId);
            }
    
            // Set success flash message
            req.flash('success', 'Waiter and shifts added successfully');
    
            // Redirect to the waiter page after adding shifts
            res.redirect(`/waiters/${username}`);
        } catch (error) {
            console.error('Error in addWaiter:', error.message);
            // Handle the error and send an appropriate response
            res.status(500).send('Internal Server Error');
        }
    }
    
    



    return {
        home,
        clear,
        adminPage,
        waiter,
        addWaiter
    }
}