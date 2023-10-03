export default function routes(dbLogic, frontEndLogic) {
    //dbLogic must be a paramter



    async function adminPage(req, res) {


        res.render('admin'
        )

    }
    async function waiter(req, res) {



        res.render('waiter')
    }

    async function addWaiter(req, res) {
        const username = req.body.username;
        const selectedDays = req.body.availability || []; // Assuming availability is the name of the checkbox group


        await dbLogic.insertWaiterName(username, selectedDays);
        // res.redirect('/waiter')

    }




    return {
        // login,
        adminPage,
        waiter,
        addWaiter
    }
}