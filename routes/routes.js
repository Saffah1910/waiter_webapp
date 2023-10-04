export default function routes(dbLogic, frontEndLogic) {
    //dbLogic must be a paramter



    async function adminPage(req, res) {
        res.render('admin'
        )
    }
    async function waiter(req, res) {
        let success = req.flash('success')[0];

        res.render('waiter', {
            success
        })
    }
    async function login (req,res){
        res.render('login')
    }
    async function handleLogin(req, res) {

        console.log("login works!!");
        const { username, password } = req.body;
    
        // Implement authentication logic (check against a database, for example)
        const isAuthenticated = /* Your authentication logic here */ true;
    
        if (isAuthenticated) {
            // Set session to indicate the user is logged in
            req.session.isAuthenticated = true;
            req.session.username = username;
    
            // Redirect to a protected page (e.g., dashboard)
            res.redirect('/waiter');
        } else {
            // Redirect to the login page with an error message
            req.flash('error', 'Invalid username or password');
            res.redirect('/login');
        }
    }
    

    async function addWaiter(req, res) {
        const username = req.body.username;
        const selectedDays = req.body.availability || [];
        // Insert the waiter name if it doesn't exist
        await dbLogic.insertWaiterName(username);
        // Get the waiter ID based on the waiter's name
        const waiterId = await dbLogic.getWaiterId(username);
        console.log(selectedDays)

        if (Array.isArray(selectedDays)) {

            // Iterate through selected days and add shifts
            for (const day of selectedDays) {
                // Get the weekday ID based on the selected day
                const weekdayId = await dbLogic.getWeekdayId(day);
                console.log(weekdayId)

                // Add the shift
                await dbLogic.addShift(waiterId, weekdayId);
            }
        } else {
            const weekdayId = await dbLogic.getWeekdayId(selectedDays);

            // Add the shift
            await dbLogic.addShift(waiterId, weekdayId);
        }
        // Set success flash message
        req.flash('success', 'Waiter and shifts added successfully');
        res.redirect('/waiter')


    }




    return {
        login,
        handleLogin,
        adminPage,
        waiter,
        addWaiter
    }
}