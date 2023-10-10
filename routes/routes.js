export default function routes(dbLogic, frontEndLogic) {
    //dbLogic must be a paramter



    async function adminPage(req, res) {
        res.render('admin'
        )
    }


    async function fetchAndMarkWeekdays(req,username) {
        const weekdays = await dbLogic.showDays();
        const waiterId = await dbLogic.getWaiterId(username);
        const selectedDays = await dbLogic.getSelectedDaysForWaiter(waiterId);
    
        weekdays.forEach(day => {
            day.checked = selectedDays.includes(day.id);
        });
    
        return { weekdays, success: req.flash('success')[0] };
    }
    
    async function waiter(req, res) {
        try {
            const { username } = req.params;
    
            // Fetch the weekdays data from the database
            const weekdays = await dbLogic.showDays();
    
            // Fetch the selected days for the current waiter
            const waiterId = await dbLogic.getWaiterId(username);
            const selectedDays = await dbLogic.getSelectedDaysForWaiter(waiterId);
    
            // Mark the selected days as checked in the weekdays array
            weekdays.forEach(day => {
                day.checked = selectedDays.includes(day.id);
            });
    
            // Retrieve the success flash message
            let success = req.flash('success')[0];
    
            res.render('waiter', {
                username,
                weekdays,
                success, // Assuming you're using flash messages for success
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
    
            const { weekdays, success } = await fetchAndMarkWeekdays(req, username);
    
            // Insert the waiter name if it doesn't exist
            await dbLogic.insertWaiterName(username);
    
            // Get the waiter ID based on the waiter's name
            const waiterId = await dbLogic.getWaiterId(username);
    
            // Check if waiterId is valid
            if (!waiterId || isNaN(waiterId)) {
                console.error(`Invalid waiter ID found for '${username}'`);
                return res.status(500).send('Internal Server Error');
            }
    
            console.log('Selected Days:', days);
    
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
    
                    console.log(`Selected Day: ${day}, Weekday ID: ${weekdayId}`);
    
                    // Add the shift
                    await dbLogic.addShift(waiterId, weekdayId);
                }
            } else {
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
    
            // Fetch the updated selected days for rendering
            const updatedSelectedDays = await dbLogic.getSelectedDaysForWaiter(waiterId);
    
            res.render('waiter', {
                username,
                weekdays,
                selectedDays: updatedSelectedDays,
                success,
            });
        } catch (error) {
            console.error('Error in addWaiter:', error.message);
            // Handle the error and send an appropriate response
            res.status(500).send('Internal Server Error');
        }

        console.log(req.flash());
    }
    
    



    return {
        fetchAndMarkWeekdays,
        adminPage,
        waiter,
        addWaiter
    }
}