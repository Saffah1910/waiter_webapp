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

      const numberOfPeople = {};
      for (const day in availability) {
        if (availability.hasOwnProperty(day)) {
          const numberOfPeopleInDay = availability[day].x.length;
          numberOfPeople[day] = numberOfPeopleInDay;
        }
      }

 

      async function dayClasses(dayName) {
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

      const weekdays = await dbLogic.showDays();

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
        req.flash('error', 'Please enter a valid username.');
        res.redirect(`/waiters/${username}`);
        return;
      }
  
      if (!frontEndLogic.isValidDaySelection(days)) {
        req.flash('error', 'Please choose between 3 to 5 days.');
        res.redirect(`/waiters/${username}`);
        return;
      }
  
      // Validate and insert waiter
      let waiterId;
      try {
        // Check if the waiter already exists
        waiterId = await dbLogic.getWaiterId(username);
        if (!waiterId || isNaN(waiterId)) {
          // Insert the waiter
          await dbLogic.insertWaiterName(username);
          waiterId = await dbLogic.getWaiterId(username);
        }
      } catch (error) {
        console.error(`Error in validateAndInsertWaiter: ${error.message}`);
        return res.status(500).send('Internal Server Error');
      }
  
      // Remove existing shifts for the waiter
      await dbLogic.removeShiftsForWaiter(waiterId);
  
      // Add new shifts
      const daysArray = Array.isArray(days) ? days : [days];
      for (const day of daysArray) {
        const weekdayId = await dbLogic.getWeekdayId(day);
  
        if (!weekdayId || isNaN(weekdayId)) {
          console.error(`Invalid weekday ID found for '${day}'`);
          return res.status(500).send('Internal Server Error');
        }
  
        await dbLogic.addShift(waiterId, weekdayId);
      }
  
      // Set success flash message
      req.flash('success', 'Waiter and shifts added/updated successfully');
      res.redirect(`/waiters/${username}`);
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