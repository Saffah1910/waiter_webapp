export default function routes(dbLogic, frontEndLogic) {
  //dbLogic must be a paramter
  // Inside your routes file
  async function home(req, res) {
    res.redirect('/days')
  }



  async function adminPage(req, res) {
    const dayWaitersCount = {};
    try {
      const availability = {
        "Monday": { x: [], stats: "" },
        "Tuesday": { x: [], stats: "" },
        "Wednesday": { x: [], stats: "" },
        "Thursday": { x: [], stats: "" },
        "Friday": { x: [], stats: "" },
        "Saturday": { x: [], stats: "" },
        "Sunday": { x: [], stats: "" }
      };


      const weekdays = await dbLogic.showDays();

      const data = await dbLogic.getWaitersForDay();

      // Populate the availability object based on the data fetched
      await Promise.all(data.map(async (waiter) => {
        const { weekday, username } = waiter;
        if (availability[weekday]) {
          availability[weekday].x.push(username);

          // Wait for the Promise to resolve before assigning to stats
          availability[weekday].stats = await dayClasses(weekday);
        }
      }));
      console.log(availability);

      const numberOfPeople = {};
      for (const day in availability) {
        if (availability.hasOwnProperty(day)) {
          const numberOfPeopleInDay = availability[day].x.length;
          numberOfPeople[day] = numberOfPeopleInDay;
        }
      }

      // Log the result
      console.log(numberOfPeople);

      async function dayClasses(dayName) {
        // Instead of dayWaitersCount, use availability[dayName].x.length
        const numberOfWaiters = availability[dayName].x.length;

        if (numberOfWaiters > 3) {
          return 'red';
        } else if (numberOfWaiters === 3) {
          return 'green';
        } else {
          return 'orange';
        }
      }

      let shifts = [];

      weekdays.forEach(dayName => {
        let shift = {
          shift_day: dayName,
          waiters: []
        };
        shifts.push(shift);
      });

      const clearData = req.flash('clearSucesss')[0];

      // Pass the dayClasses function itself, not the result
      res.render('admin', {
        weekdays,
        availability,
        clearData,
        dayClasses,
        shifts,
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
      let invalidName = req.flash('invalid')[0];
      console.log(error);

      res.render('waiter', {
        username,
        weekdays,
        success,
        invalidName,
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

      const validUsername = frontEndLogic.checkUsername(username);
      if (!validUsername) {
        req.flash('error', "Please enter valid username.");  
        //after the message it mst then go back to the waiter page   
        res.redirect(`/waiters/${username}`);
        }
      else {
        await dbLogic.insertWaiterName(username);

        // Get the waiter ID based on the waiter's name
        const waiterId = await dbLogic.getWaiterId(username);
        if (days.length < 3 || days.length > 5) {
          req.flash('error', "Please choose between 3 to 5 days.");
          return res.redirect(`/waiters/${username}`);
        }

        // Check if waiterId is valid
        if (!waiterId || isNaN(waiterId)) {
          console.error(`Invalid waiter ID found for '${username}'`);
          return res.status(500).send('Internal Server Error');
        }

        // Remove existing shifts for the waiter
        await dbLogic.removeShiftsForWaiter(waiterId);

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
        req.flash('success', 'Waiter and shifts added/updated successfully');

        res.redirect(`/waiters/${username}`);
      }
    } catch (error) {
      console.error('Error in addWaiter:', error.message);
      res.status(500).send('Internal Server Error');
    }
  }

  async function clear(req, res) {
    await dbLogic.clearWeekshifts();
    req.flash('clearSucesss', 'The weekly data has been cleared');
    console.log('Flash message set:', req.flash('clear'));
    res.redirect('/days');
  }


  return {
    home,
    clear,
    adminPage,
    waiter,
    addWaiter
  };
}