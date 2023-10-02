import express from 'express';
import { engine } from 'express-handlebars';
import bodyParser from 'body-parser';
import flash from 'express-flash';
import session from 'express-session';
import pgPromise from 'pg-promise';
import 'dotenv/config';

//import frontend . databas queries, routes
import frontendWaiters from './frontEnd.js'



const connectionString = process.env.DATABASE_URL;
const pgp = pgPromise();
const db = pgp(connectionString);

const app = express();
//create instance for frontend . databas queries, routes
const frontEndLogic = frontendWaiters(db);



app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));
app.use(flash());

app.get('/', async function home(req, res) {
    res.render('admin');
});

//Show waiters a screen where they can select the days they can work
app.get('/waiters/:username', (req, res) => {
    const username = req.params.username;
    res.render('waiter-form', { username });
  });


// Send the days the waiter can work to the server.
app.post('/waiters/:username', (req, res) => {
    const username = req.params.username;
    const selectedDays = req.body.days || [];
  
    // Process the selected days (e.g., save to the database)
  
    // Render a response (e.g., a confirmation page)
    res.render('confirmation', { username, selectedDays });
  })

// 	Show your sister which days waiters are available
app.get('/days');

app.get('/waiter', async function waiter(req,res){
    res.render('waiter')
})



const PORT = process.env.PORT || 3001;

app.listen(PORT, function () {
    console.log("App started at port", PORT);
});